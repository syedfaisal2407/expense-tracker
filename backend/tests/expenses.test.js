/**
 * Expense Tracker API - Test Suite
 * Strategy: Mock Mongoose model methods so tests run without a real MongoDB.
 */

jest.mock('../models/Expense');
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({}),
    connection: { readyState: 1 },
  };
});

const request = require('supertest');
const app = require('../server');
const Expense = require('../models/Expense');

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockExpense = {
  _id: '64a1b2c3d4e5f6a7b8c9d0e1',
  title: 'Lunch at Subway',
  amount: 12.5,
  category: 'Food',
  date: '2024-03-15T00:00:00.000Z',
  note: '',
};

const mockExpenses = [
  { ...mockExpense, _id: '1', title: 'Grocery run', amount: 75, category: 'Food' },
  { ...mockExpense, _id: '2', title: 'Bus pass', amount: 30, category: 'Transport' },
  { ...mockExpense, _id: '3', title: 'Netflix', amount: 15.99, category: 'Entertainment' },
];

const chainableMock = (resolvedValue) => {
  const chain = { sort: jest.fn(), limit: jest.fn() };
  chain.sort.mockReturnValue(chain);
  chain.limit.mockResolvedValue(resolvedValue);
  return chain;
};

beforeEach(() => jest.clearAllMocks());

// ─── Health ───────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── GET /api/expenses ────────────────────────────────────────────────────────
describe('GET /api/expenses', () => {
  test('returns all expenses', async () => {
    Expense.find.mockReturnValue(chainableMock(mockExpenses));
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(3);
  });

  test('filters by category', async () => {
    const foodOnly = mockExpenses.filter((e) => e.category === 'Food');
    Expense.find.mockReturnValue(chainableMock(foodOnly));
    const res = await request(app).get('/api/expenses?category=Food');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(Expense.find).toHaveBeenCalledWith(expect.objectContaining({ category: 'Food' }));
  });

  test('applies date range filter', async () => {
    Expense.find.mockReturnValue(chainableMock(mockExpenses));
    await request(app).get('/api/expenses?startDate=2024-03-01&endDate=2024-03-31');
    expect(Expense.find).toHaveBeenCalledWith(
      expect.objectContaining({ date: expect.objectContaining({ $gte: expect.any(Date) }) })
    );
  });

  test('returns empty array when no expenses', async () => {
    Expense.find.mockReturnValue(chainableMock([]));
    const res = await request(app).get('/api/expenses');
    expect(res.body.count).toBe(0);
  });

  test('handles DB error gracefully', async () => {
    Expense.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockRejectedValue(new Error('DB error')),
    });
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/expenses/summary ────────────────────────────────────────────────
describe('GET /api/expenses/summary', () => {
  test('returns grand total and category breakdown', async () => {
    Expense.aggregate
      .mockResolvedValueOnce([
        { _id: 'Food', total: 120, count: 2, avg: 60 },
        { _id: 'Transport', total: 30, count: 1, avg: 30 },
      ])
      .mockResolvedValueOnce([{ _id: null, total: 150, count: 3, avg: 50, max: 75 }]);

    const res = await request(app).get('/api/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.grandTotal.total).toBe(150);
    expect(res.body.data.byCategory).toHaveLength(2);
  });

  test('handles empty database', async () => {
    Expense.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = await request(app).get('/api/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.grandTotal.total).toBe(0);
  });
});

// ─── GET /api/expenses/:id ────────────────────────────────────────────────────
describe('GET /api/expenses/:id', () => {
  test('returns an expense by id', async () => {
    Expense.findById.mockResolvedValue(mockExpense);
    const res = await request(app).get(`/api/expenses/${mockExpense._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(mockExpense._id);
  });

  test('returns 404 when not found', async () => {
    Expense.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/expenses/000000000000000000000000');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ─── POST /api/expenses ───────────────────────────────────────────────────────
describe('POST /api/expenses', () => {
  test('creates with valid data', async () => {
    Expense.create.mockResolvedValue(mockExpense);
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: 'Lunch', amount: 12.5, category: 'Food', date: '2024-03-15' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Lunch at Subway');
  });

  test('handles ValidationError', async () => {
    const err = Object.assign(new Error('Validation failed'), {
      name: 'ValidationError',
      errors: { title: { message: 'Title is required' } },
    });
    Expense.create.mockRejectedValue(err);
    const res = await request(app).post('/api/expenses').send({ amount: 10, category: 'Food' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  test('handles server error on create', async () => {
    Expense.create.mockRejectedValue(new Error('Connection lost'));
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: 'Test', amount: 10, category: 'Food' });
    expect(res.status).toBe(500);
  });
});

// ─── PUT /api/expenses/:id ────────────────────────────────────────────────────
describe('PUT /api/expenses/:id', () => {
  test('updates an expense', async () => {
    Expense.findByIdAndUpdate.mockResolvedValue({ ...mockExpense, amount: 25 });
    const res = await request(app)
      .put(`/api/expenses/${mockExpense._id}`)
      .send({ amount: 25 });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(25);
  });

  test('passes correct options to findByIdAndUpdate', async () => {
    Expense.findByIdAndUpdate.mockResolvedValue(mockExpense);
    await request(app).put(`/api/expenses/${mockExpense._id}`).send({ amount: 10 });
    expect(Expense.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({ new: true, runValidators: true })
    );
  });

  test('returns 404 when not found', async () => {
    Expense.findByIdAndUpdate.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/expenses/000000000000000000000000')
      .send({ amount: 10 });
    expect(res.status).toBe(404);
  });

  test('handles ValidationError on update', async () => {
    const err = Object.assign(new Error('Validation failed'), {
      name: 'ValidationError',
      errors: { amount: { message: 'Amount must be positive' } },
    });
    Expense.findByIdAndUpdate.mockRejectedValue(err);
    const res = await request(app)
      .put(`/api/expenses/${mockExpense._id}`)
      .send({ amount: -99 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/positive/i);
  });
});

// ─── DELETE /api/expenses/:id ─────────────────────────────────────────────────
describe('DELETE /api/expenses/:id', () => {
  test('deletes and returns success', async () => {
    Expense.findByIdAndDelete.mockResolvedValue(mockExpense);
    const res = await request(app).delete(`/api/expenses/${mockExpense._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('returns 404 when not found', async () => {
    Expense.findByIdAndDelete.mockResolvedValue(null);
    const res = await request(app).delete('/api/expenses/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  test('handles DB error', async () => {
    Expense.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(`/api/expenses/${mockExpense._id}`);
    expect(res.status).toBe(500);
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  test('returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
