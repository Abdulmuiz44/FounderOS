# Fix ALL remaining session references in API routes
$files = Get-ChildItem -Path "src/app/api" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix conditional checks
    if ($content -match 'if \(!session\?\.\user\?\.\id\)') {
        $content = $content -replace 'if \(!session\?\.\user\?\.\id\)', 'if (!user)'
        $modified = $true
    }
    
    # Fix userId variable assignments
    if ($content -match 'const userId = session\?\.\user\?\.\id;') {
        $content = $content -replace 'const userId = session\?\.\user\?\.\id;', 'const userId = user?.id;'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content $file.FullName -Value $content
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nAll files processed!"
