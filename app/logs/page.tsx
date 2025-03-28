'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface LogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  service: string
}

export default function LogsPage() {
  const [selectedService, setSelectedService] = useState<string>('all')
  const [logs] = useState<LogEntry[]>([
    { timestamp: '2024-03-20 10:00:00', level: 'info', message: 'System started successfully', service: 'system' },
    { timestamp: '2024-03-20 10:01:00', level: 'warning', message: 'High CPU usage detected', service: 'monitoring' },
    { timestamp: '2024-03-20 10:02:00', level: 'error', message: 'Failed to connect to database', service: 'database' },
    // Add more log entries as needed
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  const filteredLogs = selectedService === 'all' 
    ? logs 
    : logs.filter(log => log.service === selectedService)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Logs</h1>
        <div className="flex gap-2">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="database">Database</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="border-b p-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className={getLevelColor(log.level)}>{log.level.toUpperCase()}</span>
                  <span className="font-medium">{log.service}</span>
                </div>
                <p className="mt-1">{log.message}</p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 