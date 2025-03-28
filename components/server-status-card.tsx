"use client"

import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServerStatusCardProps {
  title: string
  value: string
  icon: LucideIcon
  description: string
  trend: "up" | "down" | "stable"
  color: string
}

export function ServerStatusCard({ title, value, icon: Icon, description, trend, color }: ServerStatusCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-red-500" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-green-500" />
      case "stable":
        return <ArrowRight className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getColorClass = () => {
    switch (color) {
      case "green":
        return "text-green-500"
      case "amber":
        return "text-amber-500"
      case "red":
        return "text-red-500"
      case "blue":
        return "text-blue-500"
      default:
        return "text-primary"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getColorClass()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div className="flex items-center mt-2">
          {getTrendIcon()}
          <span className="text-xs ml-1">
            {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

