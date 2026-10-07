[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\silk-route-premium-hero'
$portraitRoot = Join-Path $artifactRoot 'higgsfield-mobile-portrait'

$previousMobile = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-master-v7-restored-cabin-view.mp4'
$roadScene = Join-Path $portraitRoot '01-road-wide-9x16-seedance25.mp4'
$cabinScene = Join-Path $portraitRoot '02b-client-cabin-faithful-9x16-seedance25.mp4'
$oceanCabinScene = Join-Path $portraitRoot '03-ocean-cabin-wide-9x16-seedance25.mp4'
$hotelScene = Join-Path $portraitRoot '04-hotel-wide-9x16-seedance25.mp4'

$master = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-master-v9-true-portrait.mp4'
$siteVideo = Join-Path $projectRoot 'assets\video\hero-silk-route-premium-mobile-v9-portrait-web.mp4'
$contactSheet = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-v9-true-portrait-contact-sheet.jpg'

foreach ($required in @($previousMobile, $roadScene, $cabinScene, $oceanCabinScene, $hotelScene)) {
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

# Exactly 25 seconds, preserving the approved narrative:
# 0-5s Cape Town opening from the established portrait master
# 5-11s new wide 9:16 coastal road and mountain journey, gently slowed
# so the mobile cut never falls back to a tight fender/door crop
# 11-15s faithful two-seat client cabin in motion
# 15-20s open cabin view onto ocean and mountains
# 20-25s wide One&Only Cape Town arrival
$filter = @(
    '[0:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v0]'
    '[1:v]trim=start=0:end=5,setpts=1.2*(PTS-STARTPTS),fps=24,trim=start=0:end=6,setpts=PTS-STARTPTS,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v1]'
    '[2:v]trim=start=0.25:end=4.25,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v2]'
    '[3:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v3]'
    '[4:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v4]'
    '[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]'
) -join ';'

$encode = @(
    '-y', '-loglevel', 'error',
    '-i', $previousMobile,
    '-i', $roadScene,
    '-i', $cabinScene,
    '-i', $oceanCabinScene,
    '-i', $hotelScene,
    '-filter_complex', $filter,
    '-map', '[outv]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '21',
    '-profile:v', 'high',
    '-level:v', '4.0',
    '-g', '48',
    '-keyint_min', '48',
    '-sc_threshold', '0',
    '-video_track_timescale', '12288',
    '-movflags', '+faststart',
    '-t', '25'
)

Invoke-Ffmpeg ($encode + @($master))
Copy-Item -LiteralPath $master -Destination $siteVideo -Force

Invoke-Ffmpeg @(
    '-y', '-loglevel', 'error',
    '-i', $master,
    '-vf', "select='eq(n,36)+eq(n,156)+eq(n,252)+eq(n,312)+eq(n,420)+eq(n,540)',scale=180:320:flags=lanczos,tile=6x1",
    '-frames:v', '1',
    $contactSheet
)

# Fail the build if any frame in the final asset cannot be decoded.
Invoke-Ffmpeg @('-v', 'error', '-i', $siteVideo, '-f', 'null', 'NUL')

Write-Output $master
Write-Output $siteVideo
Write-Output $contactSheet
