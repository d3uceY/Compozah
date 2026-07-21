package main

import (
	"embed"
	"log"
	"os"
	"path/filepath"

	"compozah/services"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Version is the application version. Set at build time via:
//
//	-ldflags "-X main.Version=x.y.z"
var Version = "0.1.0"

//go:embed all:frontend/dist
var assets embed.FS

//go:embed all:templates/aspnet-core
var aspNetTemplates embed.FS

func main() {
	// Initialize the template engine with embedded ASP.NET Core templates.
	templateEngine := services.NewTemplateEngine(aspNetTemplates, "templates/aspnet-core")

	// Store all app data under the OS user config directory.
	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		log.Fatalf("failed to get user config directory: %v", err)
	}
	baseDir := filepath.Join(userConfigDir, "Compozah")

	// Config storage: ~/.config/compozah/dashboards/ (Linux)
	//                ~/Library/Application Support/Compozah/dashboards/ (macOS)
	//                %AppData%/Compozah/dashboards/ (Windows)
	configSvc := services.NewConfigService(filepath.Join(baseDir, "dashboards"))

	// Initialize the generator service.
	generatorSvc := services.NewGeneratorService(templateEngine)

	app := application.New(application.Options{
		Name:        "Compozah",
		Description: "Low-code dashboard builder - design dashboards and generate ASP.NET Core projects",
		Services: []application.Service{
			application.NewService(&services.DatabaseService{}),
			application.NewService(configSvc),
			application.NewService(generatorSvc),
			application.NewService(&services.ProjectExporter{}),
			application.NewService(services.NewAppInfoService(Version)),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "Compozah",
		Width:  1280,
		Height: 820,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(6, 7, 15),
		URL:              "/",
	})

	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
