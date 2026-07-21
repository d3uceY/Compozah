// ============================================================
// Compozah Wails Service Bindings
// ============================================================
// Wails v3 generates typed bindings in frontend/bindings/.
// Import directly from those — do NOT use window.go (that is Wails v2).

import type { WidgetInfo, ConnectionConfig, DashboardConfig, TableInfo, ColumnInfo } from '../types';

import * as DatabaseService from '../../bindings/compozah/services/databaseservice';
import * as ConfigService from '../../bindings/compozah/services/configservice';
import * as GeneratorService from '../../bindings/compozah/services/generatorservice';
import * as ProjectExporter from '../../bindings/compozah/services/projectexporter';
import * as AppInfoService from '../../bindings/compozah/services/appinfoservice';


// --- Database Service ---

export async function connectToDatabase(config: ConnectionConfig): Promise<void> {
  await DatabaseService.Connect(config as any);
}

export async function disconnectDatabase(): Promise<void> {
  await DatabaseService.Disconnect();
}

export async function isConnected(): Promise<boolean> {
  return DatabaseService.IsConnected();
}

export async function getTables(): Promise<TableInfo[]> {
  return DatabaseService.GetTables() as any;
}

export async function getColumns(schema: string, table: string): Promise<ColumnInfo[]> {
  return DatabaseService.GetColumns(schema, table) as any;
}

// --- Config Service ---

export async function saveDashboard(cfg: DashboardConfig): Promise<void> {
  await ConfigService.SaveDashboard(cfg as any);
}

export async function loadDashboard(name: string): Promise<DashboardConfig> {
  return ConfigService.LoadDashboard(name) as any;
}

export async function listDashboards(): Promise<string[]> {
  return ConfigService.ListDashboards();
}

export async function deleteDashboard(name: string): Promise<void> {
  await ConfigService.DeleteDashboard(name);
}

// --- Generator Service ---

export async function generateProject(cfg: DashboardConfig): Promise<string> {
  return GeneratorService.Generate(cfg as any);
}

// --- Exporter Service ---

export async function exportToZip(projectDir: string): Promise<string> {
  return ProjectExporter.ExportToZip(projectDir);
}

export async function getProjectSize(projectDir: string): Promise<number> {
  return ProjectExporter.GetProjectSize(projectDir);
}

// --- App Info Service ---

export async function getAppVersion(): Promise<string> {
  return AppInfoService.GetVersion();
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
