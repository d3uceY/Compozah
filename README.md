<p align="center">
  <img src="build/appicon.png" alt="Compozah" width="96" />
</p>

<h1 align="center">Compozah</h1>

<p align="center">
  <strong>A low-code dashboard builder that generates complete ASP.NET Core projects.</strong><br>
  Connect to SQL Server, discover your schema, define metrics, choose widgets, and export a ready-to-run dashboard.
</p>

---

## What It Does

Compozah is a Wails v3 desktop application that streamlines building data dashboards from scratch.

1. **Connect** to your SQL Server database
2. **Explore** your schema — pick a table, map timestamp and machine columns
3. **Define metrics** — attach aggregation logic (SUM, AVG, MIN, MAX, COUNT) to columns
4. **Choose widgets** — drag and drop from 13 widget types (line charts, bar charts, KPIs, gauges, data tables, and more)
5. **Generate** — Compozah produces a complete ASP.NET Core 8 project with Razor Pages, Chart.js dashboards, and a `Program.cs` wired to your database

The generated project is a standalone solution — open it in Visual Studio or `dotnet run` and it starts serving your dashboard immediately.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Wails v3](https://wails.io) (Go + WebView2) |
| Backend | Go — SQL Server via `go-mssqldb`, template engine, ZIP exporter |
| Frontend | React 19, TypeScript 6, Vite 8 |
| Generated output | ASP.NET Core 8, Razor Pages, Chart.js |

## Getting Started

### Prerequisites

- Go 1.24+
- Node.js 22+
- [Wails v3 CLI](https://v3.wails.io/getting-started/installation)
- WebView2 runtime (bundled with Windows 11; installable on Windows 10)

### Development

```powershell
# Install frontend dependencies
cd frontend
npm install
cd ..

# Run in dev mode (hot-reload for Go + frontend)
wails3 dev
```

### Production Build

```powershell
wails3 build
```

The executable lands in `bin/compozah.exe`.

## Project Structure

```
Compozah/
├── main.go                  # App entry point, window config, service binding
├── models/                  # Go data models (ConnectionConfig, Metric, Widget, DashboardConfig)
├── services/                # Go services (database, config, template engine, generator, exporter)
├── templates/aspnet-core/   # ASP.NET Core project templates with {{placeholders}}
├── build/                   # Wails build config, platform scripts, icons
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # ConnectionPanel, SchemaExplorer, MetricMapper, WidgetPalette, GeneratePanel
│   │   ├── hooks/           # useWails (typed service bindings)
│   │   └── types/           # TypeScript interfaces mirroring Go models
│   └── public/              # Static assets (logo, etc.)
└── Taskfile.yml             # Build task runner
```

## Widget Catalog

| Widget | Description |
|---|---|
| Today's Consumption | Large KPI number showing today's total |
| Hourly Trend | Line chart of hourly consumption |
| Daily Trend | Bar chart of daily aggregates |
| Weekly Comparison | Compare week-over-week by machine |
| Monthly Trend | Line chart of monthly aggregates |
| Machine Comparison | Side-by-side machine bars |
| Pie Chart | Distribution pie chart |
| Gauge | Current value within a range |
| Data Table | Raw data with sorting |
| KPI Card | Single key performance indicator |
| Efficiency | Efficiency percentage display |
| Cost | Cost calculation and trend |
| Forecast | Predicted future trend |

## Design

The UI follows Apple's design language — SF Pro typography, parchment + white surfaces, a single Action Blue accent (#0066cc), pill-shaped CTAs, and edge-to-edge tiled sections. No emojis, no gradients, no decorative chrome. The product is the focus.

## Next Steps

1. Modify the frontend in the `frontend/` directory to create your desired UI.
2. Add backend functionality in `main.go`.
3. Use `wails3 dev` to see your changes in real-time.
4. When ready, build your application with `wails3 build`.

Happy coding with Wails3! If you encounter any issues or have questions, don't hesitate to consult the documentation or reach out to the Wails community.
