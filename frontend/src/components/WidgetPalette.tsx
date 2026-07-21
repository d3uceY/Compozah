import { useState } from 'react';
import type { DashboardConfig, WidgetInstance, WidgetInfo } from '../types';
import { WIDGET_CATALOG } from '../hooks/useWails';

interface Props {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Simple SVG sparkline for line/trend chart previews. */
function SparkLine({ color = '#0066cc', points = [10, 25, 15, 40, 30, 55, 45] }: { color?: string; points?: number[] }) {
  const w = 100; const h = 36; const pad = 2;
  const max = Math.max(...points, 1);
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2));
  const ys = points.map((p) => h - pad - (p / max) * (h - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const areaD = `${d} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
      <path d={areaD} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Simple SVG bar chart preview. */
function BarChart({ color = '#0066cc', bars = [30, 55, 20, 70, 45, 60, 35] }: { color?: string; bars?: number[] }) {
  const w = 100; const h = 36; const pad = 2;
  const max = Math.max(...bars, 1);
  const barW = (w - pad * 2) / bars.length - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
      {bars.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        const x = pad + i * (barW + 2) + 1;
        return <rect key={i} x={x} y={h - pad - bh} width={barW} height={bh} fill={color} opacity={0.7} rx="1" />;
      })}
    </svg>
  );
}

/** Simple SVG pie chart preview. */
function PieChart({ color = '#0066cc' }: { color?: string }) {
  const slices = [
    { pct: 0.35, c: color },
    { pct: 0.25, c: color + '88' },
    { pct: 0.20, c: color + '55' },
    { pct: 0.15, c: color + '33' },
    { pct: 0.05, c: color + '22' },
  ];
  let angle = -Math.PI / 2;
  const cx = 18; const cy = 18; const r = 14;
  return (
    <svg viewBox="0 0 36 36" width="36" height="36">
      {slices.map((s, i) => {
        const da = s.pct * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        angle += da;
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        const large = da > Math.PI ? 1 : 0;
        return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={s.c} />;
      })}
    </svg>
  );
}

/** Renders a miniature preview of what a widget will look like with data. */
function WidgetPreview({ widget, metricName }: { widget: WidgetInstance; metricName: string }) {
  const colors = ['#0066cc', '#2997ff', '#30d158', '#ff9f0a', '#ff375f', '#5e5ce6'];
  const color = colors[widget.type.length % colors.length];

  const renderBody = () => {
    switch (widget.type) {
      case 'today_consumption':
      case 'kpi':
        return (
          <div className="lv-preview-kpi">
            <span className="lv-kpi-value">12,847</span>
            <span className="lv-kpi-unit">{metricName}</span>
          </div>
        );

      case 'hourly_trend':
      case 'daily_trend':
      case 'monthly_trend':
      case 'forecast':
        return (
          <div className="lv-preview-chart">
            <SparkLine color={color} />
          </div>
        );

      case 'weekly_comparison':
      case 'machine_comparison':
        return (
          <div className="lv-preview-chart">
            <BarChart color={color} />
          </div>
        );

      case 'pie_chart':
        return (
          <div className="lv-preview-pie">
            <PieChart color={color} />
            <span className="lv-pie-label">Distribution</span>
          </div>
        );

      case 'gauge':
        return (
          <div className="lv-preview-kpi">
            <span className="lv-kpi-value">73<span style={{fontSize:'0.5em'}}>%</span></span>
            <span className="lv-kpi-unit">{metricName}</span>
          </div>
        );

      case 'data_table':
        return (
          <div className="lv-preview-table">
            <div className="lv-mini-row"><span>{metricName}</span><span>--</span><span>--</span></div>
            <div className="lv-mini-row"><span>Row 2</span><span>--</span><span>--</span></div>
            <div className="lv-mini-row"><span>Row 3</span><span>--</span><span>--</span></div>
          </div>
        );

      case 'efficiency':
        return (
          <div className="lv-preview-kpi">
            <span className="lv-kpi-value">94<span style={{fontSize:'0.5em'}}>%</span></span>
            <span className="lv-kpi-unit">Efficiency</span>
          </div>
        );

      case 'cost':
        return (
          <div className="lv-preview-kpi">
            <span className="lv-kpi-value">$4,230</span>
            <span className="lv-kpi-unit">Total Cost</span>
          </div>
        );

      default:
        return <div className="lv-preview-placeholder">Chart preview</div>;
    }
  };

  return (
    <div className={`lv-widget-card ${widget.width >= 2 ? 'lv-widget-wide' : ''}`}>
      <div className="lv-widget-title">{widget.title}</div>
      {renderBody()}
    </div>
  );
}

export default function WidgetPalette({ config, onChange, onNext, onBack }: Props) {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
        <h2>Dashboard Widgets</h2>
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
                <div className="widget-type-tag">
                  <span className="widget-type-tag-letter">{w.icon}</span>
                </div>
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

      {/* Live preview toggle */}
      <div className="preview-toggle-row">
        <button
          className={`btn ${showPreview ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? '▼ Hide Preview' : '▶ Preview Dashboard'}
        </button>
        {showPreview && config.widgets.length > 0 && (
          <span className="preview-hint">Live preview of your dashboard layout</span>
        )}
      </div>

      {showPreview && (
        <div className="live-preview-panel">
          {config.widgets.length === 0 ? (
            <div className="empty-hint">Add widgets to see a live preview.</div>
          ) : (
            <div className="lv-grid">
              {config.widgets.map((w) => (
                <WidgetPreview
                  key={w.id}
                  widget={w}
                  metricName={config.metrics.find((m) => m.name === w.metricId)?.name || w.metricId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={config.widgets.length === 0}>
          Next: Generate
        </button>
      </div>
    </div>
  );
}
