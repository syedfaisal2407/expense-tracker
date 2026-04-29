import { CATEGORY_COLORS, fmt, fmtDate } from '../api.js';

const CATEGORY_ICONS = {
  Food: '🍽️',
  Transport: '🚌',
  Housing: '🏠',
  Entertainment: '🎬',
  Health: '💊',
  Shopping: '🛒',
  Other: '📦',
};

export default function ExpenseList({ expenses, onEdit, onDelete, filter, setFilter, categories }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💸</span>
        <p>No expenses yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="list-header">
        <h2 className="section-title">
          Expenses <span className="count-badge">{expenses.length}</span>
        </h2>
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_ICONS[c]} {c}
            </option>
          ))}
        </select>
      </div>

      <ul className="expenses">
        {expenses.map((exp) => (
          <li key={exp._id} className="expense-item">
            <div
              className="cat-dot"
              style={{ background: CATEGORY_COLORS[exp.category] || '#6b7280' }}
            />
            <div className="exp-info">
              <span className="exp-title">{exp.title}</span>
              {exp.note && <span className="exp-note">{exp.note}</span>}
              <span className="exp-meta">
                {CATEGORY_ICONS[exp.category]} {exp.category} &middot; {fmtDate(exp.date)}
              </span>
            </div>
            <div className="exp-right">
              <span className="exp-amount">{fmt(exp.amount)}</span>
              <div className="exp-actions">
                <button className="icon-btn" title="Edit" onClick={() => onEdit(exp)}>
                  ✏️
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  title="Delete"
                  onClick={() => onDelete(exp._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
