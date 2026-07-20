// ============================================================
// Compozah TypeScript Types
// ============================================================

export interface ConnectionConfig {
  server: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface TableInfo {
  schema: string;
  name: string;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
  maxLength: number;
}

export type AggregationType = 'none' | 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface Metric {
  name: string;
  description: string;
  column: string;
  aggregation: AggregationType;
  unit: string;
  dataType: string;
}

export type WidgetType =
  | 'today_consumption'
  | 'hourly_trend'
  | 'daily_trend'
  | 'weekly_comparison'
  | 'monthly_trend'
  | 'machine_comparison'
  | 'pie_chart'
  | 'gauge'
  | 'data_table'
  | 'kpi'
  | 'efficiency'
  | 'cost'
  | 'forecast';

export interface WidgetInfo {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  metricId: string;
  width: number;
  height: number;
  config: Record<string, string>;
}

export interface DashboardConfig {
  name: string;
  description: string;
  connection: ConnectionConfig;
  tableName: string;
  timestampCol: string;
  machineCol: string;
  metrics: Metric[];
  widgets: WidgetInstance[];
  refreshSeconds: number;
  outputPath: string;
}

// UI state types
export type AppStep = 'connect' | 'schema' | 'metrics' | 'widgets' | 'generate';

export interface UIState {
  step: AppStep;
  config: DashboardConfig;
  tables: TableInfo[];
  columns: ColumnInfo[];
  availableWidgets: WidgetInfo[];
  isConnected: boolean;
  isGenerating: boolean;
  generatedPath: string;
  error: string | null;
}
