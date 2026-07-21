import type { DashboardConfig } from '../types';
import WidgetPreviewCard from './preview/WidgetPreviewCard';

interface Props {
  config: DashboardConfig;
  onBack: () => void;
  onNext?: () => void;
}

function SummaryCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="summary-card">
      <div className="summary-value">{value}</div>
      <div className="summary-label">{label}</div>
    </div>
  );
}

function MetricsTable({ config }: { config: DashboardConfig }) {
  if (config.metrics.length === 0) return null;
  return (
    <>
      <h3>Metrics</h3>
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
                <td>{m.unit || '\u2014'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function WidgetGrid({ config }: { config: DashboardConfig }) {
  if (config.widgets.length === 0) return null;
  return (
    <>
      <h3>Widget Layout</h3>
      <div className="preview-grid">
        {config.widgets.map((w) => (
          <WidgetPreviewCard key={w.id} widget={w} />
        ))}
      </div>
    </>
  );
}

export default function DashboardPreview({ config, onBack, onNext }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Dashboard Preview</h2>
        <p className="panel-subtitle">Review your dashboard layout and configuration before generating.</p>
      </div>

      <div className="summary-grid">
        <SummaryCard value={config.name} label="Project" />
        <SummaryCard value={config.tableName || '\u2014'} label="Table" />
        <SummaryCard value={config.metrics.length} label="Metrics" />
        <SummaryCard value={config.widgets.length} label="Widgets" />
        <SummaryCard value={`${config.refreshSeconds}s`} label="Refresh" />
      </div>

      <MetricsTable config={config} />
      <WidgetGrid config={config} />

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        {onNext && (
          <button className="btn btn-primary" onClick={onNext}>
            Next: Export
          </button>
        )}
      </div>
    </div>
  );
}
