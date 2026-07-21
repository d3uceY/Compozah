import { useState } from 'react';
import type { ConnectionConfig } from '../types';
import { connectToDatabase } from '../hooks/useWails';

interface Props {
  config: ConnectionConfig;
  onChange: (config: ConnectionConfig) => void;
  onConnected: () => void;
}

/**
 * Parse a raw SQL Server connection string into key-value pairs.
 * Handles semicolon-delimited `Key=Value` pairs with optional quoting.
 */
function parseConnectionString(raw: string): Record<string, string> {
  const kv: Record<string, string> = {};
  const parts = raw.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes.
    if (value.length >= 2 && (value.startsWith('"') || value.startsWith("'")) && value[0] === value[value.length - 1]) {
      value = value.slice(1, -1);
    }
    kv[key] = value;
  }
  return kv;
}

function isTruthy(v: string): boolean {
  const s = v.toLowerCase();
  return s === 'true' || s === 'yes' || s === 'sspi' || s === '1';
}

/**
 * Fills a ConnectionConfig from a raw connection string, returning a new object.
 */
function applyConnectionString(config: ConnectionConfig, raw: string): ConnectionConfig {
  const next = { ...config, connectionStringRaw: raw.trim() };
  if (!next.connectionStringRaw) return next;

  const kv = parseConnectionString(raw);

  // Server / Data Source
  next.server = kv['server'] || kv['data source'] || kv['addr'] || kv['address'] || next.server;

  // Port: separate key or embedded as server,port
  if (kv['port']) {
    const p = parseInt(kv['port'], 10);
    if (!isNaN(p)) next.port = p;
  }
  const comma = next.server.lastIndexOf(',');
  if (comma >= 0 && next.port === 1433) {
    const p = parseInt(next.server.slice(comma + 1), 10);
    if (!isNaN(p)) {
      next.port = p;
      next.server = next.server.slice(0, comma);
    }
  }

  // Database / Initial Catalog
  next.database = kv['database'] || kv['initial catalog'] || next.database;

  // Credentials
  next.username = kv['user id'] || kv['uid'] || kv['user'] || next.username;
  next.password = kv['password'] || kv['pwd'] || next.password;

  // Windows Auth takes precedence - clear credentials.
  if (isTruthy(kv['integrated security'] || '') || isTruthy(kv['trusted_connection'] || '')) {
    next.username = '';
    next.password = '';
  }

  return next;
}

export default function ConnectionPanel({ config, onChange, onConnected }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const update = (field: keyof ConnectionConfig, value: string | number) => {
    onChange({ ...config, [field]: value });
  };

  const handlePasteApply = () => {
    if (!pasteValue.trim()) return;
    const next = applyConnectionString(config, pasteValue);
    onChange(next);
    setPasteValue('');
    setShowPaste(false);
    setError(null);
  };

  const handleClearRaw = () => {
    onChange({ ...config, connectionStringRaw: '' });
    setError(null);
  };

  const handleConnect = async () => {
    if (!config.port || config.port < 1 || config.port > 65535) {
      setError('Port must be between 1 and 65535');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      await connectToDatabase(config);
      onConnected();
    } catch (e) {
      setError(String(e));
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>SQL Server Connection</h2>
        <p className="panel-subtitle">Connect to your database to discover tables and columns.</p>
      </div>

      {/* Paste connection string */}
      <div className="paste-section">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowPaste(!showPaste)}
        >
          {showPaste ? 'Cancel' : ' Paste connection string'}
        </button>
        {showPaste && (
          <div className="paste-area">
            <textarea
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder={`Paste your full connection string here, e.g.:\nData Source=localhost;Initial Catalog=MyDB;Integrated Security=True;Encrypt=True;TrustServerCertificate=True`}
              rows={4}
              className="paste-textarea"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePasteApply}
              disabled={!pasteValue.trim()}
            >
              Apply & Fill Fields
            </button>
          </div>
        )}
        {config.connectionStringRaw && (
          <div className="raw-string-preview">
            <div className="raw-string-header">
              <span className="raw-label">Using raw connection string</span>
              <button className="btn-icon raw-clear-btn" onClick={handleClearRaw} title="Clear connection string">
                ✕
              </button>
            </div>
            <code className="raw-code">{config.connectionStringRaw}</code>
          </div>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Server</label>
          <input
            type="text"
            value={config.server}
            onChange={(e) => update('server', e.target.value)}
            placeholder="localhost"
          />
        </div>
        <div className="form-group">
          <label>Port</label>
          <input
            type="number"
            value={config.port > 0 ? config.port : ''}
            onChange={(e) => update('port', parseInt(e.target.value, 10) || 0)}
            placeholder="1433"
            min={1}
            max={65535}
          />
        </div>
        <div className="form-group">
          <label>Database</label>
          <input
            type="text"
            value={config.database}
            onChange={(e) => update('database', e.target.value)}
            placeholder="MyDatabase"
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => update('username', e.target.value)}
            placeholder="sa (leave blank for Windows Auth)"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={handleConnect}
        disabled={connecting || !config.server || (!config.database && !config.connectionStringRaw)}
      >
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
}
