import { useState } from 'react';
import type { ConnectionConfig } from '../types';
import { connectToDatabase } from '../hooks/useWails';

interface Props {
  config: ConnectionConfig;
  onChange: (config: ConnectionConfig) => void;
  onConnected: () => void;
}

export default function ConnectionPanel({ config, onChange, onConnected }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof ConnectionConfig, value: string | number) => {
    onChange({ ...config, [field]: value });
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
            placeholder="sa"
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
        disabled={connecting || !config.server || !config.database}
      >
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
}
