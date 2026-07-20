package models

// WidgetType represents the kind of dashboard widget.
type WidgetType string

const (
	WidgetTodayConsumption  WidgetType = "today_consumption"
	WidgetHourlyTrend       WidgetType = "hourly_trend"
	WidgetDailyTrend        WidgetType = "daily_trend"
	WidgetWeeklyComparison  WidgetType = "weekly_comparison"
	WidgetMonthlyTrend      WidgetType = "monthly_trend"
	WidgetMachineComparison WidgetType = "machine_comparison"
	WidgetPieChart          WidgetType = "pie_chart"
	WidgetGauge             WidgetType = "gauge"
	WidgetDataTable         WidgetType = "data_table"
	WidgetKPI               WidgetType = "kpi"
	WidgetEfficiency        WidgetType = "efficiency"
	WidgetCost              WidgetType = "cost"
	WidgetForecast          WidgetType = "forecast"
)

// WidgetInfo provides metadata for each widget type shown in the palette.
type WidgetInfo struct {
	Type        WidgetType `json:"type"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Icon        string     `json:"icon"`
}

// AllWidgets returns the catalog of all available widgets.
func AllWidgets() []WidgetInfo {
	return []WidgetInfo{
		{Type: WidgetTodayConsumption, Name: "Today's Consumption", Description: "Shows today's total consumption as a large number.", Icon: "gauge"},
		{Type: WidgetHourlyTrend, Name: "Hourly Trend", Description: "Line chart of consumption by hour.", Icon: "chart-line"},
		{Type: WidgetDailyTrend, Name: "Daily Trend", Description: "Bar chart of daily consumption.", Icon: "chart-bar"},
		{Type: WidgetWeeklyComparison, Name: "Weekly Comparison", Description: "Compare machines or metrics week-over-week.", Icon: "columns"},
		{Type: WidgetMonthlyTrend, Name: "Monthly Trend", Description: "Line chart of monthly aggregates.", Icon: "chart-line"},
		{Type: WidgetMachineComparison, Name: "Machine Comparison", Description: "Side-by-side comparison across machines.", Icon: "table"},
		{Type: WidgetPieChart, Name: "Pie Chart", Description: "Distribution pie chart of a metric.", Icon: "pie-chart"},
		{Type: WidgetGauge, Name: "Gauge", Description: "Gauge showing current value against a range.", Icon: "gauge"},
		{Type: WidgetDataTable, Name: "Data Table", Description: "Raw data table with sorting and filtering.", Icon: "table"},
		{Type: WidgetKPI, Name: "KPI Card", Description: "Single key performance indicator.", Icon: "dashboard"},
		{Type: WidgetEfficiency, Name: "Efficiency", Description: "Efficiency percentage display.", Icon: "percent"},
		{Type: WidgetCost, Name: "Cost", Description: "Cost calculation and trend.", Icon: "dollar"},
		{Type: WidgetForecast, Name: "Forecast", Description: "Predicted trend based on historical data.", Icon: "trending-up"},
	}
}

// WidgetInstance is a configured widget placed on a dashboard.
type WidgetInstance struct {
	ID       string     `json:"id"`
	Type     WidgetType `json:"type"`
	Title    string     `json:"title"`
	MetricID string     `json:"metricId"`
	Width    int        `json:"width"`  // grid columns
	Height   int        `json:"height"` // grid rows
	Config   map[string]string `json:"config"`
}
