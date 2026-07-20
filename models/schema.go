package models

// TableInfo represents a database table discovered from SQL Server.
type TableInfo struct {
	Schema string `json:"schema"`
	Name   string `json:"name"`
}

// ColumnInfo represents a column within a database table.
type ColumnInfo struct {
	Name       string `json:"name"`
	DataType   string `json:"dataType"`
	IsNullable bool   `json:"isNullable"`
	MaxLength  int    `json:"maxLength"`
}
