package models

import "fmt"

// ConnectionConfig holds the SQL Server connection parameters.
type ConnectionConfig struct {
	Server   string `json:"server"`
	Port     int    `json:"port"`
	Database string `json:"database"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// ConnectionString builds a SQL Server connection string from the config.
// When Username is empty, Windows Authentication (Integrated Security) is used.
func (c ConnectionConfig) ConnectionString() string {
	if c.Username == "" {
		return fmt.Sprintf(
			"server=%s;port=%d;database=%s;integrated security=true;encrypt=true;trustservercertificate=true",
			c.Server,
			c.Port,
			c.Database,
		)
	}
	return fmt.Sprintf(
		"server=%s;port=%d;user id=%s;password=%s;database=%s;encrypt=true;trustservercertificate=true",
		c.Server,
		c.Port,
		c.Username,
		c.Password,
		c.Database,
	)
}