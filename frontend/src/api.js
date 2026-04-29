const BASE = '/api/expenses';

export const api = {
  list: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return fetch(`${BASE}?${q}`).then((r) => r.json());
  },
  summary: () => fetch(`${BASE}/summary`).then((r) => r.json()),
  create: (body) =>
    fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()),
  update: (id, body) =>
    fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()),
  remove: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => r.json()),
};

export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Other'];

export const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Housing: '#8b5cf6',
  Entertainment: '#ec4899',
  Health: '#10b981',
  Shopping: '#f59e0b',
  Other: '#6b7280',
};

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
