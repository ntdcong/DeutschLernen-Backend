# Quick Guide: Import & AI Generation APIs

## 🚀 New Features

### 1. Import Words from Excel/CSV
Upload Excel or CSV files to bulk import vocabulary into decks.

### 2. AI-Powered Word Generation
Generate German vocabulary automatically using Groq AI.

---

## 📊 Import API

### Endpoint
```
POST /words/import/:deckId
```

### Request Format
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Authorization:** Bearer token required
- **Body:** File upload (field name: `file`)

### Supported File Formats
- Excel: `.xlsx`, `.xls`
- CSV: `.csv`

### File Structure
Your file must have these columns:

| Column | Required | Description |
|--------|----------|-------------|
| word | ✅ Yes | German word (with article for nouns) |
| meaning | ✅ Yes | Vietnamese translation |
| genus | ❌ No | Article (der/die/das) |
| plural | ❌ No | Plural form |
| audioUrl | ❌ No | Audio file URL |

### Example File Content
```
word,meaning,genus,plural,audioUrl
der Apfel,quả táo,der,die Äpfel,
die Katze,con mèo,die,die Katzen,
das Haus,ngôi nhà,das,die Häuser,
lernen,học,,,
schön,đẹp,,,
```

### Example Request (curl)
```bash
curl -X POST \
  "http://localhost:3000/words/import/YOUR_DECK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/words.xlsx"
```

### Example Request (Postman)
1. Method: POST
2. URL: `http://localhost:3000/words/import/YOUR_DECK_ID`
3. Headers:
   - Authorization: `Bearer YOUR_TOKEN`
4. Body:
   - Type: `form-data`
   - Key: `file` (type: File)
   - Value: Select your Excel/CSV file

### Response
```json
{
  "statusCode": 201,
  "message": "Import completed. 10 words imported, 0 failed",
  "data": {
    "imported": 10,
    "failed": 0,
    "errors": []
  }
}
```

### Error Handling
- **Partial Success:** If some rows fail, the API will import valid rows and report errors
- **Invalid Format:** Returns 400 if file format is not supported
- **Missing Columns:** Reports which rows are missing required fields

---

## 🤖 AI Generation API

### Endpoint
```
POST /words/generate
```

### Request Format
- **Method:** POST
- **Content-Type:** application/json
- **Authorization:** Bearer token required

### Request Body
```json
{
  "deckId": "uuid",
  "topic": "string",
  "count": number,
  "level": "string" (optional)
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| deckId | UUID | ✅ Yes | Target deck ID |
| topic | string | ✅ Yes | Topic in German or Vietnamese |
| count | number | ✅ Yes | Number of words (1-50) |
| level | string | ❌ No | Difficulty level (default: A1) |

### Difficulty Levels
- **A1** - Beginner
- **A2** - Elementary
- **B1** - Intermediate
- **B2** - Upper Intermediate
- **C1** - Advanced
- **C2** - Proficiency

### Popular Topics
- **Tiere** - Animals (Động vật)
- **Lebensmittel** - Food (Thực phẩm)
- **Familie** - Family (Gia đình)
- **Farben** - Colors (Màu sắc)
- **Kleidung** - Clothing (Quần áo)
- **Berufe** - Professions (Nghề nghiệp)
- **Wetter** - Weather (Thời tiết)
- **Körperteile** - Body parts (Bộ phận cơ thể)
- **Verkehrsmittel** - Transportation (Phương tiện)
- **Schule** - School (Trường học)

### Example Request (curl)
```bash
curl -X POST \
  "http://localhost:3000/words/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_ID",
    "topic": "Tiere",
    "count": 10,
    "level": "A1"
  }'
```

### Example Request (Postman)
1. Method: POST
2. URL: `http://localhost:3000/words/generate`
3. Headers:
   - Authorization: `Bearer YOUR_TOKEN`
   - Content-Type: `application/json`
4. Body (raw JSON):
```json
{
  "deckId": "a3787981-cbdf-45f1-8fc1-11797f364ef2",
  "topic": "Lebensmittel",
  "count": 15,
  "level": "A2"
}
```

### Response
```json
{
  "statusCode": 201,
  "message": "Successfully generated 10 words using AI",
  "data": [
    {
      "id": "uuid",
      "deckId": "deck-uuid",
      "word": "der Hund",
      "meaning": "con chó",
      "genus": "der",
      "plural": "die Hunde",
      "audioUrl": null,
      "isLearned": false,
      "createdAt": "2025-11-23T15:20:00.000Z",
      "updatedAt": "2025-11-23T15:20:00.000Z"
    }
    // ... more words
  ]
}
```

### AI Features
- ✅ Automatic article detection (der/die/das)
- ✅ Plural forms for nouns
- ✅ Accurate Vietnamese translations
- ✅ Context-aware vocabulary
- ✅ Powered by Groq LLaMA 3.3 70B

---

## 🔐 Authorization

Both APIs require:
- Valid JWT token in Authorization header
- User must be the deck owner OR admin
- Deck must exist

### Permission Rules
- ✅ **Deck Owner:** Can import/generate words
- ✅ **Admin:** Can import/generate to any deck
- ❌ **Other Users:** Cannot import/generate to others' decks

---

## ❌ Common Errors

### Import API

**400 Bad Request - "Field name missing"**
- Solution: Ensure field name is `file` (lowercase) in form-data

**400 Bad Request - "Invalid file format"**
- Solution: Use .xlsx, .xls, or .csv files only

**400 Bad Request - "No file uploaded"**
- Solution: Make sure to attach a file in the request

**403 Forbidden**
- Solution: You don't own this deck (only owner/admin can import)

**404 Not Found**
- Solution: Deck ID doesn't exist

### AI Generation API

**400 Bad Request - Validation error**
- Solution: Check count is between 1-50
- Solution: Ensure all required fields are present

**400 Bad Request - "Failed to generate words"**
- Solution: Check your Groq API key is valid
- Solution: Try a different topic or reduce count

**403 Forbidden**
- Solution: You don't own this deck (only owner/admin can generate)

**404 Not Found**
- Solution: Deck ID doesn't exist

---

## 💡 Tips

### For Import:
1. Start with a small test file (5-10 words)
2. Check the sample file format in `sample-data/sample-words.xlsx`
3. Use Excel for better formatting control
4. Keep file size reasonable (<1MB recommended)

### For AI Generation:
1. Start with A1 level for testing
2. Use specific topics for better results
3. Generate 10-20 words at a time for best quality
4. Topics can be in German or Vietnamese
5. Review generated words before using

---

## 📝 Testing Workflow

### Test Import:
```bash
# 1. Get your token
TOKEN="your-jwt-token"
DECK_ID="your-deck-id"

# 2. Test import
curl -X POST \
  "http://localhost:3000/words/import/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample-data/sample-words.xlsx"

# 3. Verify words were imported
curl -X GET \
  "http://localhost:3000/words/deck/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Test AI Generation:
```bash
# 1. Get your token
TOKEN="your-jwt-token"
DECK_ID="your-deck-id"

# 2. Generate words
curl -X POST \
  "http://localhost:3000/words/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"deckId\": \"$DECK_ID\",
    \"topic\": \"Tiere\",
    \"count\": 10,
    \"level\": \"A1\"
  }"

# 3. Verify words were generated
curl -X GET \
  "http://localhost:3000/words/deck/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Use Cases

### Import API - Best For:
- Migrating existing vocabulary lists
- Bulk adding words from textbooks
- Sharing word lists between users
- Importing from other learning platforms

### AI Generation API - Best For:
- Quick vocabulary expansion
- Topic-based learning
- Discovering new words
- Building themed decks
- Learning by difficulty level

---

**For more details, see:**
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [README.md](../README.md) - Project overview
