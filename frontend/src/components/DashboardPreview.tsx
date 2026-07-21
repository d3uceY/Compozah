import type { DashboardConfig, WidgetInstance } from '../types';
import { WIDGET_CATALOG } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onBack: () => void;
}

export default function DashboardPreview({ config, onBack }: Props) {
  const getWidgetInfo = (w: WidgetInstance) =>
    WIDGET_CATALOG.find((c) => c.type === w.type);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>👁️ Dashboard Preview</h2>
        <p className="panel-subtitle">Review your dashboard configuration before generating.</p>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-value">{config.name}</div>
          <div className="summary-label">Project Name</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{config.tableName}</div>
          <div className="summary-label">Table</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{config.metrics.length}</div>
          <div className="summary-label">Metrics</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{config.widgets.length}</div>
          <div className="summary-label">Widgets</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{config.refreshSeconds}s</div>
          <div className="summary-label">Refresh Rate</div>
        </div>
      </div>

      {/* Metrics table */}
      <h3>📐 Metrics</h3>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Column</th>
              <th>Aggregation</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {config.metrics.map((m) => (
              <tr key={m.name}>
                <td><strong>{m.name}</strong></td>
                <td><code>{m.column}</code></td>
                <td>{m.aggregation.toUpperCase()}</td>
                <td>{m.unit || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Widgets grid */}
      <h3>🧩 Widgets</h3>
      <div className="preview-grid">
        {config.widgets.map((w) => {
          const info = getWidgetInfo(w);
          return (
            <div key={w.id} className={`preview-widget ${w.width >= 2 ? 'wide' : ''}`}>
              <div className="preview-widget-header">
                <span>{info?.icon}</span>
                <strong>{w.title}</strong>
              </div>
              <div className="preview-widget-body">
                <span className="widget-badge">{info?.name}</span>
                <div className="preview-widget-meta">
                  Linked to: <code>{w.metricId}</code>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
