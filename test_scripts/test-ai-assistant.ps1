# AI Assistant & Sentences API Testing Script

# This script tests the AI Assistant and Sentences CRUD endpoints
# Make sure the server is running: npm run start:dev

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  AI ASSISTANT & SENTENCES API TEST SCRIPT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ============================================
# SETUP: Get authentication token
# ============================================
Write-Host "`n[SETUP] Logging in..." -ForegroundColor Yellow

$loginData = @{
    email    = "admin@gmail.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# ============================================
# PREREQUISITE: Create test deck and word
# ============================================
Write-Host "`n[SETUP] Creating test deck and word..." -ForegroundColor Yellow

$deckData = @{
    name     = "AI Assistant Test Deck"
    isPublic = $false
} | ConvertTo-Json

try {
    $deckResponse = Invoke-RestMethod -Uri "http://localhost:3000/decks" -Method POST -Headers $headers -Body $deckData
    $deckId = $deckResponse.data.id
    Write-Host "✓ Deck created: $($deckResponse.data.name)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to create deck: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$wordData = @{
    deckId  = $deckId
    word    = "der Hund"
    meaning = "con chó"
    genus   = "der"
    plural  = "die Hunde"
} | ConvertTo-Json

try {
    $wordResponse = Invoke-RestMethod -Uri "http://localhost:3000/words" -Method POST -Headers $headers -Body $wordData
    $wordId = $wordResponse.data.id
    Write-Host "✓ Word created: $($wordResponse.data.word) - $($wordResponse.data.meaning)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to create word: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# TEST 1: Generate Sentence (Fast Model)
# ============================================
Write-Host "`n=== TEST 1: Generate AI Sentence (Fast Model) ===" -ForegroundColor Cyan

$generateRequest = @{
    wordId     = $wordId
    difficulty = "A2"
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $sentenceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/ai/generate-sentence" -Method POST -Headers $headers -Body $generateRequest
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✓ Sentence generated in $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host "  German: $($sentenceResponse.data.sentence)" -ForegroundColor White
    Write-Host "  Vietnamese: $($sentenceResponse.data.vietnamese)" -ForegroundColor Gray
    Write-Host "  Grammar: $($sentenceResponse.data.grammarNote)" -ForegroundColor Gray
    Write-Host "  Saved ID: $($sentenceResponse.data.sentenceId)" -ForegroundColor Gray

    $savedSentenceId = $sentenceResponse.data.sentenceId
}
catch {
    Write-Host "✗ Failed to generate sentence: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 2: Get Sentences by Word
# ============================================
Write-Host "`n=== TEST 2: Get Sentences by Word ===" -ForegroundColor Cyan

try {
    $sentencesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/sentences/word/$wordId" -Method GET -Headers $headers
    Write-Host "✓ Retrieved $($sentencesResponse.data.Count) sentence(s)" -ForegroundColor Green
    foreach ($s in $sentencesResponse.data) {
        Write-Host "  - $($s.german)" -ForegroundColor White
    }
}
catch {
    Write-Host "✗ Failed to get sentences: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 3: Toggle Favorite
# ============================================
Write-Host "`n=== TEST 3: Toggle Favorite ===" -ForegroundColor Cyan

try {
    $favoriteResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/sentences/$savedSentenceId/favorite" -Method PATCH -Headers $headers
    Write-Host "✓ Favorite toggled: isFavorite = $($favoriteResponse.data.isFavorite)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to toggle favorite: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 4: Get Favorite Sentences
# ============================================
Write-Host "`n=== TEST 4: Get Favorite Sentences ===" -ForegroundColor Cyan

try {
    $favoritesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/sentences/favorites" -Method GET -Headers $headers
    Write-Host "✓ Retrieved $($favoritesResponse.data.Count) favorite(s)" -ForegroundColor Green
    foreach ($s in $favoritesResponse.data) {
        Write-Host "  ❤️ $($s.german)" -ForegroundColor White
    }
}
catch {
    Write-Host "✗ Failed to get favorites: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 5: Common Phrases (Fast Model)
# ============================================
Write-Host "`n=== TEST 5: Get Common Phrases (Fast Model) ===" -ForegroundColor Cyan

$aiRequest = @{
    wordId = $wordId
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $phrasesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/ai/phrases" -Method POST -Headers $headers -Body $aiRequest
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✓ Phrases generated in $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host $phrasesResponse.data.phrases -ForegroundColor White
}
catch {
    Write-Host "✗ Failed to get phrases: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 6: Common Mistakes (Fast Model)
# ============================================
Write-Host "`n=== TEST 6: Get Common Mistakes (Fast Model) ===" -ForegroundColor Cyan

try {
    $startTime = Get-Date
    $mistakesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/ai/common-mistakes" -Method POST -Headers $headers -Body $aiRequest
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✓ Mistakes generated in $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host $mistakesResponse.data.mistakes -ForegroundColor White
}
catch {
    Write-Host "✗ Failed to get mistakes: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 7: Fun Facts (Smart Model)
# ============================================
Write-Host "`n=== TEST 7: Get Fun Facts (Smart Model) ===" -ForegroundColor Cyan

try {
    $startTime = Get-Date
    $factsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/ai/fun-facts" -Method POST -Headers $headers -Body $aiRequest
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✓ Fun facts generated in $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host $factsResponse.data.facts -ForegroundColor White
}
catch {
    Write-Host "✗ Failed to get fun facts: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 8: Etymology (Smart Model)
# ============================================
Write-Host "`n=== TEST 8: Get Etymology (Smart Model) ===" -ForegroundColor Cyan

try {
    $startTime = Get-Date
    $etymologyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/ai/etymology" -Method POST -Headers $headers -Body $aiRequest
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✓ Etymology generated in $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host $etymologyResponse.data.etymology -ForegroundColor White
}
catch {
    Write-Host "✗ Failed to get etymology: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 9: Delete Sentence
# ============================================
Write-Host "`n=== TEST 9: Delete Sentence ===" -ForegroundColor Cyan

try {
    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/flashcard/sentences/$savedSentenceId" -Method DELETE -Headers $headers
    Write-Host "✓ Sentence deleted: $($deleteResponse.message)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to delete sentence: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# CLEANUP: Delete test data
# ============================================
Write-Host "`n[CLEANUP] Removing test data..." -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "http://localhost:3000/decks/$deckId" -Method DELETE -Headers $headers
    Write-Host "✓ Test deck deleted" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to delete deck: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✓ All AI Assistant features tested!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Tested Features:" -ForegroundColor Yellow
Write-Host "  ⚡ Fast Model (llama-3.1-8b-instant):" -ForegroundColor White
Write-Host "     - Generate Sentence" -ForegroundColor Gray
Write-Host "     - Common Phrases" -ForegroundColor Gray
Write-Host "     - Common Mistakes" -ForegroundColor Gray
Write-Host "  🧠 Smart Model (llama-3.3-70b-versatile):" -ForegroundColor White
Write-Host "     - Fun Facts" -ForegroundColor Gray
Write-Host "     - Etymology" -ForegroundColor Gray
Write-Host "  💾 Sentence CRUD:" -ForegroundColor White
Write-Host "     - Create, Read, Favorite, Delete" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
