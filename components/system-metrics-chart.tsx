"use client"

import { useState, useEffect } from "react"

// Simple chart component that shows real data
export function SystemMetricsChart({ type, value }: { type: string; value: number }) {
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    // Add the current value to history, keeping only the last 10 values
    setHistory((prev) => {
      const newHistory = [...prev, value]
      if (newHistory.length > 10) {
        return newHistory.slice(1)
      }
      return newHistory
    })
  }, [value])

  // Get label based on metric type
  const getLabel = () => {
    switch (type) {
      case "cpu":
        return "CPU Usage (%)"
      case "memory":
        return "Memory Usage (%)"
      case "disk":
        return "Disk Usage (%)"
      case "network":
        return "Network (MB/s)"
      default:
        return "Value"
    }
  }

  // Get color based on metric type
  const getColor = () => {
    switch (type) {
      case "cpu":
        return "bg-amber-500"
      case "memory":
        return "bg-green-500"
      case "disk":
        return "bg-blue-500"
      case "network":
        return "bg-purple-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className="h-[200px] w-full">
      <div className="w-full h-full bg-muted/30 rounded-md relative overflow-hidden">
        {/* Chart title and current value */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <span className="text-xs font-medium">{getLabel()}</span>
          <span className="text-xs font-bold">{value.toFixed(1)}</span>
        </div>

        {/* Render bars for historical data */}
        <div className="absolute inset-0 pt-8 pb-4 px-2 flex items-end">
          {history.map((item, index) => (
            <div
              key={index}
              className={`flex-1 mx-0.5 rounded-t-sm transition-all duration-500 ${getColor()}`}
              style={{
                height: `${Math.min(item, 100)}%`,
                opacity: index === history.length - 1 ? 1 : 0.5 + (index / history.length) * 0.5,
              }}
            />
          ))}

          {/* If we don't have enough history, fill with empty bars */}
          {Array.from({ length: Math.max(0, 10 - history.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="flex-1 mx-0.5 rounded-t-sm bg-muted" style={{ height: "0%" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

