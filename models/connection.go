package models

import (
	"fmt"
	"net"
	"strconv"
	"strings"
)

// ConnectionConfig holds the SQL Server connection parameters.
type ConnectionConfig struct {
	Server              string `json:"server"`
	Port                int    `json:"port"`
	Database            string `json:"database"`
	Username            string `json:"username"`
	Password            string `json:"password"`
	ConnectionStringRaw string `json:"connectionStringRaw"`
}

// ParseConnectionString takes a raw SQL Server connection string and populates
// the struct fields. It stores the raw string verbatim so it can be passed
// directly to the driver without re-serialisation.
//
// Supports both SSMS-style (Data Source=...) and go-mssqldb-style (server=...)
// key names. Keys are matched case-insensitively.
func (c *ConnectionConfig) ParseConnectionString(raw string) {
	c.ConnectionStringRaw = strings.TrimSpace(raw)
	if c.ConnectionStringRaw == "" {
		return
	}

	// Split on semicolons, respecting quoted values.
	// Handles both `key=value` and `key=value;` trailing semicolons.
	parts := splitCSV(raw)
	kv := make(map[string]string, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		eq := strings.IndexByte(p, '=')
		if eq < 0 {
			continue
		}
		k := strings.ToLower(strings.TrimSpace(p[:eq]))
		v := strings.TrimSpace(p[eq+1:])
		// Strip surrounding quotes if present.
		if len(v) >= 2 && (v[0] == '"' || v[0] == '\'') && v[0] == v[len(v)-1] {
			v = v[1 : len(v)-1]
		}
		kv[k] = v
	}

	// Map known aliases to our fields.
	if v, ok := kv["server"]; ok {
		c.Server = v
	} else if v, ok := kv["data source"]; ok {
		c.Server = v
	} else if v, ok := kv["addr"]; ok {
		c.Server = v
	} else if v, ok := kv["address"]; ok {
		c.Server = v
	}

	// Port can be embedded in server (e.g. "localhost,1433") or a separate key.
	if v, ok := kv["port"]; ok {
		if n, err := strconv.Atoi(v); err == nil {
			c.Port = n
		}
	}
	if c.Port == 0 {
		// Check for server,port syntax.
		if comma := strings.LastIndexByte(c.Server, ','); comma >= 0 {
			if n, err := strconv.Atoi(c.Server[comma+1:]); err == nil {
				c.Port = n
				c.Server = c.Server[:comma]
			}
		}
	}
	if c.Port == 0 {
		c.Port = 1433
	}

	if v, ok := kv["database"]; ok {
		c.Database = v
	} else if v, ok := kv["initial catalog"]; ok {
		c.Database = v
	}

	if v, ok := kv["user id"]; ok {
		c.Username = v
	} else if v, ok := kv["uid"]; ok {
		c.Username = v
	} else if v, ok := kv["user"]; ok {
		c.Username = v
	}

	if v, ok := kv["password"]; ok {
		c.Password = v
	} else if v, ok := kv["pwd"]; ok {
		c.Password = v
	}

	// If Integrated Security / Trusted_Connection is set to true/SSPI/yes,
	// clear any username/password - Windows Auth takes precedence.
	if v, ok := kv["integrated security"]; ok {
		if isTruthy(v) {
			c.Username = ""
			c.Password = ""
		}
	} else if v, ok := kv["trusted_connection"]; ok {
		if isTruthy(v) {
			c.Username = ""
			c.Password = ""
		}
	}
}

// ConnectionString returns the raw connection string if one was pasted,
// otherwise builds one from the individual fields.
// When Username is empty, Windows Authentication (Integrated Security) is used.
// Resolves "localhost" to a concrete IPv4 address to avoid IPv6 resolution
// issues with go-mssqldb (SQL Server often only binds to IPv4).
func (c ConnectionConfig) ConnectionString() string {
	if c.ConnectionStringRaw != "" {
		return normalizeLocalhost(c.ConnectionStringRaw)
	}
	server := resolveLocalhost(c.Server)
	if c.Username == "" {
		return fmt.Sprintf(
			"server=%s;port=%d;database=%s;integrated security=true;encrypt=true;trustservercertificate=true",
			server,
			c.Port,
			c.Database,
		)
	}
	return fmt.Sprintf(
		"server=%s;port=%d;user id=%s;password=%s;database=%s;encrypt=true;trustservercertificate=true",
		server,
		c.Port,
		c.Username,
		c.Password,
		c.Database,
	)
}

// resolveLocalhost returns the IPv4 loopback address for "localhost",
// otherwise returns the host unchanged. Uses the system resolver so it
// always picks the correct address for the current machine.
func resolveLocalhost(host string) string {
	if host != "localhost" {
		return host
	}
	addrs, err := net.LookupHost("localhost")
	if err != nil {
		return host // fall back to "localhost" and let the driver sort it out
	}
	// Prefer the first IPv4 address.
	for _, addr := range addrs {
		if ip := net.ParseIP(addr); ip != nil && ip.To4() != nil {
			return addr
		}
	}
	// No IPv4 found - return the first resolved address.
	if len(addrs) > 0 {
		return addrs[0]
	}
	return host
}

// normalizeLocalhost replaces "localhost" server values in a raw connection
// string with their resolved IPv4 address to avoid IPv6 resolution failures.
func normalizeLocalhost(s string) string {
	// Collect unique host values - the same host may appear under multiple aliases.
	seen := map[string]bool{}
	for _, alias := range []string{"Data Source=", "Server=", "server="} {
		idx := 0
		for {
			start := strings.Index(s[idx:], alias)
			if start < 0 {
				break
			}
			start += idx
			valStart := start + len(alias)
			end := strings.IndexByte(s[valStart:], ';')
			if end < 0 {
				end = len(s) - valStart
			}
			host := s[valStart : valStart+end]
			if host == "localhost" && !seen[host] {
				seen[host] = true
			}
			idx = valStart + end
		}
	}
	if !seen["localhost"] {
		return s
	}
	resolved := resolveLocalhost("localhost")
	for _, alias := range []string{"Data Source=", "Server=", "server="} {
		s = strings.ReplaceAll(s, alias+"localhost", alias+resolved)
	}
	return s
}

// splitCSV splits a semicolon-delimited connection string into key=value pairs.
func splitCSV(s string) []string {
	var parts []string
	var current strings.Builder
	inQuotes := false
	var quoteChar byte

	for i := 0; i < len(s); i++ {
		ch := s[i]
		if inQuotes {
			if ch == quoteChar {
				inQuotes = false
			} else {
				current.WriteByte(ch)
			}
		} else if ch == '"' || ch == '\'' {
			inQuotes = true
			quoteChar = ch
		} else if ch == ';' {
			parts = append(parts, current.String())
			current.Reset()
		} else {
			current.WriteByte(ch)
		}
	}
	if current.Len() > 0 {
		parts = append(parts, current.String())
	}
	return parts
}

// isTruthy returns true for common "true-ish" connection string values.
func isTruthy(v string) bool {
	switch strings.ToLower(v) {
	case "true", "yes", "sspi", "1":
		return true
	}
	return false
}
