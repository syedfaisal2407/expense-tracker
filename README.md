# Ledger — Personal Expense Tracker

A full-stack MERN application for tracking personal expenses with category breakdowns and spending summaries.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Frontend | React 18 (Vite) |
| Charts | Recharts |
| Testing | Jest + Supertest |

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── models/
│   │   └── Expense.js          # Mongoose schema + validation
│   ├── routes/
│   │   └── expenses.js         # REST route handlers
│   ├── tests/
│   │   └── expenses.test.js    # 21 unit tests (mocked Mongoose)
│   ├── server.js               # Express app + MongoDB connection
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpenseForm.jsx  # Add / edit form
│   │   │   ├── ExpenseList.jsx  # Filterable list
│   │   │   └── Summary.jsx     # Pie chart + stats
│   │   ├── api.js              # Fetch wrappers
│   │   ├── App.jsx             # Root component + state
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string

### 1. Clone & install

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI if using Atlas
```

### 3. Run in development

```bash
# Terminal 1 — API server (port 5000)
cd backend && npm run dev

# Terminal 2 — Vite dev server (port 3000, proxies /api → 5000)
cd frontend && npm run dev
```

Open `http://localhost:3000`

### 4. Run tests

```bash
cd backend && npm test
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses (filterable) |
| GET | `/expenses/:id` | Get single expense |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| GET | `/expenses/summary` | Aggregated stats by category |
| GET | `/health` | Server health check |

### Query Parameters (GET /expenses)

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `Food` | Filter by category |
| `startDate` | ISO date | `2024-01-01` | Start of date range |
| `endDate` | ISO date | `2024-03-31` | End of date range |
| `sort` | string | `-date` | Sort field (prefix `-` for desc) |
| `limit` | number | `50` | Max results (default 100) |

### Expense Schema

```json
{
  "title": "string (required, max 100)",
  "amount": "number (required, > 0)",
  "category": "Food | Transport | Housing | Entertainment | Health | Shopping | Other",
  "date": "ISO date (default: now)",
  "note": "string (optional, max 300)"
}
```

### Example Requests

**Create an expense**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","amount":67.50,"category":"Food","date":"2024-03-20"}'
```

**Get spending summary**
```bash
curl http://localhost:5000/api/expenses/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grandTotal": { "total": 345.75, "count": 12, "avg": 28.81, "max": 120 },
    "byCategory": [
      { "category": "Food", "total": 145.5, "count": 5, "avg": 29.1 },
      { "category": "Transport", "total": 80, "count": 3, "avg": 26.67 }
    ]
  }
}
```

---

## Features

- **CRUD** — Add, edit, and delete expenses
- **Category filtering** — Filter the list by category in real time
- **Date range queries** — API supports filtering by date range
- **Summary dashboard** — Donut chart + stat cards + per-category progress bars
- **Validation** — Server-side validation with clear error messages
- **Toast notifications** — Feedback on create / update / delete

---

## Running Tests

```bash
cd backend && npm test
```

```
PASS tests/expenses.test.js (5.5s)
  GET /api/health          ✓ returns ok
  GET /api/expenses        ✓ returns all expenses
                           ✓ filters by category
                           ✓ applies date range filter
                           ✓ returns empty array when no expenses
                           ✓ handles DB error gracefully
  GET /api/expenses/summary ✓ returns grand total and category breakdown
                           ✓ handles empty database
  GET /api/expenses/:id    ✓ returns an expense by id
                           ✓ returns 404 when not found
  POST /api/expenses       ✓ creates with valid data
                           ✓ handles ValidationError
                           ✓ handles server error on create
  PUT /api/expenses/:id    ✓ updates an expense
                           ✓ passes correct options to findByIdAndUpdate
                           ✓ returns 404 when not found
                           ✓ handles ValidationError on update
  DELETE /api/expenses/:id ✓ deletes and returns success
                           ✓ returns 404 when not found
                           ✓ handles DB error
  Unknown routes           ✓ returns 404

Tests: 21 passed, 21 total
```

Tests use **mocked Mongoose** (no real MongoDB needed) to isolate route logic, validation error handling, and HTTP response shapes.

---

## Design Decisions

**Why mock Mongoose in tests rather than mongodb-memory-server?**  
In-process test doubles are faster, have no binary dependencies, and isolate units. Integration tests against a real DB belong in a separate test suite (e.g., `tests/integration/`) that runs in CI with a Docker Compose MongoDB service.

**Why a single `summary` endpoint with aggregation?**  
The MongoDB aggregation pipeline computes totals in one round-trip. Computing this client-side by summing all returned documents would break for large datasets and waste bandwidth.

**Why Vite over CRA?**  
CRA is unmaintained. Vite is faster in dev and produces smaller bundles.

---

## License

MIT
