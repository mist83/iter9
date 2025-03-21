# PowerShell script to package a Chrome extension

# Set paths
$ProjectRoot = $PSScriptRoot
$SrcDir = "$ProjectRoot\src"
$BuildDir = "$ProjectRoot\build"
$DistDir = "$ProjectRoot\dist"
$UnpackedDir = "$DistDir\scrapegoat"
$ZipOutput = "$DistDir\scrapegoat.zip"
$CrxOutput = "$DistDir\scrapegoat.crx"
$ChromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$PrivateKey = "$ProjectRoot\scrapegoat.pem"

# Generate .pem file if missing
if (!(Test-Path $PrivateKey)) {
    Write-Host "No .pem key found. Generating one with OpenSSL..."
    $opensslCheck = & openssl version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "OpenSSL not found. Please install it and ensure it's in your PATH."
        exit 1
    }

    & openssl genrsa -out $PrivateKey 2048
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to generate .pem key."
        exit 1
    } else {
        Write-Host "Generated new PEM key at: $PrivateKey"
    }
}

# Ensure build and dist directories exist
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
New-Item -ItemType Directory -Path $BuildDir | Out-Null
if (!(Test-Path $DistDir)) { New-Item -ItemType Directory -Path $DistDir | Out-Null }
if (Test-Path $UnpackedDir) { Remove-Item -Recurse -Force $UnpackedDir }
New-Item -ItemType Directory -Path $UnpackedDir | Out-Null

Write-Host "Copying files to build directory..."
Copy-Item -Path "$SrcDir\*" -Destination $BuildDir -Recurse -Force

# (Optional) Minify JavaScript
Write-Host "Minifying JavaScript files..."
Get-ChildItem -Path $BuildDir -Filter "*.js" -Recurse | ForEach-Object {
    $fileContent = Get-Content $_.FullName -Raw
    $minifiedContent = $fileContent -replace "\s+", " "  # Simple minify (remove excessive spaces)
    Set-Content -Path $_.FullName -Value $minifiedContent
}

# (Optional) Modify manifest.json for production
$manifestPath = "$BuildDir\manifest.json"
if (Test-Path $manifestPath) {
    Write-Host "Updating manifest.json for production..."
    $manifestJson = Get-Content $manifestPath -Raw | ConvertFrom-Json
    $manifestJson.name = "Scrapegoat"  # Ensure proper name
    $manifestJson.version = "1.0.0"  # Set version if needed
    $manifestJson | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath
}

# Copy build to dist/unpacked for Developer Mode installation
Write-Host "Creating unpacked extension directory..."
Copy-Item -Path "$BuildDir\*" -Destination $UnpackedDir -Recurse -Force
Write-Host "Unpacked extension is ready at: $UnpackedDir"

# Create a .zip file for easy sharing
Write-Host "Creating ZIP archive..."
if (Test-Path $ZipOutput) { Remove-Item -Force $ZipOutput }
Compress-Archive -Path "$UnpackedDir\*" -DestinationPath $ZipOutput -Force
Write-Host "ZIP archive created: $ZipOutput"

# Pack the extension into a .crx (optional)
Write-Host "Packing Chrome extension..."
if (Test-Path $ChromeExe) {
    Start-Process -FilePath $ChromeExe -ArgumentList "--pack-extension=`"$BuildDir`" --pack-extension-key=`"$PrivateKey`"" -Wait

    # Find and move the .crx file
    $crxSource = "$ProjectRoot\build.crx"
    if (Test-Path $crxSource) {
        Move-Item -Path $crxSource -Destination $CrxOutput -Force
        Write-Host "CRX extension packaged successfully: $CrxOutput"
    } else {
        Write-Host "CRX file was not created. Check manifest or Chrome output."
    }
} else {
    Write-Host "❌hrome executable not found. Please check your installation."
}

Write-Host "All tasks completed successfully!"
