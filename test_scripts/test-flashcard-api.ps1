# Flashcard API Testing Script

# This script tests the Flashcard API endpoints
# Make sure the server is running: npm run start:dev

# ============================================
# SETUP: Get authentication tokens
# ============================================

# Login as Admin
$adminLogin = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
$adminToken = $adminResponse.data.accessToken
Write-Host "Admin Token: $adminToken" -ForegroundColor Green

# Login as Teacher
$teacherLogin = @{
    email = "teacher@example.com"
    password = "teacher123"
} | ConvertTo-Json

$teacherResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $teacherLogin -ContentType "application/json"
$teacherToken = $teacherResponse.data.accessToken
Write-Host "Teacher Token: $teacherToken" -ForegroundColor Green

# Login as Learner
$learnerLogin = @{
    email = "learner@example.com"
    password = "learner123"
} | ConvertTo-Json

$learnerResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $learnerLogin -ContentType "application/json"
$learnerToken = $learnerResponse.data.accessToken
Write-Host "Learner Token: $learnerToken" -ForegroundColor Green

# ============================================
# TEST 1: Create Deck as Learner (is_public should be false)
# ============================================
Write-Host "`n=== TEST 1: Create Deck as Learner ===" -ForegroundColor Cyan

$learnerDeck = @{
    name = "My German Vocabulary"
    isPublic = $true  # This should be ignored
} | ConvertTo-Json

$deck1 = Invoke-RestMethod -Uri "http://localhost:3000/decks" -Method POST -Headers @{"Authorization"="Bearer $learnerToken"} -Body $learnerDeck -ContentType "application/json"
Write-Host "Deck created by learner:" -ForegroundColor Yellow
Write-Host "  ID: $($deck1.data.id)"
Write-Host "  Name: $($deck1.data.name)"
Write-Host "  isPublic: $($deck1.data.isPublic) (should be false)" -ForegroundColor $(if ($deck1.data.isPublic -eq $false) { "Green" } else { "Red" })

$learnerDeckId = $deck1.data.id

# ============================================
# TEST 2: Create Deck as Admin (is_public can be true)
# ============================================
Write-Host "`n=== TEST 2: Create Deck as Admin ===" -ForegroundColor Cyan

$adminDeck = @{
    name = "Public German Grammar"
    isPublic = $true
} | ConvertTo-Json

$deck2 = Invoke-RestMethod -Uri "http://localhost:3000/decks" -Method POST -Headers @{"Authorization"="Bearer $adminToken"} -Body $adminDeck -ContentType "application/json"
Write-Host "Deck created by admin:" -ForegroundColor Yellow
Write-Host "  ID: $($deck2.data.id)"
Write-Host "  Name: $($deck2.data.name)"
Write-Host "  isPublic: $($deck2.data.isPublic) (should be true)" -ForegroundColor $(if ($deck2.data.isPublic -eq $true) { "Green" } else { "Red" })

$adminDeckId = $deck2.data.id

# ============================================
# TEST 3: Learner tries to update deck to public
# ============================================
Write-Host "`n=== TEST 3: Learner tries to set is_public=true ===" -ForegroundColor Cyan

$updateDeck = @{
    isPublic = $true
} | ConvertTo-Json

$deck3 = Invoke-RestMethod -Uri "http://localhost:3000/decks/$learnerDeckId" -Method PATCH -Headers @{"Authorization"="Bearer $learnerToken"} -Body $updateDeck -ContentType "application/json"
Write-Host "After learner update attempt:" -ForegroundColor Yellow
Write-Host "  isPublic: $($deck3.data.isPublic) (should still be false)" -ForegroundColor $(if ($deck3.data.isPublic -eq $false) { "Green" } else { "Red" })

# ============================================
# TEST 4: List all decks (should see own + public)
# ============================================
Write-Host "`n=== TEST 4: List decks as Learner ===" -ForegroundColor Cyan

$allDecks = Invoke-RestMethod -Uri "http://localhost:3000/decks" -Method GET -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Learner can see $($allDecks.data.Count) deck(s):" -ForegroundColor Yellow
foreach ($deck in $allDecks.data) {
    Write-Host "  - $($deck.name) (isPublic: $($deck.isPublic))"
}

# ============================================
# TEST 5: Add words to deck
# ============================================
Write-Host "`n=== TEST 5: Add words to deck ===" -ForegroundColor Cyan

$word1 = @{
    deckId = $learnerDeckId
    word = "der Hund"
    meaning = "dog"
    genus = "der"
    plural = "die Hunde"
} | ConvertTo-Json

$wordResult1 = Invoke-RestMethod -Uri "http://localhost:3000/words" -Method POST -Headers @{"Authorization"="Bearer $learnerToken"} -Body $word1 -ContentType "application/json"
Write-Host "Word 1 created: $($wordResult1.data.word) - $($wordResult1.data.meaning)" -ForegroundColor Green

$word2 = @{
    deckId = $learnerDeckId
    word = "die Katze"
    meaning = "cat"
    genus = "die"
    plural = "die Katzen"
} | ConvertTo-Json

$wordResult2 = Invoke-RestMethod -Uri "http://localhost:3000/words" -Method POST -Headers @{"Authorization"="Bearer $learnerToken"} -Body $word2 -ContentType "application/json"
Write-Host "Word 2 created: $($wordResult2.data.word) - $($wordResult2.data.meaning)" -ForegroundColor Green

$word3 = @{
    deckId = $learnerDeckId
    word = "das Haus"
    meaning = "house"
    genus = "das"
    plural = "die Häuser"
} | ConvertTo-Json

$wordResult3 = Invoke-RestMethod -Uri "http://localhost:3000/words" -Method POST -Headers @{"Authorization"="Bearer $learnerToken"} -Body $word3 -ContentType "application/json"
Write-Host "Word 3 created: $($wordResult3.data.word) - $($wordResult3.data.meaning)" -ForegroundColor Green

# ============================================
# TEST 6: Get all words in deck
# ============================================
Write-Host "`n=== TEST 6: Get all words in deck ===" -ForegroundColor Cyan

$words = Invoke-RestMethod -Uri "http://localhost:3000/words/deck/$learnerDeckId" -Method GET -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Deck has $($words.data.Count) word(s):" -ForegroundColor Yellow
foreach ($word in $words.data) {
    Write-Host "  - $($word.word) ($($word.genus)) - $($word.meaning)"
}

# ============================================
# TEST 7: Toggle learned status
# ============================================
Write-Host "`n=== TEST 7: Toggle learned status ===" -ForegroundColor Cyan

$wordId = $wordResult1.data.id
$toggleResult = Invoke-RestMethod -Uri "http://localhost:3000/words/$wordId/toggle-learned" -Method PATCH -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Word '$($toggleResult.data.word)' learned status: $($toggleResult.data.isLearned)" -ForegroundColor Green

# ============================================
# TEST 8: Batch loading (for small deck, should return useBatchLoading=false)
# ============================================
Write-Host "`n=== TEST 8: Check shuffled IDs (small deck) ===" -ForegroundColor Cyan

$shuffledResult = Invoke-RestMethod -Uri "http://localhost:3000/decks/$learnerDeckId/shuffled-ids" -Method GET -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Use batch loading: $($shuffledResult.data.useBatchLoading) (should be false for small deck)" -ForegroundColor $(if ($shuffledResult.data.useBatchLoading -eq $false) { "Green" } else { "Red" })

# ============================================
# TEST 9: Get word count
# ============================================
Write-Host "`n=== TEST 9: Get word count ===" -ForegroundColor Cyan

$countResult = Invoke-RestMethod -Uri "http://localhost:3000/decks/$learnerDeckId/word-count" -Method GET -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Deck has $($countResult.data.count) word(s)" -ForegroundColor Yellow

# ============================================
# TEST 10: Batch load words
# ============================================
Write-Host "`n=== TEST 10: Batch load words ===" -ForegroundColor Cyan

$batchRequest = @{
    ids = @($wordResult1.data.id, $wordResult2.data.id)
} | ConvertTo-Json

$batchResult = Invoke-RestMethod -Uri "http://localhost:3000/words/batch" -Method POST -Headers @{"Authorization"="Bearer $learnerToken"} -Body $batchRequest -ContentType "application/json"
Write-Host "Batch loaded $($batchResult.data.Count) word(s):" -ForegroundColor Yellow
foreach ($word in $batchResult.data) {
    Write-Host "  - $($word.word) - $($word.meaning)"
}

# ============================================
# TEST 11: Delete word
# ============================================
Write-Host "`n=== TEST 11: Delete word ===" -ForegroundColor Cyan

$deleteResult = Invoke-RestMethod -Uri "http://localhost:3000/words/$($wordResult3.data.id)" -Method DELETE -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Word deleted: $($deleteResult.message)" -ForegroundColor Green

# Verify deletion
$wordsAfterDelete = Invoke-RestMethod -Uri "http://localhost:3000/words/deck/$learnerDeckId" -Method GET -Headers @{"Authorization"="Bearer $learnerToken"}
Write-Host "Deck now has $($wordsAfterDelete.data.Count) word(s)" -ForegroundColor Yellow

# ============================================
# TEST 12: Authorization test - Teacher tries to delete learner's deck
# ============================================
Write-Host "`n=== TEST 12: Authorization test ===" -ForegroundColor Cyan

try {
    Invoke-RestMethod -Uri "http://localhost:3000/decks/$learnerDeckId" -Method DELETE -Headers @{"Authorization"="Bearer $teacherToken"}
    Write-Host "ERROR: Teacher should not be able to delete learner's deck!" -ForegroundColor Red
} catch {
    Write-Host "✓ Teacher correctly denied from deleting learner's deck" -ForegroundColor Green
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "Check the results above to verify:" -ForegroundColor Yellow
Write-Host "  ✓ Learner cannot set is_public=true"
Write-Host "  ✓ Admin can set is_public=true"
Write-Host "  ✓ Users can see their own decks + public decks"
Write-Host "  ✓ Words can be created, updated, and deleted"
Write-Host "  ✓ Batch loading works correctly"
Write-Host "  ✓ Authorization is enforced"
