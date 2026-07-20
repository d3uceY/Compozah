import { useState } from 'react';
import type { DashboardConfig, WidgetInstance, WidgetInfo } from '../types';
import { WIDGET_CATALOG } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function WidgetPalette({ config, onChange, onNext, onBack }: Props) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  const addWidget = (info: WidgetInfo) => {
    const widget: WidgetInstance = {
      id: crypto.randomUUID(),
      type: info.type,
      title: info.name,
      metricId: config.metrics[0]?.name || '',
      width: 1,
      height: 1,
      config: {},
    };
    onChange({ ...config, widgets: [...config.widgets, widget] });
  };

  const removeWidget = (id: string) => {
    onChange({ ...config, widgets: config.widgets.filter((w) => w.id !== id) });
  };

  const updateWidget = (id: string, field: keyof WidgetInstance, value: string | number) => {
    onChange({
      ...config,
      widgets: config.widgets.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    });
  };

  const handleDragStart = (e: React.DragEvent, info: WidgetInfo) => {
    e.dataTransfer.setData('widgetType', info.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widgetType');
    const info = WIDGET_CATALOG.find((w) => w.type === widgetType);
    if (info) addWidget(info);
    setDragOver(null);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>🧩 Dashboard Widgets</h2>
        <p className="panel-subtitle">
          Drag widgets from the palette onto your dashboard, or click to add them.
        </p>
      </div>

      <div className="split-layout">
        {/* Widget palette */}
        <div className="split-left">
          <h3>Widget Palette</h3>
          <div className="widget-palette-list">
            {WIDGET_CATALOG.map((w) => (
              <button
                key={w.type}
                className="widget-palette-item"
                draggable
                onDragStart={(e) => handleDragStart(e, w)}
                onClick={() => addWidget(w)}
              >
                <span className="widget-palette-icon">{w.icon}</span>
                <div>
                  <div className="widget-palette-name">{w.name}</div>
                  <div className="widget-palette-desc">{w.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard drop zone */}
        <div className="split-right">
          <h3>Your Dashboard ({config.widgets.length} widgets)</h3>
          <div
            className={`dashboard-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragOver('zone')}
            onDragLeave={() => setDragOver(null)}
            onDrop={handleDrop}
          >
            {config.widgets.length === 0 ? (
              <div className="empty-hint">
                Drag widgets here or click them in the palette to add to your dashboard.
              </div>
            ) : (
              <div className="placed-widgets">
                {config.widgets.map((w) => (
                  <div key={w.id} className="placed-widget-card">
                    <div className="placed-widget-header">
                      <input
                        type="text"
                        value={w.title}
                        onChange={(e) => updateWidget(w.id, 'title', e.target.value)}
                        className="inline-input"
                      />
                      <button className="btn-icon btn-danger" onClick={() => removeWidget(w.id)}>
                        ✕
                      </button>
                    </div>
                    <div className="placed-widget-body">
                      <span className="widget-badge">
                        {WIDGET_CATALOG.find((c) => c.type === w.type)?.icon}{' '}
                        {WIDGET_CATALOG.find((c) => c.type === w.type)?.name}
                      </span>
                      <div className="form-group" style={{ marginTop: 8 }}>
                        <label>Linked Metric</label>
                        <select
                          value={w.metricId}
                          onChange={(e) => updateWidget(w.id, 'metricId', e.target.value)}
                        >
                          {config.metrics.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row" style={{ marginTop: 8 }}>
                        <div className="form-group">
                          <label>Width</label>
                          <select
                            value={w.width}
                            onChange={(e) => updateWidget(w.id, 'width', parseInt(e.target.value))}
                          >
                            <option value={1}>1 col</option>
                            <option value={2}>2 cols</option>
                            <option value={3}>Full width</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={config.widgets.length === 0}>
          Next: Generate
        </button>
      </div>
    </div>
  );
}
