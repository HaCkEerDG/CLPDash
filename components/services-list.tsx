"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Clock, Play, RefreshCw, Search, Settings, Square, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Service {
  name: string
  status: string
  uptime: string
  cpu: string
  memory: string
  autostart: boolean
}

export function ServicesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"start" | "stop" | "restart" | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  const fetchServices = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/services")

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setServices(data)
    } catch (err) {
      console.error("Error fetching services:", err)
      setError("Failed to fetch services. Please check server logs.")
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()

    // Set up polling for real-time updates
    const interval = setInterval(fetchServices, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Running
          </Badge>
        )
      case "stopped":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" /> Stopped
          </Badge>
        )
      case "restarting":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Restarting
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <AlertCircle className="w-3 h-3 mr-1" /> Unknown
          </Badge>
        )
    }
  }

  const handleAction = (service: Service, action: "start" | "stop" | "restart") => {
    setSelectedService(service)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const executeAction = async () => {
    if (!selectedService || !actionType) return

    setActionInProgress(true)

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedService.name,
          action: actionType,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} service: ${response.status} ${response.statusText}`)
      }

      // Wait a moment for the service to change state
      setTimeout(fetchServices, 1000)

      setActionDialogOpen(false)
    } catch (err) {
      console.error(`Error ${actionType}ing service:`, err)
      setError(`Failed to ${actionType} service. Please check server logs.`)
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage system services and daemons</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchServices} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Autostart</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  <div className="mt-2 text-sm text-muted-foreground">Loading services...</div>
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? "No services found matching your search" : "No services found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.name}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{getStatusBadge(service.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                      {service.uptime}
                    </div>
                  </TableCell>
                  <TableCell>{service.cpu}</TableCell>
                  <TableCell>{service.memory}</TableCell>
                  <TableCell>
                    {service.autostart ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {service.status === "running" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAction(service, "restart")}>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Restart
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(service, "stop")}>
                            <Square className="w-3 h-3 mr-1" />
                            Stop
                          </Button>
                        </>
                      )}
                      {service.status !== "running" && (
                        <Button variant="outline" size="sm" onClick={() => handleAction(service, "start")}>
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Service: {service.name}</DialogTitle>
                            <DialogDescription>View and manage service details</DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="info">
                            <TabsList className="grid grid-cols-3">
                              <TabsTrigger value="info">Info</TabsTrigger>
                              <TabsTrigger value="logs">Logs</TabsTrigger>
                              <TabsTrigger value="config">Config</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="font-medium">Status</div>
                                <div>{getStatusBadge(service.status)}</div>

                                <div className="font-medium">Uptime</div>
                                <div>{service.uptime}</div>

                                <div className="font-medium">CPU Usage</div>
                                <div>{service.cpu}</div>

                                <div className="font-medium">Memory Usage</div>
                                <div>{service.memory}</div>

                                <div className="font-medium">Autostart</div>
                                <div>{service.autostart ? "Yes" : "No"}</div>
                              </div>
                            </TabsContent>
                            <TabsContent value="logs" className="pt-4">
                              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                                <p>Loading logs for {service.name}...</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="config" className="pt-4">
                              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                                <p>Loading configuration for {service.name}...</p>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <DialogFooter className="flex justify-between">
                            <div className="flex gap-2">
                              {service.status === "running" ? (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleAction(service, "restart")}>
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Restart
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleAction(service, "stop")}>
                                    <Square className="w-3 h-3 mr-1" />
                                    Stop
                                  </Button>
                                </>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleAction(service, "start")}>
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                            <Button variant="default" size="sm">
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "start" && "Start Service"}
              {actionType === "stop" && "Stop Service"}
              {actionType === "restart" && "Restart Service"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "start" && `Are you sure you want to start ${selectedService?.name}?`}
              {actionType === "stop" && `Are you sure you want to stop ${selectedService?.name}?`}
              {actionType === "restart" && `Are you sure you want to restart ${selectedService?.name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={actionInProgress}>
              Cancel
            </Button>
            <Button onClick={executeAction} disabled={actionInProgress}>
              {actionInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === "start" && "Start"}
                  {actionType === "stop" && "Stop"}
                  {actionType === "restart" && "Restart"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

