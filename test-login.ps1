$body = @{
    email = 'superadmin@parlour.com'
    password = 'password123'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "✅ Login successful!" $response.message
    Write-Host "User:" $response.data.user.firstName $response.data.user.lastName
    Write-Host "Role:" $response.data.user.role
} catch {
    Write-Host "❌ Login failed:" $_.Exception.Message
} 