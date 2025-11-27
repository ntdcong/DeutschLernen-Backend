# ============================================
# Public Deck Sharing - Test Script
# ============================================

$baseUrl = "http://localhost:3000/api"
$token = "" # Will be filled after login
$deckId = "" # Will be filled after creating a deck
$publicShareToken = "" # Will be filled after enabling public sharing

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Public Deck Sharing - Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Step 1: Login
# ============================================
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginPayload = @{
    email    = "admin@gmail.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginPayload -ContentType "application/json"
    $token = $loginResponse.data.access_token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================
# Step 2: Create a Test Deck
# ============================================
Write-Host "Step 2: Creating a test deck..." -ForegroundColor Yellow
$createDeckPayload = @{
    name     = "Public Test Deck - $(Get-Date -Format 'HH:mm:ss')"
    isPublic = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

try {
    $createDeckResponse = Invoke-RestMethod -Uri "$baseUrl/decks" -Method POST -Body $createDeckPayload -Headers $headers
    $deckId = $createDeckResponse.data.id
    Write-Host "✓ Deck created successfully" -ForegroundColor Green
    Write-Host "Deck ID: $deckId" -ForegroundColor Gray
    Write-Host "Deck Name: $($createDeckResponse.data.name)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Deck creation failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================
# Step 3: Add Some Words to Deck
# ============================================
Write-Host "Step 3: Adding words to deck..." -ForegroundColor Yellow

$words = @(
    @{ word = "Hallo"; meaning = "Xin chào"; genus = "" },
    @{ word = "Tschüss"; meaning = "Tạm biệt"; genus = "" },
    @{ word = "Danke"; meaning = "Cảm ơn"; genus = "" }
)

foreach ($wordData in $words) {
    $wordPayload = @{
        deckId  = $deckId
        word    = $wordData.word
        meaning = $wordData.meaning
        genus   = $wordData.genus
    } | ConvertTo-Json

    try {
        $wordResponse = Invoke-RestMethod -Uri "$baseUrl/words" -Method POST -Body $wordPayload -Headers $headers
        Write-Host "  ✓ Added word: $($wordData.word) - $($wordData.meaning)" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed to add word: $($wordData.word)" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# Step 4: Enable Public Sharing
# ============================================
Write-Host "Step 4: Enabling public sharing..." -ForegroundColor Yellow

try {
    $enableShareResponse = Invoke-RestMethod -Uri "$baseUrl/decks/$deckId/public-share/enable" -Method POST -Headers $headers
    $publicShareToken = $enableShareResponse.data.publicShareToken
    $publicShareUrl = $enableShareResponse.data.publicShareUrl
    
    Write-Host "✓ Public sharing enabled successfully" -ForegroundColor Green
    Write-Host "Public Share Token: $publicShareToken" -ForegroundColor Gray
    Write-Host "Public Share URL: $publicShareUrl" -ForegroundColor Cyan
    Write-Host "Enabled At: $($enableShareResponse.data.publicShareEnabledAt)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to enable public sharing: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================
# Step 5: Get Public Share Info
# ============================================
Write-Host "Step 5: Getting public share info..." -ForegroundColor Yellow

try {
    $shareInfoResponse = Invoke-RestMethod -Uri "$baseUrl/decks/$deckId/public-share/info" -Method GET -Headers $headers
    Write-Host "✓ Share info retrieved successfully" -ForegroundColor Green
    Write-Host "Is Shareable: $($shareInfoResponse.data.isPublicShareable)" -ForegroundColor Gray
    Write-Host "Token: $($shareInfoResponse.data.publicShareToken)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to get share info: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Step 6: Access Public Deck (Without Auth)
# ============================================
Write-Host "Step 6: Accessing public deck (anonymous)..." -ForegroundColor Yellow

try {
    $publicDeckResponse = Invoke-RestMethod -Uri "$baseUrl/public/decks/$publicShareToken" -Method GET
    Write-Host "✓ Public deck retrieved successfully" -ForegroundColor Green
    Write-Host "Deck Name: $($publicDeckResponse.data.name)" -ForegroundColor Gray
    Write-Host "Owner: $($publicDeckResponse.data.owner.username)" -ForegroundColor Gray
    Write-Host "Word Count: $($publicDeckResponse.data.wordCount)" -ForegroundColor Gray
    Write-Host "Words:" -ForegroundColor Gray
    foreach ($word in $publicDeckResponse.data.words) {
        Write-Host "  - $($word.german) = $($word.vietnamese)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Failed to access public deck: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Step 7: Generate QR Code
# ============================================
Write-Host "Step 7: Generating QR code..." -ForegroundColor Yellow

try {
    $qrResponse = Invoke-RestMethod -Uri "$baseUrl/public/decks/$publicShareToken/qr?type=simple&size=300" -Method GET
    Write-Host "✓ QR code generated successfully" -ForegroundColor Green
    Write-Host "QR Code URL: $($qrResponse.data.url)" -ForegroundColor Gray
    Write-Host "QR Data (first 50 chars): $($qrResponse.data.qrCode.Substring(0, 50))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to generate QR code: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Step 8: Regenerate Token
# ============================================
Write-Host "Step 8: Regenerating public share token..." -ForegroundColor Yellow

try {
    $regenerateResponse = Invoke-RestMethod -Uri "$baseUrl/decks/$deckId/public-share/regenerate" -Method POST -Headers $headers
    $newToken = $regenerateResponse.data.publicShareToken
    Write-Host "✓ Token regenerated successfully" -ForegroundColor Green
    Write-Host "Old Token: $publicShareToken" -ForegroundColor Gray
    Write-Host "New Token: $newToken" -ForegroundColor Cyan
    $publicShareToken = $newToken
}
catch {
    Write-Host "✗ Failed to regenerate token: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Step 9: Verify Old Token is Invalid
# ============================================
Write-Host "Step 9: Verifying old token is invalid..." -ForegroundColor Yellow

try {
    # Try to access with the old token (should fail)
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/public/decks/$publicShareToken" -Method GET -ErrorAction Stop
    Write-Host "✗ Old token still works (should not happen)" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ Old token correctly invalidated (404 Not Found)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# Step 10: Disable Public Sharing
# ============================================
Write-Host "Step 10: Disabling public sharing..." -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$baseUrl/decks/$deckId/public-share/disable" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✓ Public sharing disabled successfully" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to disable public sharing: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Step 11: Verify Public Access is Blocked
# ============================================
Write-Host "Step 11: Verifying public access is blocked..." -ForegroundColor Yellow

try {
    $blockedResponse = Invoke-RestMethod -Uri "$baseUrl/public/decks/$publicShareToken" -Method GET -ErrorAction Stop
    Write-Host "✗ Public access still works (should not happen)" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ Public access correctly blocked (404 Not Found)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Test Completed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "Deck ID: $deckId" -ForegroundColor Gray
Write-Host "You can manually test the frontend UI with this deck." -ForegroundColor Gray
