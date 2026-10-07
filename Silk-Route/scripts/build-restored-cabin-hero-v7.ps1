[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\silk-route-premium-hero'
$browserRoot = Join-Path $artifactRoot 'higgsfield-browser-720'
$nativeRoot = Join-Path $artifactRoot 'higgsfield-native-1080'

$desktopPrevious = Join-Path $artifactRoot 'silk-route-premium-22s-master-v4-photographer-original.mp4'
$mobilePrevious = Join-Path $artifactRoot 'silk-route-premium-mobile-22s-master-v4-photographer-original.mp4'
$clientCabinScene = Join-Path $browserRoot 'client-cabin-upscaled-1080p.mp4'
$oceanCabinScene = Join-Path $nativeRoot 'cabin-dolly-native-1080p.mp4'
$hotelScene = Join-Path $browserRoot 'one-and-only-correct-driveway-arrival-upscaled-1080p.mp4'

$desktopFinal = Join-Path $artifactRoot 'silk-route-premium-25s-master-v7-restored-cabin-view.mp4'
$mobileFinal = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-master-v7-restored-cabin-view.mp4'

foreach ($required in @($desktopPrevious, $mobilePrevious, $clientCabinScene, $oceanCabinScene, $hotelScene)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required source is missing: $required"
    }
}

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
        '-vf', "select='eq(n,36)+eq(n,156)+eq(n,252)+eq(n,312)+eq(n,420)+eq(n,540)',$Scale,tile=6x1",
        '-frames:v', '1',
        $OutputFile
    )
}

# Exactly 25 seconds:
# 0-11s established Cape Town journey
# 11-15s client-requested cabin in motion
# 15-20s restored cabin dolly into the ocean-and-mountain view
# 20-25s corrected One&Only driveway arrival
$desktopFilter = @(
    '[0:v]trim=start=0:end=11,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v0]'
    '[1:v]trim=start=0.25:end=4.25,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v1]'
    '[2:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v2]'
    '[3:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v3]'
    '[v0][v1][v2][v3]concat=n=4:v=1:a=0[outv]'
) -join ';'

Invoke-Ffmpeg @(
    '-y', '-loglevel', 'error',
    '-i', $desktopPrevious,
    '-i', $clientCabinScene,
    '-i', $oceanCabinScene,
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
    '-t', '25',
    $desktopFinal
)

# The restored cabin view uses a central portrait crop that lets the right seat
# edge move out of frame while the ocean and mountains open up. It avoids the
# doorway-frame close-up that weakened the earlier mobile treatment.
$mobileFilter = @(
    '[0:v]trim=start=0:end=11,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v0]'
    '[1:v]trim=start=0.25:end=4.25,setpts=PTS-STARTPTS,fps=24,crop=608:1080:450:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v1]'
    '[2:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,crop=608:1080:600:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v2]'
    "[3:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,crop=608:1080:x='min(450,300+30*t)':y=0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v3]"
    '[v0][v1][v2][v3]concat=n=4:v=1:a=0[outv]'
) -join ';'

Invoke-Ffmpeg @(
    '-y', '-loglevel', 'error',
    '-i', $mobilePrevious,
    '-i', $clientCabinScene,
    '-i', $oceanCabinScene,
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
    '-t', '25',
    $mobileFinal
)

$desktopSite = Join-Path $projectRoot 'assets\video\hero-silk-route-premium.mp4'
$mobileSite = Join-Path $projectRoot 'assets\video\hero-silk-route-premium-mobile.mp4'
$desktopBackup = Join-Path $artifactRoot 'hero-silk-route-premium-before-restored-cabin-v7-backup.mp4'
$mobileBackup = Join-Path $artifactRoot 'hero-silk-route-premium-mobile-before-restored-cabin-v7-backup.mp4'

if (-not (Test-Path -LiteralPath $desktopBackup)) {
    Copy-Item -LiteralPath $desktopSite -Destination $desktopBackup
}
if (-not (Test-Path -LiteralPath $mobileBackup)) {
    Copy-Item -LiteralPath $mobileSite -Destination $mobileBackup
}

Copy-Item -LiteralPath $desktopFinal -Destination (Join-Path $artifactRoot 'silk-route-premium-master.mp4') -Force
Copy-Item -LiteralPath $desktopFinal -Destination $desktopSite -Force
Copy-Item -LiteralPath $mobileFinal -Destination $mobileSite -Force

New-ContactSheet -InputFile $desktopFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-25s-v7-contact-sheet.jpg') -Scale 'scale=400:225:flags=lanczos'
New-ContactSheet -InputFile $mobileFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-mobile-25s-v7-contact-sheet.jpg') -Scale 'scale=160:284:flags=lanczos'

Write-Output $desktopFinal
Write-Output $mobileFinal
