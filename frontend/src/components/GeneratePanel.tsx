import { useState } from 'react';
import type { DashboardConfig } from '../types';
import { generateProject, exportToZip, saveDashboard } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onBack: () => void;
}

export default function GeneratePanel({ config, onChange, onBack }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);
  const [zipPath, setZipPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setZipPath(null);
    try {
      // Save the config first.
      await saveDashboard(config);

      // Generate the full ASP.NET Core project.
      const path = await generateProject(config);
      setGeneratedPath(path);

      // Also create a zip for easy download.
      const zip = await exportToZip(path);
      setZipPath(zip);
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Generate Dashboard</h2>
        <p className="panel-subtitle">
          Configure output options and generate your ASP.NET Core dashboard project.
        </p>
      </div>

      <div className="form-stack">
        <div className="form-group">
          <label>Project Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChange({ ...config, name: e.target.value })}
            placeholder="MyDashboard"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={config.description}
            onChange={(e) => onChange({ ...config, description: e.target.value })}
            placeholder="Dashboard description..."
          />
        </div>
        <div className="form-group">
          <label>Output Path</label>
          <input
            type="text"
            value={config.outputPath}
            onChange={(e) => onChange({ ...config, outputPath: e.target.value })}
            placeholder="./output"
          />
        </div>
        <div className="form-group">
          <label>Refresh Interval (seconds)</label>
          <input
            type="number"
            value={config.refreshSeconds}
            onChange={(e) =>
              onChange({ ...config, refreshSeconds: parseInt(e.target.value) || 60 })
            }
            min={5}
            max={3600}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {generatedPath && (
        <div className="success-banner">
          <strong>Project generated successfully.</strong>
          <div>Output: <code>{generatedPath}</code></div>
          {zipPath && <div>Zip: <code>{zipPath}</code></div>}
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button
          className="btn btn-primary btn-large"
          onClick={handleGenerate}
          disabled={generating || !config.name}
        >
          {generating ? 'Generating...' : 'Generate ASP.NET Core Dashboard'}
        </button>
      </div>
    </div>
  );
}
