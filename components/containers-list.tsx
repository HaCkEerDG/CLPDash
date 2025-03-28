"use client"

import { useState, useEffect } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Play,
  RefreshCw,
  Search,
  Settings,
  Square,
  Trash2,
  XCircle,
} from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Container {
  id: string
  name: string
  image: string
  status: string
  uptime: string
  cpu: string
  memory: string
  ports: string
}

export function ContainersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"start" | "stop" | "restart" | "remove" | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [isCreatingContainer, setIsCreatingContainer] = useState(false)
  const [isPullingImage, setIsPullingImage] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)

  const fetchContainers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/containers")

      if (!response.ok) {
        throw new Error(`Failed to fetch containers: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setContainers(data)
    } catch (err) {
      console.error("Error fetching containers:", err)
      setError("Failed to fetch containers. Please check server logs.")
      setContainers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()

    // Set up polling for real-time updates
    const interval = setInterval(fetchContainers, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredContainers = containers.filter(
    (container) =>
      container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.image.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleAction = (container: Container, action: "start" | "stop" | "restart" | "remove") => {
    setSelectedContainer(container)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const executeAction = async () => {
    if (!selectedContainer || !actionType) return

    setActionInProgress(true)

    try {
      const response = await fetch("/api/containers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedContainer.id,
          action: actionType,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} container: ${response.status} ${response.statusText}`)
      }

      // Wait a moment for the container to change state
      setTimeout(fetchContainers, 1000)

      setActionDialogOpen(false)
    } catch (err) {
      console.error(`Error ${actionType}ing container:`, err)
      setError(`Failed to ${actionType} container. Please check server logs.`)
    } finally {
      setActionInProgress(false)
    }
  }

  const simulatePullImage = () => {
    setIsPullingImage(true)
    setPullProgress(0)

    const interval = setInterval(() => {
      setPullProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsPullingImage(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Containers</h1>
          <p className="text-muted-foreground">Manage Docker containers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search containers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchContainers} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreatingContainer(true)}>Create Container</Button>
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
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>CPU / Memory</TableHead>
              <TableHead>Ports</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  <div className="mt-2 text-sm text-muted-foreground">Loading containers...</div>
                </TableCell>
              </TableRow>
            ) : filteredContainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? "No containers found matching your search" : "No containers found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredContainers.map((container) => (
                <TableRow key={container.id}>
                  <TableCell className="font-medium">{container.name}</TableCell>
                  <TableCell>{container.image}</TableCell>
                  <TableCell>{getStatusBadge(container.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                      {container.uptime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {container.cpu} / {container.memory}
                    </div>
                  </TableCell>
                  <TableCell>{container.ports}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {container.status === "running" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAction(container, "restart")}>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Restart
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(container, "stop")}>
                            <Square className="w-3 h-3 mr-1" />
                            Stop
                          </Button>
                        </>
                      )}
                      {container.status !== "running" && (
                        <Button variant="outline" size="sm" onClick={() => handleAction(container, "start")}>
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Container: {container.name}</DialogTitle>
                            <DialogDescription>View and manage container details</DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="info">
                            <TabsList className="grid grid-cols-4">
                              <TabsTrigger value="info">Info</TabsTrigger>
                              <TabsTrigger value="logs">Logs</TabsTrigger>
                              <TabsTrigger value="stats">Stats</TabsTrigger>
                              <TabsTrigger value="terminal">Terminal</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="font-medium">Container ID</div>
                                <div>{container.id}</div>

                                <div className="font-medium">Name</div>
                                <div>{container.name}</div>

                                <div className="font-medium">Image</div>
                                <div>{container.image}</div>

                                <div className="font-medium">Status</div>
                                <div>{getStatusBadge(container.status)}</div>

                                <div className="font-medium">Uptime</div>
                                <div>{container.uptime}</div>

                                <div className="font-medium">CPU Usage</div>
                                <div>{container.cpu}</div>

                                <div className="font-medium">Memory Usage</div>
                                <div>{container.memory}</div>

                                <div className="font-medium">Ports</div>
                                <div>{container.ports}</div>
                              </div>
                            </TabsContent>
                            <TabsContent value="logs" className="pt-4">
                              <div className="bg-muted p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                                <p>Loading logs for {container.name}...</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="stats" className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>CPU Usage</span>
                                    <span>{container.cpu}</span>
                                  </div>
                                  <Progress value={Number.parseInt(container.cpu) || 1} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Memory Usage</span>
                                    <span>{container.memory}</span>
                                  </div>
                                  <Progress value={Number.parseInt(container.memory) || 25} className="h-2" />
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="terminal" className="pt-4">
                              <div className="bg-black text-green-400 p-2 rounded-md h-64 overflow-auto font-mono text-xs">
                                <p>Terminal access is not available in this interface.</p>
                                <p>Use the following command to access the container terminal:</p>
                                <p className="mt-2">docker exec -it {container.id} /bin/bash</p>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <DialogFooter className="flex justify-between">
                            <div className="flex gap-2">
                              {container.status === "running" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAction(container, "restart")}
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Restart
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleAction(container, "stop")}>
                                    <Square className="w-3 h-3 mr-1" />
                                    Stop
                                  </Button>
                                </>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleAction(container, "start")}>
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleAction(container, "remove")}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
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
              {actionType === "start" && "Start Container"}
              {actionType === "stop" && "Stop Container"}
              {actionType === "restart" && "Restart Container"}
              {actionType === "remove" && "Remove Container"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "start" && `Are you sure you want to start ${selectedContainer?.name}?`}
              {actionType === "stop" && `Are you sure you want to stop ${selectedContainer?.name}?`}
              {actionType === "restart" && `Are you sure you want to restart ${selectedContainer?.name}?`}
              {actionType === "remove" &&
                `Are you sure you want to remove ${selectedContainer?.name}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={actionInProgress}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              variant={actionType === "remove" ? "destructive" : "default"}
              disabled={actionInProgress}
            >
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
                  {actionType === "remove" && "Remove"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingContainer} onOpenChange={setIsCreatingContainer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Container</DialogTitle>
            <DialogDescription>Configure and deploy a new Docker container</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="volumes">Volumes & Ports</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-sm font-medium">
                    Container Name
                  </label>
                  <Input id="name" placeholder="my-container" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="image" className="text-sm font-medium">
                    Image
                  </label>
                  <div className="col-span-3 flex gap-2">
                    <Input id="image" placeholder="nginx:latest" className="flex-1" />
                    <Button variant="outline" onClick={simulatePullImage}>
                      <Download className="w-4 h-4 mr-2" />
                      Pull
                    </Button>
                  </div>
                </div>
                {isPullingImage && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pulling image...</span>
                      <span>{pullProgress}%</span>
                    </div>
                    <Progress value={pullProgress} className="h-2" />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="restart-policy" className="text-sm font-medium">
                    Restart Policy
                  </label>
                  <select
                    id="restart-policy"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="no">No</option>
                    <option value="always">Always</option>
                    <option value="on-failure">On Failure</option>
                    <option value="unless-stopped">Unless Stopped</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="env" className="text-sm font-medium">
                    Environment Variables
                  </label>
                  <textarea
                    id="env"
                    placeholder="KEY=value"
                    className="col-span-3 min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="cmd" className="text-sm font-medium">
                    Command
                  </label>
                  <Input id="cmd" placeholder="/bin/bash" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="network" className="text-sm font-medium">
                    Network
                  </label>
                  <select
                    id="network"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="bridge">bridge</option>
                    <option value="host">host</option>
                    <option value="none">none</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="volumes" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="ports" className="text-sm font-medium">
                    Ports
                  </label>
                  <Input id="ports" placeholder="80:80, 443:443" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="volumes" className="text-sm font-medium">
                    Volumes
                  </label>
                  <Input id="volumes" placeholder="/host/path:/container/path" className="col-span-3" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingContainer(false)}>
              Cancel
            </Button>
            <Button>Create Container</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

