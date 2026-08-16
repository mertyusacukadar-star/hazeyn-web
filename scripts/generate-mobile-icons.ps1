param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\assets')
)

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function New-MobileIcon {
    param([int]$Size, [string]$Path)

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 8, 10, 14), [System.Drawing.Color]::FromArgb(255, 28, 31, 37), 45)
    $graphics.FillRectangle($background, $rect)

    $margin = [int]($Size * 0.105)
    $accentHeight = [int]($Size * 0.035)
    $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 218, 168, 61))
    $green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 105, 148, 49))
    $graphics.FillRectangle($gold, $margin, $margin, [int](($Size - 2 * $margin) / 2), $accentHeight)
    $graphics.FillRectangle($green, $margin + [int](($Size - 2 * $margin) / 2), $margin, [int](($Size - 2 * $margin) / 2), $accentHeight)

    $largeFont = New-Object System.Drawing.Font('Arial', [single]($Size * 0.245), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $smallFont = New-Object System.Drawing.Font('Arial', [single]($Size * 0.068), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 225, 228, 231))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $titleRect = New-Object System.Drawing.RectangleF([single]0, [single]($Size * 0.19), [single]$Size, [single]($Size * 0.46))
    $subtitleRect = New-Object System.Drawing.RectangleF([single]0, [single]($Size * 0.64), [single]$Size, [single]($Size * 0.14))
    $graphics.DrawString('H&H', $largeFont, $white, $titleRect, $format)
    $graphics.DrawString('TURİZM', $smallFont, $muted, $subtitleRect, $format)

    $dotSize = [int]($Size * 0.055)
    $graphics.FillEllipse($gold, [int]($Size * 0.39), [int]($Size * 0.82), $dotSize, $dotSize)
    $graphics.FillEllipse($green, [int]($Size * 0.555), [int]($Size * 0.82), $dotSize, $dotSize)

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

    $format.Dispose(); $muted.Dispose(); $white.Dispose(); $smallFont.Dispose(); $largeFont.Dispose()
    $green.Dispose(); $gold.Dispose(); $background.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

New-MobileIcon 180 (Join-Path $OutputDirectory 'mobile-app-icon-180.png')
New-MobileIcon 192 (Join-Path $OutputDirectory 'mobile-app-icon-192.png')
New-MobileIcon 512 (Join-Path $OutputDirectory 'mobile-app-icon-512.png')
New-MobileIcon 1024 (Join-Path $OutputDirectory 'mobile-app-icon-1024.png')
