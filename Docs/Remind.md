# Technical Notes & Solutions

## 📌 Performance Optimization Strategy

### Challenge: Large Vocabulary Decks

**Problem Statement:**
- Decks can contain 1000+ vocabulary words
- Loading all words at once creates performance bottlenecks
- Shuffle functionality directly impacts loading performance
- User experience degrades with large datasets

### Solution: ID-First & Batch Pre-fetching

#### Phase 1: Shuffle Order (Instant Load)

**Endpoint:** `GET /decks/:id/shuffled-ids`

**Implementation:**
```sql
-- Backend: SELECT all IDs and shuffle
SELECT id FROM words 
WHERE deck_id = :deckId 
ORDER BY RANDOM()
```

**Output:**
```json
{
  "useBatchLoading": true,
  "ids": [502, 1, 999, 23, ...]
}
```

**Performance:**
- Payload size: ~10KB (IDs only)
- Response time: Instant
- Frontend stores ID array in memory

#### Phase 2: Batch Content Loading

**Endpoint:** `POST /words/batch`

**Configuration:**
- Batch size: 50-100 words per request
- Request body: `{ "ids": [id1, id2, id3...] }`
- Query: `WHERE id IN (...)`

**Performance:**
- Payload per batch: 30-50KB
- Optimized database query with IN clause

#### Pre-fetching Strategy

**Implementation:**
```javascript
// Frontend logic
if (currentWordIndex >= batchSize - 10) {
  // Pre-fetch next batch
  fetchNextBatch(nextBatchIds);
}
```

**Result:**
- Words always ready in client memory
- Seamless user experience
- No perceived loading delays

### Conditional Loading Logic

**Smart Decision Making:**
```typescript
if (wordCount <= 200) {
  // Small deck: Load all words normally
  return { useBatchLoading: false };
} else {
  // Large deck: Use batch loading
  return { 
    useBatchLoading: true, 
    ids: shuffledIds 
  };
}
```

**Threshold:** 200 words
- Below threshold: Traditional loading (simpler, faster for small sets)
- Above threshold: Batch loading (optimized for large sets)

---

## 🔒 Security Implementation

### `isPublic` Field Enforcement

**Business Rule:**
- Only **Admin** users can set `isPublic = true`
- All other users (Teacher, Learner) must have `isPublic = false`

**Implementation:**
```typescript
// Service layer enforcement
const isPublic = 
  userRole === UserRole.ADMIN && dto.isPublic === true
    ? true
    : false;
```

**Security Benefits:**
- Cannot be bypassed from frontend
- Enforced at service layer
- Consistent across create and update operations

---

## 🏗️ Architecture Decisions

### Database Relationships

**Cascade Deletion:**
```typescript
@ManyToOne(() => Deck, { onDelete: 'CASCADE' })
deck: Deck;
```

**Benefit:** Deleting a deck automatically removes all associated words

### Authorization Pattern

**Layered Approach:**
1. **Guard Layer:** JWT authentication
2. **Service Layer:** Role-based authorization
3. **Business Logic:** Ownership verification

**Example:**
```typescript
// Check ownership
if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
  throw new ForbiddenException('Access denied');
}
```

---

## 📊 Performance Metrics

### Expected Performance

| Deck Size | Strategy | Initial Load | Subsequent Loads |
|-----------|----------|--------------|------------------|
| ≤200 words | Normal | ~100ms | N/A |
| 500 words | Batch | ~50ms (IDs) | ~80ms (batch) |
| 1000 words | Batch | ~50ms (IDs) | ~80ms (batch) |
| 5000 words | Batch | ~50ms (IDs) | ~80ms (batch) |

### Optimization Benefits

- **90% reduction** in initial payload size for large decks
- **Consistent performance** regardless of deck size
- **Improved UX** with pre-fetching strategy

---

## 🔄 API Design Patterns

### Consistent Response Format

**Standard Structure:**
```typescript
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}
```

**Benefits:**
- Predictable response structure
- Easy error handling
- Type-safe with TypeScript

### RESTful Conventions

- `POST` for creation
- `GET` for retrieval
- `PATCH` for partial updates
- `DELETE` for removal

### Specialized Endpoints

- `/shuffled-ids` - Performance optimization
- `/toggle-learned` - Convenience method
- `/batch` - Bulk operations

---

## 🎯 Best Practices Implemented

### Input Validation
- DTO classes with decorators
- Type checking at compile time
- Runtime validation with class-validator

### Error Handling
- Custom exceptions (NotFoundException, ForbiddenException)
- Consistent error messages
- HTTP status codes follow standards

### Code Organization
- Modular structure (Auth, Users, Decks, Words)
- Separation of concerns (Controller → Service → Repository)
- Reusable guards and decorators

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Caching Layer**
   - Redis for public decks
   - Reduce database queries

2. **Pagination**
   - For `/decks` and `/words/deck/:id` endpoints
   - Limit: 50 items per page

3. **Search & Filtering**
   - Full-text search for words
   - Filter by learned status
   - Sort by various criteria

4. **Analytics**
   - Learning progress tracking
   - Most difficult words
   - Study time statistics

5. **Real-time Features**
   - WebSocket for collaborative learning
   - Live deck updates
   - Shared study sessions

---

## 📝 Development Notes

### TypeORM Synchronize

**Development:**
```typescript
synchronize: true  // Auto-create tables
```

**Production:**
```typescript
synchronize: false  // Use migrations
```

### Environment Configuration

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Token signing key
- `JWT_REFRESH_SECRET` - Refresh token key
- `NODE_ENV` - Environment mode

---

## 🔍 Troubleshooting

### Common Issues

**Issue:** Cannot connect to database
- **Solution:** Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check firewall settings

**Issue:** JWT token expired
- **Solution:** Use refresh token endpoint
- Check token expiration settings

**Issue:** Batch loading not working
- **Solution:** Verify deck has >200 words
- Check `/shuffled-ids` response

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Maintained by:** DeutschLernen Development Team
