import { useState, useEffect, useCallback } from 'react';
import { api, CATEGORIES } from './api.js';
import ExpenseForm from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Summary from './components/Summary.jsx';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('list'); // 'list' | 'summary'
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const [listRes, sumRes] = await Promise.all([
      api.list(filter ? { category: filter } : {}),
      api.summary(),
    ]);
    if (listRes.success) setExpenses(listRes.data);
    if (sumRes.success) setSummary(sumRes.data);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (body) => {
    let res;
    if (editing) {
      res = await api.update(editing._id, body);
    } else {
      res = await api.create(body);
    }
    if (res.success) {
      setEditing(null);
      load();
      notify(editing ? 'Expense updated' : 'Expense added');
    } else {
      return { error: res.message };
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    const res = await api.remove(id);
    if (res.success) {
      load();
      notify('Expense deleted', 'info');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">Ledger</span>
          </div>
          <nav className="tabs">
            <button
              className={`tab ${tab === 'list' ? 'tab--active' : ''}`}
              onClick={() => setTab('list')}
            >
              Expenses
            </button>
            <button
              className={`tab ${tab === 'summary' ? 'tab--active' : ''}`}
              onClick={() => setTab('summary')}
            >
              Summary
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <ExpenseForm
            editing={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />

          {tab === 'list' ? (
            <ExpenseList
              expenses={expenses}
              onEdit={setEditing}
              onDelete={handleDelete}
              filter={filter}
              setFilter={setFilter}
              categories={CATEGORIES}
            />
          ) : (
            <Summary summary={summary} />
          )}
        </div>
      </main>

      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
