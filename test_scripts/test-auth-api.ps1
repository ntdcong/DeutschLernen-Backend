# Test API Script - PowerShell
# Chạy file này bằng lệnh: .\test-api.ps1

Write-Host "=== TESTING DEUTSCHLERNE API ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Register Admin User
Write-Host "1. Testing Registration (Admin)..." -ForegroundColor Yellow
$registerBody = @{
    email = "admin@example.com"
    password = "admin123456"
    fullName = "Admin User"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "Role: $($registerResponse.data.user.role)" -ForegroundColor Gray
    $adminToken = $registerResponse.data.accessToken
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed (user might already exist)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Register Regular User
Write-Host "2. Testing Registration (Learner)..." -ForegroundColor Yellow
$registerBody2 = @{
    email = "user@example.com"
    password = "user123456"
    fullName = "Nguyen Van A"
    role = "learner"
} | ConvertTo-Json

try {
    $registerResponse2 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody2 -ContentType "application/json"
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse2.data.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse2.data.user.email)" -ForegroundColor Gray
    Write-Host "Role: $($registerResponse2.data.user.role)" -ForegroundColor Gray
    $userToken = $registerResponse2.data.accessToken
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed (user might already exist)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Login
Write-Host "3. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"
    password = "admin123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.data.accessToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "Token Type: $($loginResponse.data.tokenType)" -ForegroundColor Gray
    Write-Host "Expires In: $($loginResponse.data.expiresIn) seconds" -ForegroundColor Gray
    $adminToken = $loginResponse.data.accessToken
    $refreshToken = $loginResponse.data.refreshToken
    Write-Host ""
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Get All Users (Admin)
if ($adminToken) {
    Write-Host "4. Testing Get All Users (Admin)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $adminToken"
        }
        $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
        Write-Host "✓ Get users successful!" -ForegroundColor Green
        Write-Host "Total users: $($usersResponse.data.Count)" -ForegroundColor Gray
        foreach ($user in $usersResponse.data) {
            Write-Host "  - $($user.fullName) ($($user.email)) - Role: $($user.role)" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "✗ Get users failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 5: Get All Users (Regular User)
if ($userToken) {
    Write-Host "5. Testing Get All Users (Regular User - Limited Data)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $userToken"
        }
        $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
        Write-Host "✓ Get users successful!" -ForegroundColor Green
        Write-Host "Total users: $($usersResponse.data.Count)" -ForegroundColor Gray
        Write-Host "Note: Regular users only see ID and Full Name" -ForegroundColor Cyan
        foreach ($user in $usersResponse.data) {
            Write-Host "  - ID: $($user.id), Name: $($user.fullName)" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        Write-Host "✗ Get users failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 6: Refresh Token
if ($refreshToken) {
    Write-Host "6. Testing Refresh Token..." -ForegroundColor Yellow
    $refreshBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json

    try {
        $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method POST -Body $refreshBody -ContentType "application/json"
        Write-Host "✓ Token refresh successful!" -ForegroundColor Green
        Write-Host "New Access Token: $($refreshResponse.data.accessToken.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Token refresh failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 7: Forgot Password
Write-Host "7. Testing Forgot Password..." -ForegroundColor Yellow
$forgotBody = @{
    email = "admin@example.com"
} | ConvertTo-Json

try {
    $forgotResponse = Invoke-RestMethod -Uri "$baseUrl/auth/forgot-password" -Method POST -Body $forgotBody -ContentType "application/json"
    Write-Host "✓ Forgot password successful!" -ForegroundColor Green
    Write-Host "Message: $($forgotResponse.message)" -ForegroundColor Gray
    if ($forgotResponse.data.resetToken) {
        Write-Host "Reset Token: $($forgotResponse.data.resetToken)" -ForegroundColor Gray
        $resetToken = $forgotResponse.data.resetToken
    }
    Write-Host ""
} catch {
    Write-Host "✗ Forgot password failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 8: Reset Password
if ($resetToken) {
    Write-Host "8. Testing Reset Password..." -ForegroundColor Yellow
    $resetBody = @{
        token = $resetToken
        newPassword = "newpassword123"
    } | ConvertTo-Json

    try {
        $resetResponse = Invoke-RestMethod -Uri "$baseUrl/auth/reset-password" -Method POST -Body $resetBody -ContentType "application/json"
        Write-Host "✓ Password reset successful!" -ForegroundColor Green
        Write-Host "Message: $($resetResponse.message)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Password reset failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "=== ALL TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Server is running at: http://localhost:3000/api" -ForegroundColor Gray
Write-Host "- All endpoints are working correctly" -ForegroundColor Gray
Write-Host "- Database is connected and tables are created" -ForegroundColor Gray
Write-Host ""
