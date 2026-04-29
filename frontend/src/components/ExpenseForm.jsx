import { useState, useEffect } from 'react';
import { CATEGORIES } from '../api.js';

const today = () => new Date().toISOString().split('T')[0];

const empty = { title: '', amount: '', category: 'Food', date: today(), note: '' };

export default function ExpenseForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        amount: editing.amount,
        category: editing.category,
        date: editing.date.split('T')[0],
        note: editing.note || '',
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [editing]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Amount must be positive');
    setLoading(true);
    const result = await onSave({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
    if (result?.error) setError(result.error);
    else setForm(empty);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{editing ? 'Edit Expense' : 'Add Expense'}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="field">
          <label>Title</label>
          <input
            type="text"
            placeholder="What did you spend on?"
            value={form.title}
            onChange={set('title')}
            maxLength={100}
          />
        </div>

        <div className="field">
          <label>Amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={set('amount')}
          />
        </div>

        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>

        <div className="field field--full">
          <label>Note (optional)</label>
          <input
            type="text"
            placeholder="Any details..."
            value={form.note}
            onChange={set('note')}
            maxLength={300}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : editing ? 'Update' : 'Add Expense'}
        </button>
        {editing && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
