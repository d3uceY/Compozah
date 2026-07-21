package services

// AppInfoService exposes application metadata to the frontend.
type AppInfoService struct {
	version string
}

// NewAppInfoService creates a new AppInfoService with the given version string.
func NewAppInfoService(version string) *AppInfoService {
	return &AppInfoService{version: version}
}

// GetVersion returns the application version string.
func (a *AppInfoService) GetVersion() string {
	return a.version
}
