package services

import (
	"fmt"
	"path/filepath"

	"compozah/models"
)

// GeneratorService orchestrates generating an ASP.NET Core dashboard project.
type GeneratorService struct {
	engine *TemplateEngine
}

// NewGeneratorService creates a generator with the provided template engine.
func NewGeneratorService(engine *TemplateEngine) *GeneratorService {
	return &GeneratorService{engine: engine}
}

// BuildTemplateData converts the dashboard configuration into template-ready data.
func BuildTemplateData(cfg models.DashboardConfig) TemplateData {
	data := TemplateData{
		ProjectName:    cfg.Name,
		ConnectionStr:  cfg.Connection.ConnectionString(),
		TableName:      cfg.TableName,
		TimestampCol:   cfg.TimestampCol,
		MachineCol:     cfg.MachineCol,
		RefreshSeconds: cfg.RefreshSeconds,
	}

	for _, m := range cfg.Metrics {
		data.Metrics = append(data.Metrics, MetricTemplateData{
			Name:        m.Name,
			Column:      m.Column,
			Aggregation: metricToSQLAgg(m.Aggregation),
			Unit:        m.Unit,
		})
	}

	for _, w := range cfg.Widgets {
		data.Widgets = append(data.Widgets, WidgetTemplateData{
			ID:        w.ID,
			Type:      string(w.Type),
			Title:     w.Title,
			MetricID:  w.MetricID,
			ChartType: widgetToChartType(w.Type),
			Width:     w.Width,
		})
	}

	return data
}

// Generate writes the complete ASP.NET Core project to disk.
func (g *GeneratorService) Generate(cfg models.DashboardConfig) (string, error) {
	outputPath := cfg.OutputPath
	if outputPath == "" {
		outputPath = "./output"
	}

	projectDir := filepath.Join(outputPath, safeName(cfg.Name))

	templateData := BuildTemplateData(cfg)

	if err := g.engine.Render(templateData, projectDir); err != nil {
		return "", fmt.Errorf("failed to render templates: %w", err)
	}

	return projectDir, nil
}

// metricToSQLAgg converts the aggregation type to a SQL function name.
func metricToSQLAgg(agg models.AggregationType) string {
	switch agg {
	case models.AggSum:
		return "SUM"
	case models.AggAvg:
		return "AVG"
	case models.AggMin:
		return "MIN"
	case models.AggMax:
		return "MAX"
	case models.AggCount:
		return "COUNT"
	default:
		return ""
	}
}

// widgetToChartType maps widget types to Chart.js chart types.
func widgetToChartType(wt models.WidgetType) string {
	switch wt {
	case models.WidgetHourlyTrend, models.WidgetDailyTrend,
		models.WidgetMonthlyTrend, models.WidgetForecast:
		return "line"
	case models.WidgetWeeklyComparison, models.WidgetMachineComparison:
		return "bar"
	case models.WidgetPieChart:
		return "pie"
	case models.WidgetGauge:
		return "doughnut"
	case models.WidgetTodayConsumption, models.WidgetKPI:
		return "number"
	default:
		return "bar"
	}
}
