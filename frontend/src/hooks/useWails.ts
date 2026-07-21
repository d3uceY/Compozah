// ============================================================
// Compozah Wails Service Bindings
// ============================================================
// These functions call the Go backend services exposed via Wails.
// In Wails v3, services are accessible via `window.go.service.<ServiceName>.<Method>()`

import type {
  ConnectionConfig,
  TableInfo,
  ColumnInfo,
  DashboardConfig,
  WidgetInfo,
} from '../types';

// Extend the Window interface to include Wails runtime.
declare global {
  interface Window {
    go: {
      service: {
        DatabaseService: {
          Connect(config: ConnectionConfig): Promise<void>;
          Disconnect(): Promise<void>;
          IsConnected(): Promise<boolean>;
          GetTables(): Promise<TableInfo[]>;
          GetColumns(schema: string, table: string): Promise<ColumnInfo[]>;
        };
        ConfigService: {
          SaveDashboard(cfg: DashboardConfig): Promise<void>;
          LoadDashboard(name: string): Promise<DashboardConfig>;
          ListDashboards(): Promise<string[]>;
          DeleteDashboard(name: string): Promise<void>;
        };
        GeneratorService: {
          Generate(cfg: DashboardConfig): Promise<string>;
        };
        ProjectExporter: {
          ExportToZip(projectDir: string): Promise<string>;
          GetProjectSize(projectDir: string): Promise<number>;
        };
        AppInfoService: {
          GetVersion(): Promise<string>;
        };
      };
    };
  }
}

// --- Database Service ---

export async function connectToDatabase(config: ConnectionConfig): Promise<void> {
  await window.go.service.DatabaseService.Connect(config);
}

export async function disconnectDatabase(): Promise<void> {
  await window.go.service.DatabaseService.Disconnect();
}

export async function isConnected(): Promise<boolean> {
  return window.go.service.DatabaseService.IsConnected();
}

export async function getTables(): Promise<TableInfo[]> {
  return window.go.service.DatabaseService.GetTables();
}

export async function getColumns(schema: string, table: string): Promise<ColumnInfo[]> {
  return window.go.service.DatabaseService.GetColumns(schema, table);
}

// --- Config Service ---

export async function saveDashboard(cfg: DashboardConfig): Promise<void> {
  await window.go.service.ConfigService.SaveDashboard(cfg);
}

export async function loadDashboard(name: string): Promise<DashboardConfig> {
  return window.go.service.ConfigService.LoadDashboard(name);
}

export async function listDashboards(): Promise<string[]> {
  return window.go.service.ConfigService.ListDashboards();
}

export async function deleteDashboard(name: string): Promise<void> {
  await window.go.service.ConfigService.DeleteDashboard(name);
}

// --- Generator Service ---

export async function generateProject(cfg: DashboardConfig): Promise<string> {
  return window.go.service.GeneratorService.Generate(cfg);
}

// --- Exporter Service ---

export async function exportToZip(projectDir: string): Promise<string> {
  return window.go.service.ProjectExporter.ExportToZip(projectDir);
}

export async function getProjectSize(projectDir: string): Promise<number> {
  return window.go.service.ProjectExporter.GetProjectSize(projectDir);
}

// --- App Info Service ---

export async function getAppVersion(): Promise<string> {
  return window.go.service.AppInfoService.GetVersion();
}

// --- Widget Catalog (client-side) ---

export const WIDGET_CATALOG: WidgetInfo[] = [
  { type: 'today_consumption', name: "Today's Consumption", description: 'Large KPI number showing today\'s total.', icon: 'TC' },
  { type: 'hourly_trend', name: 'Hourly Trend', description: 'Line chart of hourly consumption.', icon: 'HT' },
  { type: 'daily_trend', name: 'Daily Trend', description: 'Bar chart of daily aggregates.', icon: 'DT' },
  { type: 'weekly_comparison', name: 'Weekly Comparison', description: 'Compare week-over-week by machine.', icon: 'WC' },
  { type: 'monthly_trend', name: 'Monthly Trend', description: 'Line chart of monthly aggregates.', icon: 'MT' },
  { type: 'machine_comparison', name: 'Machine Comparison', description: 'Side-by-side machine bars.', icon: 'MC' },
  { type: 'pie_chart', name: 'Pie Chart', description: 'Distribution pie chart.', icon: 'PC' },
  { type: 'gauge', name: 'Gauge', description: 'Current value within a range.', icon: 'GA' },
  { type: 'data_table', name: 'Data Table', description: 'Raw data with sorting.', icon: 'TB' },
  { type: 'kpi', name: 'KPI Card', description: 'Single key performance indicator.', icon: 'KPI' },
  { type: 'efficiency', name: 'Efficiency', description: 'Efficiency percentage display.', icon: 'EF' },
  { type: 'cost', name: 'Cost', description: 'Cost calculation and trend.', icon: 'CO' },
  { type: 'forecast', name: 'Forecast', description: 'Predicted future trend.', icon: 'FC' },
];
