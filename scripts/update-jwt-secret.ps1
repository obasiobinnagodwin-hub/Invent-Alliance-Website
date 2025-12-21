# PowerShell script to update JWT_SECRET in .env.local
# Usage: .\scripts\update-jwt-secret.ps1

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Run 'node scripts/setup-env.js' first to create it." -ForegroundColor Yellow
    exit 1
}

# Generate new JWT secret
Write-Host "Generating new secure JWT_SECRET..." -ForegroundColor Cyan
$jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Read existing content
$content = Get-Content $envFile -Raw

# Update JWT_SECRET
if ($content -match 'JWT_SECRET=') {
    $newContent = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
    Set-Content $envFile -Value $newContent -NoNewline
    Write-Host "`n✅ Successfully updated JWT_SECRET in .env.local" -ForegroundColor Green
} else {
    # Add JWT_SECRET if it doesn't exist
    $newContent = $content + "`n`n# JWT Secret (generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))`nJWT_SECRET=$jwtSecret`n"
    Set-Content $envFile -Value $newContent -NoNewline
    Write-Host "`n✅ Added JWT_SECRET to .env.local" -ForegroundColor Green
}

Write-Host "`n📝 New JWT_SECRET:" -ForegroundColor Cyan
Write-Host $jwtSecret -ForegroundColor Yellow
Write-Host "`n⚠️  Keep this secret secure and never commit it to version control!" -ForegroundColor Yellow
Write-Host "✅ .env.local is already in .gitignore and will not be committed." -ForegroundColor Green

