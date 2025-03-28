"use client"

import type React from "react"

export function ChartWrapper({
  content: ChartComponent,
  className,
  title,
}: {
  content: React.ComponentType<any>
  className?: string
  title?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {title && <div className="absolute top-2 left-2 text-xs font-medium text-muted-foreground">{title}</div>}
      <ChartComponent />
    </div>
  )
}

