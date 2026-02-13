# API Migration Guide

## Breaking Changes in API Response Format

### Quotes List Endpoint

**Endpoint**: `GET /api/quotes`

**Before**:
```json
[
  {
    "id": "...",
    "title": "Quote 1",
    "blocks": [...],
    ...
  }
]
```

**After**:
```json
{
  "data": [
    {
      "id": "...",
      "title": "Quote 1",
      "blocks": [...],
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50, max: 100) - Items per page
- `status` (optional) - Filter by status: "draft", "sent", "accepted", "rejected"

**Example**:
```typescript
// Fetch page 2 with 25 items, only drafts
const response = await fetch('/api/quotes?page=2&limit=25&status=draft');
const { data, pagination } = await response.json();

console.log(data); // Array of quotes
console.log(pagination); // { page: 2, limit: 25, total: 150, totalPages: 6 }
```

---

### Templates List Endpoint

**Endpoint**: `GET /api/templates`

**Before**:
```json
[
  {
    "id": "...",
    "name": "Template 1",
    "blocks": [...],
    "isOwner": true,
    ...
  }
]
```

**After**:
```json
{
  "data": [
    {
      "id": "...",
      "name": "Template 1",
      "blocks": [...],
      "isOwner": true,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50, max: 100) - Items per page

**Example**:
```typescript
const response = await fetch('/api/templates?page=1&limit=20');
const { data, pagination } = await response.json();
```

---

## Individual Item Endpoints (No Changes)

These endpoints still return single objects:

- `GET /api/quotes/:id` - Returns single quote
- `GET /api/templates/:id` - Returns single template
- `POST /api/quotes` - Returns created quote
- `POST /api/templates` - Returns created template
- `PUT /api/quotes/:id` - Returns updated quote
- `PUT /api/templates/:id` - Returns updated template

---

## Frontend Code Updates

### Before (Old Code)
```typescript
// Quotes page
const fetchQuotes = async () => {
  const res = await fetch('/api/quotes');
  const data = await res.json();
  setQuotes(data); // ❌ Will fail - data is now { data, pagination }
};

// Templates page
const fetchTemplates = async () => {
  const res = await fetch('/api/templates');
  const data = await res.json();
  setTemplates(data); // ❌ Will fail - data is now { data, pagination }
};
```

### After (Updated Code)
```typescript
// Quotes page
const fetchQuotes = async () => {
  const res = await fetch('/api/quotes');
  const result = await res.json();

  // Handle new paginated response
  const data = result.data || result; // Backwards compatible
  setQuotes(Array.isArray(data) ? data : []);

  // Optional: Use pagination metadata
  if (result.pagination) {
    console.log(`Page ${result.pagination.page} of ${result.pagination.totalPages}`);
  }
};

// Templates page
const fetchTemplates = async () => {
  const res = await fetch('/api/templates');
  const result = await res.json();

  // Handle new paginated response
  const data = result.data || result; // Backwards compatible
  setTemplates(Array.isArray(data) ? data : []);

  // Optional: Use pagination metadata
  if (result.pagination) {
    console.log(`Showing ${data.length} of ${result.pagination.total} templates`);
  }
};
```

---

## Implementing Pagination in UI

### Example: Add Pagination Controls

```typescript
import { useState, useEffect } from 'react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchQuotes = async (page: number, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(status && { status }),
    });

    const res = await fetch(`/api/quotes?${params}`);
    const { data, pagination: paginationData } = await res.json();

    setQuotes(data);
    setPagination(paginationData);
  };

  useEffect(() => {
    fetchQuotes(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      {/* Filters */}
      <select value={statusFilter} onChange={(e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to page 1 on filter change
      }}>
        <option value="">All</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Quotes list */}
      <QuotesTable quotes={quotes} />

      {/* Pagination controls */}
      {pagination && (
        <div>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
            ({pagination.total} total)
          </span>
          <button onClick={handleNextPage} disabled={currentPage === pagination.totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing the Migration

### 1. Test List Endpoints
```bash
# Test quotes pagination
curl http://localhost:3000/api/quotes?page=1&limit=10

# Test quotes with status filter
curl http://localhost:3000/api/quotes?status=draft

# Test templates pagination
curl http://localhost:3000/api/templates?page=1&limit=20
```

### 2. Verify Response Format
All list endpoints should return:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### 3. Test Edge Cases
- Page number > totalPages (should return empty array)
- Limit > 100 (should be capped at 100)
- Invalid page/limit (should default to 1/50)
- No results (should return empty array with pagination metadata)

---

## Rollback Plan

If you need to temporarily rollback to the old format:

1. Revert `/src/app/api/quotes/route.ts` changes
2. Revert `/src/app/api/templates/route.ts` changes
3. Remove pagination parameters from queries

However, the current implementation is **backwards compatible** - the frontend code checks for `result.data || result`, so it works with both old and new formats.

---

## Benefits of New Format

1. **Performance**: Load only needed items, not entire dataset
2. **User Experience**: Faster page loads with large datasets
3. **Scalability**: Handles growth to thousands of quotes/templates
4. **Filtering**: Built-in status filter for quotes
5. **Metadata**: Total counts and page info for UI pagination controls

---

## Status

✅ **Migration Complete**
- API endpoints updated
- Frontend pages fixed (`quotes/page.tsx`, `templates/page.tsx`)
- Build passing
- Backwards compatible implementation

The application is now ready to handle large datasets efficiently!
