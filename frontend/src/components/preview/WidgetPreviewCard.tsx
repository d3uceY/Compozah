import type { WidgetInstance } from '../../types';
import { WIDGET_CATALOG } from '../../hooks/useWails';
import { MiniLine, MiniBar } from './ChartMocks';

interface Props {
  widget: WidgetInstance;
}

export default function WidgetPreviewCard({ widget }: Props) {
  const info = WIDGET_CATALOG.find((c) => c.type === widget.type);
  const isChart = widget.type.includes('trend') || widget.type.includes('comparison') || widget.type === 'forecast';
  const isBar = widget.type.includes('bar') || widget.type.includes('comparison');
  const isKpi = widget.type === 'today_consumption' || widget.type === 'kpi' || widget.type === 'gauge' || widget.type === 'efficiency' || widget.type === 'cost';

  return (
    <div className={`preview-widget ${widget.width >= 2 ? 'wide' : ''}`}>
      <div className="preview-widget-header">
        <span className="preview-widget-icon">{info?.icon ?? ''}</span>
        <strong>{widget.title}</strong>
      </div>
      <div className="preview-widget-body">
        {isChart && (isBar ? <MiniBar color="#0066cc" /> : <MiniLine color="#0066cc" />)}
        {isKpi && <div className="preview-kpi-num">{widget.type === 'cost' ? '$--' : '--'}</div>}
        {widget.type === 'pie_chart' && <div className="preview-kpi-num">Pie</div>}
        {widget.type === 'data_table' && <div className="preview-table-mock">Table</div>}
        <div className="preview-widget-meta">
          {info?.name ?? ''} &middot; {widget.metricId || 'unlinked'}
        </div>
      </div>
    </div>
  );
}
