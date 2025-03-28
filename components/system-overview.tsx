"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, Clock, CpuIcon, HardDrive, Network, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SystemMetricsChart } from "@/components/system-metrics-chart"
import { ServerStatusCard } from "@/components/server-status-card"

interface SystemData {
  cpu: {
    usage: number
    cores: number
    frequency: string
  }
  memory: {
    used: string
    total: string
    percent: number
  }
  disk: {
    usage: number
    path: string
  }
  network: {
    rx: number
    tx: number
    interface: string
  }
  system: {
    hostname: string
    os: string
    kernel: string
    uptime: string
  }
}

export function SystemOverview() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemData = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await fetch("/api/system/overview")

      if (!response.ok) {
        throw new Error(`Failed to fetch system data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSystemData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching system data:", err)
      setError("Failed to fetch system data. Please check server logs.")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSystemData()

    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchSystemData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">Monitor and manage your server resources</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <Clock className="inline-block w-4 h-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ServerStatusCard
          title="CPU Usage"
          value={systemData ? `${systemData.cpu.usage.toFixed(1)}%` : "Loading..."}
          icon={CpuIcon}
          description={systemData ? `${systemData.cpu.cores} cores @ ${systemData.cpu.frequency}` : "Loading..."}
          trend={systemData?.cpu.usage > 80 ? "up" : "stable"}
          color={systemData?.cpu.usage > 80 ? "red" : systemData?.cpu.usage > 60 ? "amber" : "green"}
        />
        <ServerStatusCard
          title="Memory Usage"
          value={systemData ? systemData.memory.used : "Loading..."}
          icon={Activity}
          description={systemData ? `${systemData.memory.total} Total (${systemData.memory.percent}%)` : "Loading..."}
          trend={systemData?.memory.percent > 80 ? "up" : "stable"}
          color={systemData?.memory.percent > 80 ? "red" : systemData?.memory.percent > 60 ? "amber" : "green"}
        />
        <ServerStatusCard
          title="Disk Usage"
          value={systemData ? `${systemData.disk.usage}%` : "Loading..."}
          icon={HardDrive}
          description={systemData ? `Path: ${systemData.disk.path}` : "Loading..."}
          trend={systemData?.disk.usage > 80 ? "up" : "stable"}
          color={systemData?.disk.usage > 80 ? "red" : systemData?.disk.usage > 60 ? "amber" : "green"}
        />
        <ServerStatusCard
          title="Network"
          value={systemData ? `${Math.round(systemData.network.rx / 1024 / 1024)}MB/s` : "Loading..."}
          icon={Network}
          description={systemData ? `Interface: ${systemData.network.interface}` : "Loading..."}
          trend="stable"
          color="blue"
        />
      </div>

      {systemData?.disk.usage > 75 && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-500/10 text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Disk space on {systemData.disk.path} is running low ({systemData.disk.usage}% used). Consider freeing up
            space.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Performance</CardTitle>
            <CardDescription>Real-time resource utilization</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="cpu">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="cpu">CPU</TabsTrigger>
                <TabsTrigger value="memory">Memory</TabsTrigger>
                <TabsTrigger value="disk">Disk</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>
              <TabsContent value="cpu" className="pt-4">
                <SystemMetricsChart type="cpu" value={systemData?.cpu.usage || 0} />
              </TabsContent>
              <TabsContent value="memory" className="pt-4">
                <SystemMetricsChart type="memory" value={systemData?.memory.percent || 0} />
              </TabsContent>
              <TabsContent value="disk" className="pt-4">
                <SystemMetricsChart type="disk" value={systemData?.disk.usage || 0} />
              </TabsContent>
              <TabsContent value="network" className="pt-4">
                <SystemMetricsChart
                  type="network"
                  value={systemData ? Math.round(systemData.network.rx / 1024 / 1024) : 0}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Information</CardTitle>
            <CardDescription>Hardware and OS details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Hostname</div>
                <div className="text-sm text-muted-foreground">{systemData?.system.hostname || "Loading..."}</div>

                <div className="text-sm font-medium">Operating System</div>
                <div className="text-sm text-muted-foreground">{systemData?.system.os || "Loading..."}</div>

                <div className="text-sm font-medium">Kernel</div>
                <div className="text-sm text-muted-foreground">{systemData?.system.kernel || "Loading..."}</div>

                <div className="text-sm font-medium">Uptime</div>
                <div className="text-sm text-muted-foreground">{systemData?.system.uptime || "Loading..."}</div>

                <div className="text-sm font-medium">CPU</div>
                <div className="text-sm text-muted-foreground">
                  {systemData ? `${systemData.cpu.cores} cores @ ${systemData.cpu.frequency}` : "Loading..."}
                </div>

                <div className="text-sm font-medium">Memory</div>
                <div className="text-sm text-muted-foreground">{systemData?.memory.total || "Loading..."}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Full System Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

