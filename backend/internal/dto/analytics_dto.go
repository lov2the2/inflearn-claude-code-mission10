package dto

import "time"

type LoginTrendDataPoint struct {
    Date   time.Time `json:"date"`
    Logins int       `json:"logins"`
}

type ActivityDistributionData struct {
    Action string `json:"action"`
    Count  int    `json:"count"`
}

type MonthlyStatData struct {
    Month   string `json:"month"`
    Logins  int    `json:"logins"`
    Actions int    `json:"actions"`
}
