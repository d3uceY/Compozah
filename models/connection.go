package models

// ConnectionConfig holds the SQL Server connection parameters.
type ConnectionConfig struct {
	Server   string `json:"server"`
	Port     int    `json:"port"`
	Database string `json:"database"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// ConnectionString builds a SQL Server connection string from the config.
func (c ConnectionConfig) ConnectionString() string {
	return "server=" + c.Server +
		";user id=" + c.Username +
		";password=" + c.Password +
		";database=" + c.Database +
		";encrypt=disable"
}
