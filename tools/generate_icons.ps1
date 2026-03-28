Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile("C:\Users\Quoc Thanh\.gemini\antigravity\brain\b1065d92-c51d-4587-8306-4795bbaa2df3\call_blocker_icon_1774688338563.png")

$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    # High quality resize
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($image, 0, 0, $size, $size)
    
    $folderPath = "d:\workspace\block-phone-number-app\android\app\src\main\res\$folder"
    if (-Not (Test-Path $folderPath)) { New-Item -ItemType Directory -Path $folderPath | Out-Null }
    
    $path = "$folderPath\ic_launcher.png"
    $pathRound = "$folderPath\ic_launcher_round.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($pathRound, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$bmpSplash = New-Object System.Drawing.Bitmap 512, 512
$gSplash = [System.Drawing.Graphics]::FromImage($bmpSplash)
$gSplash.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSplash.DrawImage($image, 0, 0, 512, 512)
$dir = "d:\workspace\block-phone-number-app\android\app\src\main\res\drawable"
if (-Not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$splashPath = "$dir\splash_icon.png"
$bmpSplash.Save($splashPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gSplash.Dispose()
$bmpSplash.Dispose()

$image.Dispose()
Write-Host "Icons generated successfully!"
