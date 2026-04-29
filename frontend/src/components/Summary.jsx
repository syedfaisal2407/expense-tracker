import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fmt, CATEGORY_COLORS } from '../api.js';

export default function Summary({ summary }) {
  if (!summary) return null;

  const { grandTotal, byCategory } = summary;

  const chartData = byCategory.map((c) => ({
    name: c.category,
    value: parseFloat(c.total.toFixed(2)),
  }));

  return (
    <div className="summary">
      <h2 className="section-title">Overview</h2>

      <div className="stat-grid">
        <div className="stat-card stat-card--primary">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value">{fmt(grandTotal.total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{grandTotal.count}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg / Item</span>
          <span className="stat-value">{fmt(grandTotal.avg || 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Largest</span>
          <span className="stat-value">{fmt(grandTotal.max || 0)}</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="category-breakdown">
        {byCategory.map((c) => (
          <div key={c.category} className="cat-row">
            <div className="cat-label">
              <div
                className="cat-swatch"
                style={{ background: CATEGORY_COLORS[c.category] || '#6b7280' }}
              />
              <span>{c.category}</span>
            </div>
            <div className="cat-bar-wrap">
              <div
                className="cat-bar"
                style={{
                  width: `${(c.total / grandTotal.total) * 100}%`,
                  background: CATEGORY_COLORS[c.category] || '#6b7280',
                }}
              />
            </div>
            <span className="cat-total">{fmt(c.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
