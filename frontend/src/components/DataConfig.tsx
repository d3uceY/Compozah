import { useState, useEffect } from 'react';
import type { DashboardConfig, TableInfo, ColumnInfo, Metric, AggregationType } from '../types';
import { getTables, getColumns, getDatabases, switchDatabase, getCurrentDatabase } from '../hooks/useWails';

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

export default function DataConfig({ config, onChange, onNext, onBack }: Props) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [activeDb, setActiveDb] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const [dbs, currentDb] = await Promise.all([getDatabases(), getCurrentDatabase()]);
      setDatabases(dbs);
      setActiveDb(currentDb);
      const tbls = await getTables();
      setTables(tbls);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchDb = async (db: string) => {
    try {
      setError(null);
      await switchDatabase(db);
      setActiveDb(db);
      const tbls = await getTables();
      setTables(tbls);
      // Reset table selection when switching databases.
      onChange({ ...config, tableName: '', timestampCol: '', machineCol: '', metrics: [] });
      setColumns([]);
    } catch (e) {
      setError(String(e));
    }
  };

  const selectTable = async (schema: string, name: string) => {
    onChange({ ...config, tableName: name, timestampCol: '', machineCol: '' });
    try {
      const cols = await getColumns(schema, name);
      setColumns(cols);
    } catch (e) {
      setError(String(e));
    }
  };

  // --- Metrics ---
  const addMetric = (columnName?: string, dataType?: string) => {
    const m: Metric = {
      name: '',
      description: '',
      column: columnName || '',
      aggregation: 'none',
      unit: '',
      dataType: dataType || '',
    };
    onChange({ ...config, metrics: [...config.metrics, m] });
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

  const canProceed = config.tableName && config.timestampCol && config.metrics.length > 0
    && config.metrics.every((m) => m.name && m.column);

  if (loading) return <div className="panel"><div className="loading">Loading…</div></div>;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Data Configuration</h2>
        <p className="panel-subtitle">Select a database, explore tables, map columns, and define your metrics.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Database selector */}
      <div className="db-bar">
        <label className="db-bar-label">Database</label>
        <select className="db-bar-select" value={activeDb} onChange={(e) => handleSwitchDb(e.target.value)}>
          {databases.map((db) => (
            <option key={db} value={db}>{db}</option>
          ))}
          {databases.length === 0 && <option value={activeDb}>{activeDb}</option>}
        </select>
        {activeDb === 'master' && (
          <span className="db-warning">You are connected to the system database. Switch to your application database above.</span>
        )}
      </div>

      <div className="split-layout">
        {/* Tables */}
        <div className="split-left">
          <h3>Tables</h3>
          <div className="list-scroll">
            {tables.map((t) => (
              <button
                key={`${t.schema}.${t.name}`}
                className={`list-item ${config.tableName === t.name ? 'active' : ''}`}
                onClick={() => selectTable(t.schema, t.name)}
              >
                <div>
                  <div className="list-item-name">{t.name}</div>
                  <div className="list-item-sub">{t.schema}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column mapping + metrics */}
        <div className="split-right">
          {config.tableName ? (
            <>
              <h3>Key Columns</h3>
              <div className="form-stack">
                <div className="form-group">
                  <label>Date / Time Column</label>
                  <div className="label-hint">Used for time-series charts (hourly, daily, monthly trends)</div>
                  <select
                    value={config.timestampCol}
                    onChange={(e) => onChange({ ...config, timestampCol: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.dataType})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Group / Filter Column (optional)</label>
                  <div className="label-hint">Splits charts by this column (e.g. machine, region, category)</div>
                  <select
                    value={config.machineCol}
                    onChange={(e) => onChange({ ...config, machineCol: e.target.value })}
                  >
                    <option value="">-- None --</option>
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.dataType})</option>
                    ))}
                  </select>
                </div>
                <div className="columns-preview">
                  <h4>Available Columns ({columns.length})</h4>
                  <div className="column-tags">
                    {columns.map((c) => (
                      <button
                        key={c.name}
                        className="column-tag clickable"
                        onClick={() => addMetric(c.name, c.dataType)}
                        title={`Add metric for ${c.name}`}
                      >
                        {c.name}
                        <small>{c.dataType}</small>
                        <span className="column-tag-plus">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-hint">Select a table to map its columns and define metrics.</div>
          )}
        </div>
      </div>

      {/* Metrics section */}
      {config.tableName && (
        <div className="metrics-section">
          <h3>Metrics ({config.metrics.length})</h3>
          {config.metrics.length === 0 && (
            <div className="empty-state" style={{ marginTop: 0, padding: '20px' }}>
              <p>Click a column above to add a metric, or use the button below.</p>
              <button className="btn btn-primary btn-sm" onClick={() => addMetric()}>+ Add Metric</button>
            </div>
          )}
          <div className="metrics-list">
            {config.metrics.map((metric, idx) => (
              <div key={idx} className="metric-card">
                <div className="metric-card-header">
                  <span className="metric-number">Metric #{idx + 1}</span>
                  <button className="btn-icon" onClick={() => removeMetric(idx)} title="Remove">✕</button>
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
                    <label>Column</label>
                    <select
                      value={metric.column}
                      onChange={(e) => updateMetric(idx, 'column', e.target.value)}
                    >
                      <option value="">-- Select --</option>
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
                </div>
              </div>
            ))}
          </div>
          {config.metrics.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => addMetric()} style={{ marginTop: 8 }}>
              + Add Metric
            </button>
          )}
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
          Next: Choose Widgets
        </button>
      </div>
    </div>
  );
}
