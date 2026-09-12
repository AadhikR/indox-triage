$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$iconDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) "chrome-extension\icons"
$sizes = 16, 32, 48, 128

foreach ($size in $sizes) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(17, 17, 17))
  $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $font = [System.Drawing.Font]::new("Segoe UI", [single]($size * 0.54), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()

  try {
    $bitmap.SetResolution(96, 96)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $inset = [single]([Math]::Max(1, $size * 0.03))
    $diameter = [single]($size * 0.46)
    $edge = [single]($size - (2 * $inset))
    $path.AddArc($inset, $inset, $diameter, $diameter, 180, 90)
    $path.AddArc($inset + $edge - $diameter, $inset, $diameter, $diameter, 270, 90)
    $path.AddArc($inset + $edge - $diameter, $inset + $edge - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($inset, $inset + $edge - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)

    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textArea = [System.Drawing.RectangleF]::new(0, [single](-$size * 0.02), $size, $size)
    $graphics.DrawString("IT", $font, $textBrush, $textArea, $format)

    $outputPath = Join-Path $iconDirectory "icon-$size.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $format.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
    $brush.Dispose()
    $path.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

Write-Output "Generated extension icons: $($sizes -join ', ') px"
