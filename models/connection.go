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
func (c ConnectionConfig) ConnectionString() string {
    return fmt.Sprintf(
        "server=%s;port=%d;user id=%s;password=%s;database=%s;encrypt=disable",
        c.Server,
        c.Port,
        c.Username,
        c.Password,
        c.Database,
    )
}