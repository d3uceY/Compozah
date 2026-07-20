package models

// AggregationType defines how a metric is aggregated.
type AggregationType string

const (
	AggNone AggregationType = "none"
	AggSum  AggregationType = "sum"
	AggAvg  AggregationType = "avg"
	AggMin  AggregationType = "min"
	AggMax  AggregationType = "max"
	AggCount AggregationType = "count"
)

// Metric defines a single measurable value mapped to a database column.
type Metric struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Column      string          `json:"column"`
	Aggregation AggregationType `json:"aggregation"`
	Unit        string          `json:"unit"`
	DataType    string          `json:"dataType"`
}
