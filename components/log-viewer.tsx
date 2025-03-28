"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Server,
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock log data
const generateLogs = () => {
  const logTypes = ["info", "warning", "error", "debug"]
  const services = ["nginx", "docker", "postgresql", "system", "kernel", "ssh", "cron"]
  const messages = [
    "Service started successfully",
    "Connection established",
    "Authentication failed for user admin",
    "CPU usage above threshold (80%)",
    "Memory usage critical (95%)",
    "Disk space running low on /var",
    "Failed to connect to database",
    "Successful login from 192.168.1.5",
    "Configuration file updated",
    "Backup completed successfully",
    "Failed to start service",
    "Permission denied for operation",
    "Network interface down",
    "Security update available",
    "Certificate will expire in 7 days",
  ]

  const logs = []

  for (let i = 0; i < 100; i++) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - i * 5)

    const type = logTypes[Math.floor(Math.random() * logTypes.length)]
    const service = services[Math.floor(Math.random() * services.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]

    logs.push({
      id: i,
      timestamp: date.toLocaleString(),
      type,
      service,
      message,
      details: `Process ID: ${Math.floor(Math.random() * 10000)}\nUser: ${type === "error" ? "root" : "system"}\nSource: ${service}.service`,
    })
  }

  return logs
}

const logs = generateLogs()

export function LogViewer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLogType, setSelectedLogType] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Filter logs based on search term and selected filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedLogType ? log.type === selectedLogType : true
    const matchesService = selectedService ? log.service === selectedService : true

    return matchesSearch && matchesType && matchesService
  })

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "info":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "debug":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-3 h-3 mr-1" />
      case "warning":
        return <AlertTriangle className="w-3 h-3 mr-1" />
      case "info":
        return <FileText className="w-3 h-3 mr-1" />
      case "debug":
        return <FileText className="w-3 h-3 mr-1" />
      default:
        return null
    }
  }

  const clearFilters = () => {
    setSelectedLogType(null)
    setSelectedService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">View and analyze system and application logs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAutoRefresh ? "animate-spin" : ""}`} />
            {isAutoRefresh ? "Auto" : "Refresh"}
          </Button>
        </div>
      </div>

      {(selectedLogType || selectedService) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedLogType && (
            <Badge variant="outline" className={getLogTypeColor(selectedLogType)}>
              {getLogTypeIcon(selectedLogType)}
              {selectedLogType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setSelectedLogType(null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {selectedService && (
            <Badge variant="outline">
              <Server className="w-3 h-3 mr-1" />
              {selectedService}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setSelectedService(null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="relative max-h-[600px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left font-medium">Time</th>
                        <th className="h-10 px-4 text-left font-medium">Type</th>
                        <th className="h-10 px-4 text-left font-medium">Service</th>
                        <th className="h-10 px-4 text-left font-medium">Message</th>
                        <th className="h-10 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center h-24 text-muted-foreground">
                            No logs found matching your search
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="border-b">
                            <td className="p-2 align-middle">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                {log.timestamp}
                              </div>
                            </td>
                            <td className="p-2 align-middle">
                              <Badge variant="outline" className={getLogTypeColor(log.type)}>
                                {getLogTypeIcon(log.type)}
                                {log.type}
                              </Badge>
                            </td>
                            <td className="p-2 align-middle">
                              <Badge variant="outline">
                                <Server className="w-3 h-3 mr-1" />
                                {log.service}
                              </Badge>
                            </td>
                            <td className="p-2 align-middle max-w-md truncate">{log.message}</td>
                            <td className="p-2 align-middle text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Logs related to the operating system and kernel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                <p>Mar 28 12:34:56 server kernel: CPU: Intel(R) Xeon(R) CPU E5-2680 v4 @ 3.40GHz</p>
                <p>Mar 28 12:34:56 server kernel: Memory: 16GB</p>
                <p>Mar 28 12:34:57 server systemd[1]: Starting System...</p>
                <p>Mar 28 12:34:58 server systemd[1]: Started System Initialization.</p>
                <p>Mar 28 12:35:01 server systemd[1]: Started Network Service.</p>
                <p>Mar 28 12:35:02 server systemd[1]: Started SSH Server.</p>
                <p>Mar 28 12:35:03 server systemd[1]: System startup complete.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="application" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Logs</CardTitle>
              <CardDescription>Logs from applications and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                <p>Mar 28 12:35:05 server nginx[1234]: Starting nginx web server...</p>
                <p>Mar 28 12:35:06 server nginx[1234]: nginx started successfully</p>
                <p>Mar 28 12:35:10 server docker[2345]: Starting Docker daemon...</p>
                <p>Mar 28 12:35:12 server docker[2345]: Docker started successfully</p>
                <p>Mar 28 12:35:15 server postgresql[3456]: Starting PostgreSQL database...</p>
                <p>Mar 28 12:35:18 server postgresql[3456]: PostgreSQL started successfully</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>Security-related events and authentication logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                <p>Mar 28 13:12:34 server sshd[5678]: Accepted publickey for admin from 192.168.1.5 port 52413</p>
                <p>
                  Mar 28 13:45:22 server sshd[5679]: Failed password for invalid user test from 203.0.113.1 port 59432
                </p>
                <p>
                  Mar 28 14:23:11 server sudo[6789]: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ;
                  COMMAND=/usr/bin/apt update
                </p>
                <p>Mar 28 15:01:45 server sshd[5680]: Disconnected from 192.168.1.5 port 52413</p>
                <p>Mar 28 15:34:56 server fail2ban[7890]: Ban 203.0.113.1</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>Detailed information about the selected log entry</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Timestamp</div>
                <div>{selectedLog.timestamp}</div>

                <div className="font-medium">Type</div>
                <div>
                  <Badge variant="outline" className={getLogTypeColor(selectedLog.type)}>
                    {getLogTypeIcon(selectedLog.type)}
                    {selectedLog.type}
                  </Badge>
                </div>

                <div className="font-medium">Service</div>
                <div>{selectedLog.service}</div>
              </div>

              <div>
                <div className="font-medium text-sm mb-1">Message</div>
                <div className="p-2 bg-muted rounded-md">{selectedLog.message}</div>
              </div>

              <div>
                <div className="font-medium text-sm mb-1">Details</div>
                <pre className="p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{selectedLog.details}</pre>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-3 h-3 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Copy to clipboard</DropdownMenuItem>
                  <DropdownMenuItem>Forward to email</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500">Delete log</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="default" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Logs</DialogTitle>
            <DialogDescription>Set filters to narrow down log results</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="log-type" className="text-sm font-medium">
                Log Type
              </label>
              <Select value={selectedLogType || ""} onValueChange={setSelectedLogType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select log type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="service" className="text-sm font-medium">
                Service
              </label>
              <Select value={selectedService || ""} onValueChange={setSelectedService}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="nginx">nginx</SelectItem>
                  <SelectItem value="docker">docker</SelectItem>
                  <SelectItem value="postgresql">postgresql</SelectItem>
                  <SelectItem value="system">system</SelectItem>
                  <SelectItem value="kernel">kernel</SelectItem>
                  <SelectItem value="ssh">ssh</SelectItem>
                  <SelectItem value="cron">cron</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="time-range" className="text-sm font-medium">
                Time Range
              </label>
              <Select defaultValue="24h">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sort-order" className="text-sm font-medium">
                Sort Order
              </label>
              <Select defaultValue="newest">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      Newest first
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      Oldest first
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

