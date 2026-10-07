[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\silk-route-premium-hero'
$rawRoot = Join-Path $artifactRoot 'raw'
$assemblyRoot = Join-Path $artifactRoot '_assembly-photographer-original'
$sourceImage = Join-Path $projectRoot 'assets\source\client-photography\DSC09206-1-original.jpg'

$desktopPrevious = Join-Path $artifactRoot 'silk-route-premium-22s-master-v3-hotel-closing.mp4'
$mobilePrevious = Join-Path $artifactRoot 'silk-route-premium-mobile-22s-master-v3-hotel-closing.mp4'
$desktopScene = Join-Path $rawRoot '07-photographer-cabin-view-1080p.mp4'
$mobileScene = Join-Path $rawRoot '07-photographer-cabin-view-mobile.mp4'
$desktopFinal = Join-Path $artifactRoot 'silk-route-premium-22s-master-v4-photographer-original.mp4'
$mobileFinal = Join-Path $artifactRoot 'silk-route-premium-mobile-22s-master-v4-photographer-original.mp4'

foreach ($required in @($sourceImage, $desktopPrevious, $mobilePrevious)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required source is missing: $required"
    }
}

New-Item -ItemType Directory -Force -Path $rawRoot, $assemblyRoot | Out-Null

function Invoke-Ffmpeg {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & ffmpeg @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed with exit code $LASTEXITCODE"
    }
}

function Invoke-Assembly {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Previous,
        [Parameter(Mandatory)][string]$Scene,
        [Parameter(Mandatory)][string]$Destination
    )

    $work = Join-Path $assemblyRoot $Name
    New-Item -ItemType Directory -Force -Path $work | Out-Null

    Push-Location $work
    try {
        # Copy exactly 312 frames (13 seconds at 24 fps). A time-based stream
        # copy can retain two B-frames beyond the boundary and produce 22.083s.
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', $Previous, '-frames:v', '312', '-map', '0:v:0', '-an', '-c:v', 'copy', 'front.mp4')
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-ss', '18', '-i', $Previous, '-t', '4', '-map', '0:v:0', '-an', '-c:v', 'copy', '-avoid_negative_ts', 'make_zero', 'closing.mp4')

        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', 'front.mp4', '-map', '0:v:0', '-an', '-c:v', 'copy', '-bsf:v', 'h264_mp4toannexb', '-f', 'mpegts', 'front.ts')
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', $Scene, '-map', '0:v:0', '-an', '-c:v', 'copy', '-bsf:v', 'h264_mp4toannexb', '-f', 'mpegts', 'scene.ts')
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', 'closing.mp4', '-map', '0:v:0', '-an', '-c:v', 'copy', '-bsf:v', 'h264_mp4toannexb', '-f', 'mpegts', 'closing.ts')
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', 'concat:front.ts|scene.ts|closing.ts', '-map', '0:v:0', '-an', '-c:v', 'copy', '-movflags', '+faststart', '-video_track_timescale', '12288', $Destination)
    }
    finally {
        Pop-Location
    }
}

function New-ContactSheet {
    param(
        [Parameter(Mandatory)][string]$InputFile,
        [Parameter(Mandatory)][string]$OutputFile,
        [Parameter(Mandatory)][int]$Width,
        [Parameter(Mandatory)][int]$Height,
        [Parameter(Mandatory)][string[]]$Times,
        [Parameter(Mandatory)][string]$Name
    )

    $thumbRoot = Join-Path $assemblyRoot "contact-$Name"
    New-Item -ItemType Directory -Force -Path $thumbRoot | Out-Null
    $thumbs = @()

    for ($index = 0; $index -lt $Times.Count; $index++) {
        $thumb = Join-Path $thumbRoot ("{0:D2}.jpg" -f $index)
        Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-ss', $Times[$index], '-i', $InputFile, '-frames:v', '1', '-vf', "scale=${Width}:${Height}:flags=lanczos", $thumb)
        $thumbs += $thumb
    }

    $arguments = @('-y', '-loglevel', 'error')
    foreach ($thumb in $thumbs) {
        $arguments += @('-i', $thumb)
    }
    $arguments += @('-filter_complex', '[0:v][1:v][2:v][3:v][4:v]hstack=inputs=5', '-frames:v', '1', $OutputFile)
    Invoke-Ffmpeg $arguments
}

# Ease every move with smoothstep. The desktop begins on the untouched cabin
# composition and moves toward the coastal view itself. The portrait version
# starts inside the doorway and moves only slightly, preventing the door frame
# from becoming the mobile focal point.
$smooth = '(on/119)*(on/119)*(3-2*(on/119))'
$desktopFilter = "crop=7008:3942:0:365,zoompan=z='1+1.6*$smooth':x='3504-454*$smooth-iw/(2*zoom)':y='1971+364*$smooth-ih/(2*zoom)':d=1:s=1920x1080:fps=24,format=yuv420p,setsar=1"
$mobileFilter = "crop=2000:3556:2050:300,zoompan=z='1+0.111111*$smooth':x='1000+50*$smooth-iw/(2*zoom)':y='1778-128*$smooth-ih/(2*zoom)':d=1:s=720x1280:fps=24,format=yuv420p,setsar=1"

Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-loop', '1', '-framerate', '24', '-i', $sourceImage, '-vf', $desktopFilter, '-frames:v', '120', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level:v', '5.0', '-g', '240', '-keyint_min', '240', '-sc_threshold', '0', '-video_track_timescale', '12288', '-movflags', '+faststart', $desktopScene)
Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-loop', '1', '-framerate', '24', '-i', $sourceImage, '-vf', $mobileFilter, '-frames:v', '120', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level:v', '3.1', '-g', '240', '-keyint_min', '240', '-sc_threshold', '0', '-video_track_timescale', '12288', '-movflags', '+faststart', $mobileScene)

Copy-Item -LiteralPath $desktopPrevious -Destination (Join-Path $artifactRoot 'hero-silk-route-premium-22s-before-photographer-original-backup.mp4') -Force
Copy-Item -LiteralPath $mobilePrevious -Destination (Join-Path $artifactRoot 'hero-silk-route-premium-mobile-22s-before-photographer-original-backup.mp4') -Force

Invoke-Assembly -Name 'desktop' -Previous $desktopPrevious -Scene $desktopScene -Destination $desktopFinal
Invoke-Assembly -Name 'mobile' -Previous $mobilePrevious -Scene $mobileScene -Destination $mobileFinal

Copy-Item -LiteralPath $desktopFinal -Destination (Join-Path $artifactRoot 'silk-route-premium-22s-master.mp4') -Force
Copy-Item -LiteralPath $desktopFinal -Destination (Join-Path $projectRoot 'assets\video\hero-silk-route-premium.mp4') -Force
Copy-Item -LiteralPath $mobileFinal -Destination (Join-Path $projectRoot 'assets\video\hero-silk-route-premium-mobile.mp4') -Force

Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', $desktopScene, '-vf', "select='eq(n,0)+eq(n,30)+eq(n,60)+eq(n,90)+eq(n,119)',scale=384:216:flags=lanczos,tile=5x1", '-frames:v', '1', (Join-Path $artifactRoot 'photographer-cabin-scene-desktop-contact-sheet.jpg'))
Invoke-Ffmpeg @('-y', '-loglevel', 'error', '-i', $mobileScene, '-vf', "select='eq(n,0)+eq(n,30)+eq(n,60)+eq(n,90)+eq(n,119)',scale=180:320:flags=lanczos,tile=5x1", '-frames:v', '1', (Join-Path $artifactRoot 'photographer-cabin-scene-mobile-contact-sheet.jpg'))
New-ContactSheet -InputFile $desktopFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-22s-photographer-original-contact-sheet.jpg') -Width 480 -Height 270 -Times @('1.5', '6.5', '11', '15.5', '20.5') -Name 'desktop'
New-ContactSheet -InputFile $mobileFinal -OutputFile (Join-Path $artifactRoot 'silk-route-premium-mobile-22s-photographer-original-contact-sheet.jpg') -Width 180 -Height 320 -Times @('1.5', '6.5', '11', '15.5', '20.5') -Name 'mobile'

Write-Output $desktopFinal
Write-Output $mobileFinal
