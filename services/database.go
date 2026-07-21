package services

import (
	"database/sql"
	"fmt"

	"compozah/models"

	_ "github.com/denisenkom/go-mssqldb"
)

// DatabaseService handles SQL Server connections and schema discovery.
type DatabaseService struct {
	db               *sql.DB
	currentDatabase  string
}

// Connect opens a connection to SQL Server using the provided config.
func (d *DatabaseService) Connect(config models.ConnectionConfig) error {
	if d.db != nil {
		d.db.Close()
	}

	connStr := config.ConnectionString()
	var err error
	d.db, err = sql.Open("sqlserver", connStr)
	if err != nil {
		return fmt.Errorf("failed to open connection: %w", err)
	}

	if err = d.db.Ping(); err != nil {
		d.db = nil
		return fmt.Errorf("failed to ping server: %w", err)
	}

	// Track which database we connected to (or default).
	d.currentDatabase = config.Database
	if d.currentDatabase == "" {
		// Query the current database name from the server.
		row := d.db.QueryRow("SELECT DB_NAME()")
		row.Scan(&d.currentDatabase)
	}

	return nil
}

// Disconnect closes the database connection.
func (d *DatabaseService) Disconnect() {
	if d.db != nil {
		d.db.Close()
		d.db = nil
	}
}

// IsConnected returns whether there is an active connection.
func (d *DatabaseService) IsConnected() bool {
	if d.db == nil {
		return false
	}
	return d.db.Ping() == nil
}

// GetDatabases returns all non-system databases on the server.
func (d *DatabaseService) GetDatabases() ([]string, error) {
	if d.db == nil {
		return nil, fmt.Errorf("not connected to database")
	}

	query := `SELECT name FROM sys.databases WHERE name NOT IN ('master','tempdb','model','msdb') ORDER BY name`
	rows, err := d.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query databases: %w", err)
	}
	defer rows.Close()

	var dbs []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		dbs = append(dbs, name)
	}
	return dbs, rows.Err()
}

// SwitchDatabase changes the active database context for subsequent queries.
func (d *DatabaseService) SwitchDatabase(database string) error {
	if d.db == nil {
		return fmt.Errorf("not connected to database")
	}
	_, err := d.db.Exec("USE [" + database + "]")
	if err != nil {
		return fmt.Errorf("failed to switch to %s: %w", database, err)
	}
	d.currentDatabase = database
	return nil
}

// GetCurrentDatabase returns the currently active database name.
func (d *DatabaseService) GetCurrentDatabase() string {
	return d.currentDatabase
}

// GetTables retrieves all user tables from the connected database.
// Excludes system schemas (sys, INFORMATION_SCHEMA, cdc) and MS replication
// tables that live in user databases but are managed by SQL Server.
func (d *DatabaseService) GetTables() ([]models.TableInfo, error) {
	if d.db == nil {
		return nil, fmt.Errorf("not connected to database")
	}

	query := `
		SELECT TABLE_SCHEMA, TABLE_NAME
		FROM INFORMATION_SCHEMA.TABLES
		WHERE TABLE_TYPE = 'BASE TABLE'
		  AND TABLE_SCHEMA NOT IN ('sys', 'cdc', 'guest')
		  AND TABLE_NAME NOT LIKE 'MSreplication_%'
		  AND TABLE_NAME NOT LIKE 'spt_%'
		ORDER BY TABLE_SCHEMA, TABLE_NAME
	`

	rows, err := d.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tables: %w", err)
	}
	defer rows.Close()

	var tables []models.TableInfo
	for rows.Next() {
		var t models.TableInfo
		if err := rows.Scan(&t.Schema, &t.Name); err != nil {
			return nil, fmt.Errorf("failed to scan table row: %w", err)
		}
		tables = append(tables, t)
	}
	return tables, rows.Err()
}

// GetColumns retrieves all columns for a given table.
func (d *DatabaseService) GetColumns(schema, table string) ([]models.ColumnInfo, error) {
	if d.db == nil {
		return nil, fmt.Errorf("not connected to database")
	}

	query := `
		SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
		FROM INFORMATION_SCHEMA.COLUMNS
		WHERE TABLE_SCHEMA = @p1 AND TABLE_NAME = @p2
		ORDER BY ORDINAL_POSITION
	`

	rows, err := d.db.Query(query, schema, table)
	if err != nil {
		return nil, fmt.Errorf("failed to query columns: %w", err)
	}
	defer rows.Close()

	var columns []models.ColumnInfo
	for rows.Next() {
		var c models.ColumnInfo
		var isNullable string
		var maxLen sql.NullInt64
		if err := rows.Scan(&c.Name, &c.DataType, &isNullable, &maxLen); err != nil {
			return nil, fmt.Errorf("failed to scan column row: %w", err)
		}
		c.IsNullable = isNullable == "YES"
		if maxLen.Valid {
			c.MaxLength = int(maxLen.Int64)
		}
		columns = append(columns, c)
	}
	return columns, rows.Err()
}
