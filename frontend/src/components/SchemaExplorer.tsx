import { useState, useEffect } from 'react';
import type { TableInfo, ColumnInfo, DashboardConfig } from '../types';
import { getTables, getColumns } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SchemaExplorer({ config, onChange, onNext, onBack }: Props) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const tbls = await getTables();
      setTables(tbls);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
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

  const canProceed = config.tableName && config.timestampCol;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Schema Explorer</h2>
        <p className="panel-subtitle">Select a table and map your key columns.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="split-layout">
        {/* Tables list */}
        <div className="split-left">
          <h3>Tables</h3>
          {loading ? (
            <div className="loading">Loading tables...</div>
          ) : (
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
          )}
        </div>

        {/* Column mapping */}
        <div className="split-right">
          <h3>Column Mapping</h3>
          {config.tableName ? (
            <div className="form-stack">
              <div className="form-group">
                <label>Timestamp Column</label>
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
                <label>Machine Column (optional)</label>
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
                    <span key={c.name} className="column-tag">
                      {c.name}
                      <small>{c.dataType}</small>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-hint">Select a table to map its columns</div>
          )}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
          Next: Define Metrics
        </button>
      </div>
    </div>
  );
}
