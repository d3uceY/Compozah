package services

import (
	"encoding/json"
	"os"
	"path/filepath"

	"compozah/models"
)

// ConfigService handles persisting and loading dashboard configurations.
type ConfigService struct {
	storageDir string
}

// NewConfigService creates a ConfigService that stores files in the given directory.
func NewConfigService(storageDir string) *ConfigService {
	return &ConfigService{storageDir: storageDir}
}

// load reads a JSON file from storageDir and unmarshals it into v.
func (c *ConfigService) load(filename string, v interface{}) error {
	os.MkdirAll(c.storageDir, 0755)
	path := filepath.Join(c.storageDir, filename)

	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

// save marshals v as JSON and writes it to storageDir.
func (c *ConfigService) save(filename string, v interface{}) error {
	os.MkdirAll(c.storageDir, 0755)
	path := filepath.Join(c.storageDir, filename)

	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

// SaveDashboard persists a dashboard configuration.
func (c *ConfigService) SaveDashboard(cfg models.DashboardConfig) error {
	return c.save(cfg.Name+".json", cfg)
}

// LoadDashboard loads a dashboard configuration by name.
func (c *ConfigService) LoadDashboard(name string) (models.DashboardConfig, error) {
	var cfg models.DashboardConfig
	if err := c.load(name+".json", &cfg); err != nil {
		return models.DashboardConfig{}, err
	}
	return cfg, nil
}

// ListDashboards returns the names of all saved dashboard configs.
func (c *ConfigService) ListDashboards() ([]string, error) {
	os.MkdirAll(c.storageDir, 0755)

	entries, err := os.ReadDir(c.storageDir)
	if err != nil {
		return nil, err
	}

	var names []string
	for _, e := range entries {
		if !e.IsDir() && filepath.Ext(e.Name()) == ".json" {
			names = append(names, e.Name()[:len(e.Name())-5])
		}
	}
	return names, nil
}

// DeleteDashboard removes a saved dashboard config.
func (c *ConfigService) DeleteDashboard(name string) error {
	path := filepath.Join(c.storageDir, name+".json")
	return os.Remove(path)
}

// AutoSave persists the current working config to an autosave file.
func (c *ConfigService) AutoSave(cfg models.DashboardConfig) error {
	return c.save("_autosave.json", cfg)
}

// LoadAutoSave loads the last autosaved config. Returns the config and true
// if an autosave file exists, or zero-value and false otherwise.
func (c *ConfigService) LoadAutoSave() (models.DashboardConfig, bool) {
	var cfg models.DashboardConfig
	if err := c.load("_autosave.json", &cfg); err != nil {
		return models.DashboardConfig{}, false
	}
	return cfg, true
}
