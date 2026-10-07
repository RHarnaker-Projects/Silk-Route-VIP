[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\silk-route-premium-hero'
$portraitRoot = Join-Path $artifactRoot 'higgsfield-mobile-portrait'

$previousMobile = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-master-v7-restored-cabin-view.mp4'
$roadScene = Join-Path $portraitRoot '01-road-wide-9x16-seedance25.mp4'
$cabinScene = Join-Path $portraitRoot '07-cabin-closed-inside-9x16-seedance25.mp4'
$oceanCabinScene = Join-Path $portraitRoot '03-ocean-cabin-wide-9x16-seedance25.mp4'
$hotelScene = Join-Path $portraitRoot '13-hotel-porte-cochere-arrival-9x16-seedance25.mp4'

$master = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-master-v12-safe-arrival.mp4'
$siteVideo = Join-Path $projectRoot 'assets\video\hero-silk-route-premium-mobile-v12-portrait-web.mp4'
$contactSheet = Join-Path $artifactRoot 'silk-route-premium-mobile-25s-v12-safe-arrival-contact-sheet.jpg'

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

# Exactly 25 seconds, preserving the approved narrative while correcting the
# mobile arrival endpoint:
# 0-4s Cape ocean opening from the established portrait master
# 4-6.5s toward-camera vehicle approach, held 2.5x longer at a restrained speed
# 6-10.5s mountain-road follow, joined by a subtle 0.5s dissolve
# 10.5-15s closed moving cabin filmed entirely from inside the vehicle
# 15-20s cabin view opening onto ocean and mountains
# 20-23.5s porte-cochere arrival, ending with comfortable curb/door clearance
# 23.5-25s the final safe frame is held so the vehicle reads as deliberately stopped
$filter = @(
    '[0:v]trim=start=0:end=4,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,settb=AVTB,format=yuv420p[v0a]'
    '[0:v]trim=start=4:end=5,setpts=2.5*(PTS-STARTPTS),fps=24,trim=start=0:end=2.5,setpts=PTS-STARTPTS,scale=720:1280:flags=lanczos,setsar=1,settb=AVTB,format=yuv420p[v0b]'
    '[v0a][v0b]concat=n=2:v=1:a=0,settb=AVTB[v0]'
    '[1:v]trim=start=0:end=4.5,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,settb=AVTB,format=yuv420p[v1]'
    '[v0][v1]xfade=transition=fade:duration=0.5:offset=6,fps=24,setpts=PTS-STARTPTS,setsar=1,format=yuv420p[journey]'
    '[2:v]trim=start=0.25:end=4.75,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v2]'
    '[3:v]trim=start=0:end=5,setpts=PTS-STARTPTS,fps=24,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p[v3]'
    '[4:v]fps=24,trim=start_frame=0:end_frame=85,setpts=PTS-STARTPTS,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p,tpad=stop_mode=clone:stop=35,trim=start_frame=0:end_frame=120,setpts=PTS-STARTPTS[v4]'
    '[journey][v2][v3][v4]concat=n=4:v=1:a=0[outv]'
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
    '-vf', "select='eq(n,36)+eq(n,90)+eq(n,126)+eq(n,144)+eq(n,240)+eq(n,324)+eq(n,420)+eq(n,540)+eq(n,564)+eq(n,588)+eq(n,599)',scale=180:320:flags=lanczos,tile=11x1",
    '-frames:v', '1',
    $contactSheet
)

Invoke-Ffmpeg @('-v', 'error', '-i', $siteVideo, '-f', 'null', 'NUL')

Write-Output $master
Write-Output $siteVideo
Write-Output $contactSheet
