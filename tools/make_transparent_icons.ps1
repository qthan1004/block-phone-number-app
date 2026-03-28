Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Quoc Thanh\.gemini\antigravity\brain\b1065d92-c51d-4587-8306-4795bbaa2df3\call_blocker_icon_1774688338563.png"
$image = [System.Drawing.Image]::FromFile($srcPath)

# 1. Create a transparent circular version
$bmpCircle = New-Object System.Drawing.Bitmap $image.Width, $image.Height
$gCircle = [System.Drawing.Graphics]::FromImage($bmpCircle)
$gCircle.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gCircle.Clear([System.Drawing.Color]::Transparent)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $image.Width, $image.Height)
$gCircle.SetClip($path)
$gCircle.DrawImage($image, 0, 0)

# 2. Resize into mipmap folders
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
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($bmpCircle, 0, 0, $size, $size)
    
    $folderPath = "d:\workspace\block-phone-number-app\android\app\src\main\res\$folder"
    $path1 = "$folderPath\ic_launcher.png"
    $path2 = "$folderPath\ic_launcher_round.png"
    $bmp.Save($path1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($path2, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# 3. Create Splash Icon
$bmpSplash = New-Object System.Drawing.Bitmap 512, 512
$gSplash = [System.Drawing.Graphics]::FromImage($bmpSplash)
$gSplash.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSplash.Clear([System.Drawing.Color]::Transparent)
$gSplash.DrawImage($bmpCircle, 0, 0, 512, 512)
$splashPath = "d:\workspace\block-phone-number-app\android\app\src\main\res\drawable\splash_icon.png"
$bmpSplash.Save($splashPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gSplash.Dispose()
$bmpSplash.Dispose()

$gCircle.Dispose()
$bmpCircle.Dispose()
$image.Dispose()

Write-Host "Done transparent circular icons!"
