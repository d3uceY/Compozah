package services

import (
	"embed"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// TemplateEngine loads embedded templates and fills placeholders.
type TemplateEngine struct {
	templates embed.FS
	root      string
}

// NewTemplateEngine creates a new engine with embedded templates at root.
func NewTemplateEngine(templates embed.FS, root string) *TemplateEngine {
	return &TemplateEngine{
		templates: templates,
		root:      root,
	}
}

// TemplateData holds all placeholder values for template rendering.
type TemplateData struct {
	ProjectName    string
	ConnectionStr  string
	TableName      string
	TimestampCol   string
	MachineCol     string
	Metrics        []MetricTemplateData
	Widgets        []WidgetTemplateData
	RefreshSeconds int
}

// MetricTemplateData is template-ready metric info.
type MetricTemplateData struct {
	Name        string
	Column      string
	Aggregation string // SQL aggregation function name
	Unit        string
}

// WidgetTemplateData is template-ready widget info.
type WidgetTemplateData struct {
	ID        string
	Type      string
	Title     string
	MetricID  string
	ChartType string
	Width     int
}

// Render copies all templates to destDir, replacing placeholders.
func (e *TemplateEngine) Render(data TemplateData, destDir string) error {
	return fs.WalkDir(e.templates, e.root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Compute relative path from the template root.
		relPath, err := filepath.Rel(e.root, path)
		if err != nil {
			return err
		}

		destPath := filepath.Join(destDir, relPath)

		if d.IsDir() {
			return os.MkdirAll(destPath, 0755)
		}

		// Read template content.
		content, err := e.templates.ReadFile(path)
		if err != nil {
			return err
		}

		// Replace placeholders in .tmpl files; copy others verbatim.
		text := string(content)
		text = e.fillPlaceholders(text, data)

		// Strip .tmpl extension for output.
		destPath = strings.TrimSuffix(destPath, ".tmpl")

		os.MkdirAll(filepath.Dir(destPath), 0755)
		return os.WriteFile(destPath, []byte(text), 0644)
	})
}

// fillPlaceholders replaces all {{...}} placeholders in the template.
func (e *TemplateEngine) fillPlaceholders(text string, data TemplateData) string {
	r := strings.NewReplacer(
		"{{ProjectName}}", data.ProjectName,
		"{{SafeProjectName}}", safeName(data.ProjectName),
		"{{ConnectionString}}", data.ConnectionStr,
		"{{TableName}}", data.TableName,
		"{{TimestampColumn}}", data.TimestampCol,
		"{{MachineColumn}}", data.MachineCol,
		"{{RefreshSeconds}}", itoa(data.RefreshSeconds),
	)
	text = r.Replace(text)

	// Build metrics JSON for frontend.
	text = strings.ReplaceAll(text, "{{MetricsJSON}}", buildMetricsJSON(data.Metrics))

	// Build widgets JSON for frontend.
	text = strings.ReplaceAll(text, "{{WidgetsJSON}}", buildWidgetsJSON(data.Widgets))

	// Build C# metric properties.
	text = strings.ReplaceAll(text, "{{MetricProperties}}", buildMetricProperties(data.Metrics))

	return text
}

// safeName returns a C#-safe identifier from a project name.
func safeName(s string) string {
	s = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			return r
		}
		return -1
	}, s)
	if len(s) == 0 {
		return "Dashboard"
	}
	return s
}

// itoa is a simple int-to-string helper.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	s := ""
	neg := false
	if n < 0 {
		neg = true
		n = -n
	}
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	if neg {
		s = "-" + s
	}
	return s
}

// CopyFile copies a single file from src to dst.
func CopyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	os.MkdirAll(filepath.Dir(dst), 0755)
	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	return err
}

// --- JSON builders for embedding in generated templates ---

func buildMetricsJSON(metrics []MetricTemplateData) string {
	if len(metrics) == 0 {
		return "[]"
	}
	parts := make([]string, 0, len(metrics))
	for _, m := range metrics {
		parts = append(parts,
			`{"name":"`+m.Name+`","column":"`+m.Column+`","aggregation":"`+m.Aggregation+
				`","unit":"`+m.Unit+`"}`)
	}
	return "[" + strings.Join(parts, ",") + "]"
}

func buildWidgetsJSON(widgets []WidgetTemplateData) string {
	if len(widgets) == 0 {
		return "[]"
	}
	parts := make([]string, 0, len(widgets))
	for _, w := range widgets {
		parts = append(parts,
			`{"id":"`+w.ID+`","type":"`+w.Type+`","title":"`+w.Title+
				`","chartType":"`+w.ChartType+`","width":`+itoa(w.Width)+`}`)
	}
	return "[" + strings.Join(parts, ",") + "]"
}

func buildMetricProperties(metrics []MetricTemplateData) string {
	var sb strings.Builder
	for _, m := range metrics {
		safe := safeName(m.Name)
		sb.WriteString("    public double ")
		sb.WriteString(safe)
		sb.WriteString(" { get; set; }\n")
	}
	return sb.String()
}
