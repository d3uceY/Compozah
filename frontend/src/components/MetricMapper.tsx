import { useState } from 'react';
import type { DashboardConfig, Metric, AggregationType, ColumnInfo } from '../types';
import { getColumns } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const AGG_OPTIONS: { value: AggregationType; label: string }[] = [
  { value: 'none', label: 'None (raw value)' },
  { value: 'sum', label: 'SUM' },
  { value: 'avg', label: 'AVG' },
  { value: 'min', label: 'MIN' },
  { value: 'max', label: 'MAX' },
  { value: 'count', label: 'COUNT' },
];

export default function MetricMapper({ config, onChange, onNext, onBack }: Props) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [columnsLoaded, setColumnsLoaded] = useState(false);

  // Lazy-load columns for the selected table.
  const ensureColumns = async () => {
    if (columnsLoaded || !config.tableName) return;
    try {
      // We don't have the schema directly, so we pass empty string.
      const cols = await getColumns('dbo', config.tableName);
      setColumns(cols);
      setColumnsLoaded(true);
    } catch {
      // Fallback: try without schema.
    }
  };

  const addMetric = () => {
    const newMetric: Metric = {
      name: '',
      description: '',
      column: '',
      aggregation: 'none',
      unit: '',
      dataType: '',
    };
    onChange({ ...config, metrics: [...config.metrics, newMetric] });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string | AggregationType) => {
    const updated = config.metrics.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onChange({ ...config, metrics: updated });
  };

  const removeMetric = (index: number) => {
    onChange({ ...config, metrics: config.metrics.filter((_, i) => i !== index) });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Define Metrics</h2>
        <p className="panel-subtitle">
          Map database columns to dashboard metrics. Each metric represents a measurable value.
        </p>
      </div>

      {config.metrics.length === 0 && (
        <div className="empty-state" onMouseEnter={ensureColumns}>
          <p>No metrics defined yet. Add one to get started.</p>
          <button className="btn btn-primary" onClick={addMetric}>
            + Add Metric
          </button>
        </div>
      )}

      <div className="metrics-list">
        {config.metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-card-header">
              <span className="metric-number">Metric #{idx + 1}</span>
              <button className="btn-icon btn-danger" onClick={() => removeMetric(idx)} title="Remove">
                ✕
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) => updateMetric(idx, 'name', e.target.value)}
                  placeholder="e.g. Hourly Consumption"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={metric.unit}
                  onChange={(e) => updateMetric(idx, 'unit', e.target.value)}
                  placeholder="e.g. L, kWh, kg"
                />
              </div>
              <div className="form-group">
                <label>Database Column</label>
                <select
                  value={metric.column}
                  onChange={(e) => updateMetric(idx, 'column', e.target.value)}
                  onFocus={ensureColumns}
                >
                  <option value="">-- Select column --</option>
                  {columns.map((c) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.dataType})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Aggregation</label>
                <select
                  value={metric.aggregation}
                  onChange={(e) => updateMetric(idx, 'aggregation', e.target.value as AggregationType)}
                >
                  {AGG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <input
                  type="text"
                  value={metric.description}
                  onChange={(e) => updateMetric(idx, 'description', e.target.value)}
                  placeholder="What this metric represents..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {config.metrics.length > 0 && (
        <button className="btn btn-secondary" onClick={addMetric} style={{ marginTop: 12 }}>
          + Add Another Metric
        </button>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={config.metrics.length === 0 || config.metrics.some((m) => !m.name || !m.column)}
        >
          Next: Choose Widgets
        </button>
      </div>
    </div>
  );
}
