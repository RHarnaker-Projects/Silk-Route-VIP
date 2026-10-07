[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\silk-route-premium-hero'
$browserRoot = Join-Path $artifactRoot 'higgsfield-browser-720'
$assemblyRoot = Join-Path $artifactRoot '_assembly-browser-v6'

$desktopPrevious = Join-Path $artifactRoot 'silk-route-premium-22s-master-v4-photographer-original.mp4'
$mobilePrevious = Join-Path $artifactRoot 'silk-route-premium-mobile-22s-master-v4-photographer-original.mp4'
$cabinScene = Join-Path $browserRoot 'client-cabin-upscaled-1080p.mp4'
$hotelScene = Join-Path $browserRoot 'one-and-only-correct-driveway-arrival-upscaled-1080p.mp4'

$desktopFinal = Join-Path $artifactRoot 'silk-route-premium-20s-master-v6-browser-1080.mp4'
$mobileFinal = Join-Path $artifactRoot 'silk-route-premium-mobile-20s-master-v6-browser-1080.mp4'

foreach ($required in @($desktopPrevious, $mobilePrevious, $cabinScene, $hotelScene)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required source is missing: $required"
    }
}

New-Item -ItemType Directory -Force -Path $assemblyRoot | Out-Null

function Invoke-Ffmpeg {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & ffmpeg @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed with exit code $LASTEXITCODE"
    }
}

function New-ContactSheet {
    param(
        [Parameter(Mandatory)][string]$InputFile,
        [Parameter(Mandatory)][string]$OutputFile,
        [Parameter(Mandatory)][string]$Scale
    )

    Invoke-Ffmpeg @(
        '-y', '-loglevel', 'error',
        '-i', $InputFile,
        '-vf', "select='eq(n,36)+eq(n,156)+eq(n,252)+eq(n,348)+eq(n,444)',$Scale,tile=5x1",
        '-frames:v', '1',
        $OutputFile
    )
}

# Exactly 20 seconds: 0-11s established Cape Town journey, 11-15s the
# client-supplied cabin animated in Higgsfield, and 15-20s the corrected hotel
# driveway arrival. Both new scenes were generated at 720p and upscaled in
# Higgsfield to 1920x1080, 30fps before this 24fps web-master encode.
$desktopFilter = @(
    '[0:v]trim=start=0:end=11,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v0]'
    '[1:v]trim=start=0.25:end=4.25,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v1]'
    '[2:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v2]'
    '[v0][v1][v2]concat=n=3:v=1:a=0[outv]'
) -join ';'

Invoke-Ffmpeg @(
    '-y', '-loglevel', 'error',
    '-i', $desktopPrevious,
    '-i', $cabinScene,
    '-i', $hotelScene,
    '-filter_complex', $desktopFilter,
    '-map', '[outv]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '16',
    '-profile:v', 'high',
    '-level:v', '4.1',
    '-g', '48',
    '-keyint_min', '48',
    '-sc_threshold', '0',
    '-video_track_timescale', '12288',
    '-movflags', '+faststart',
    '-t', '20',
    $desktopFinal
)

# Portrait framing keeps a complete passenger seat and moving scenery in the
# cabin. During the hotel arrival it pans gently toward the driver window and
# porte-cochere while retaining the moving vehicle in frame.
$mobileFilter = @(
    '[0:v]trim=start=0:end=11,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v0]'
    '[1:v]trim=start=0.25:end=4.25,setpts=PTS-STARTPTS,fps=24,crop=608:1080:450:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v1]'
    "[2:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,crop=608:1080:x='min(450,300+30*t)':y=0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v2]"
    '[v0][v1][v2]concat=n=3:v=1:a=0[outv]'
) -join ';'

Invoke-Ffmpeg @(
    '-y', '-loglevel', 'error',
    '-i', $mobilePrevious,
    '-i', $cabinScene,
    '-i', $hotelScene,
    '-filter_complex', $mobileFilter,
    '-map', '[outv]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '16',
    '-profile:v', 'high',
    '-level:v', '4.1',
    '-g', '48',
    '-keyint_min', '48',
    '-sc_threshold', '0',
    '-video_track_timescale', '12288',
    '-movflags', '+faststart',
    '-t', '20',
    $mobileFinal
)

$desktopSite = Join-Path $projectRoot 'assets\video\hero-silk-route-premium.mp4'
$mobileSite = Join-Path $projectRoot 'assets\video\hero-silk-route-premium-mobile.mp4'
$desktopBackup = Join-Path $artifactRoot 'hero-silk-route-premium-before-browser-v6-backup.mp4'
$mobileBackup = Join-Path $artifactRoot 'hero-silk-route-premium-mobile-before-browser-v6-backup.mp4'

if (-not (Test-Path -LiteralPath $desktopBackup)) {
    Copy-Item -LiteralPath $desktopSite -Destination $desktopBackup
}
if (-not (Test-Path -LiteralPath $mobileBackup)) {
    Copy-Item -LiteralPath $mobileSite -Destination $mobileBackup
}

Copy-Item -LiteralPath $desktopFinal -Destination (Join-Path $artifactRoot 'silk-route-premium-20s-master.mp4') -Force
Copy-Item -LiteralPath $desktopFinal -Destination $desktopSite -Force
Copy-Item -LiteralPath $mobileFinal -Destination $mobileSite -Force

New-ContactSheet -InputFile $desktopFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-20s-browser-v6-contact-sheet.jpg') -Scale 'scale=480:270:flags=lanczos'
New-ContactSheet -InputFile $mobileFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-mobile-20s-browser-v6-contact-sheet.jpg') -Scale 'scale=180:320:flags=lanczos'

Write-Output $desktopFinal
Write-Output $mobileFinal
