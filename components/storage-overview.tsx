"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  ArrowUpDown,
  FileText,
  Folder,
  HardDrive,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StorageDevice {
  device: string
  mountPoint: string
  fsType: string
  size: string
  used: string
  available: string
  usedPercent: number
}

export function StorageOverview() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const [isAddingDisk, setIsAddingDisk] = useState(false)
  const [storageDevices, setStorageDevices] = useState<StorageDevice[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStorageData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/storage")

      if (!response.ok) {
        throw new Error(`Failed to fetch storage data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setStorageDevices(data)

      // For now, we'll use mock file data
      // In a real app, you would fetch files based on the current path
      setFiles([
        {
          name: "var",
          type: "directory",
          size: "12GB",
          modified: "Mar 15, 2025",
          permissions: "drwxr-xr-x",
          owner: "root",
        },
        {
          name: "home",
          type: "directory",
          size: "64GB",
          modified: "Mar 20, 2025",
          permissions: "drwxr-xr-x",
          owner: "root",
        },
        {
          name: "etc",
          type: "directory",
          size: "120MB",
          modified: "Mar 10, 2025",
          permissions: "drwxr-xr-x",
          owner: "root",
        },
        {
          name: "usr",
          type: "directory",
          size: "4.5GB",
          modified: "Mar 5, 2025",
          permissions: "drwxr-xr-x",
          owner: "root",
        },
        {
          name: "boot",
          type: "directory",
          size: "250MB",
          modified: "Feb 28, 2025",
          permissions: "drwxr-xr-x",
          owner: "root",
        },
        {
          name: "server.log",
          type: "file",
          size: "2.4MB",
          modified: "Mar 28, 2025",
          permissions: "-rw-r--r--",
          owner: "root",
        },
        {
          name: "backup.tar.gz",
          type: "file",
          size: "1.2GB",
          modified: "Mar 27, 2025",
          permissions: "-rw-r--r--",
          owner: "root",
        },
      ])
    } catch (err) {
      console.error("Error fetching storage data:", err)
      setError("Failed to fetch storage data. Please check server logs.")
      setStorageDevices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorageData()

    // Set up polling for real-time updates
    const interval = setInterval(fetchStorageData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storage</h1>
          <p className="text-muted-foreground">Manage disks, partitions, and files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchStorageData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddingDisk(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Disk
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

      {storageDevices.some((device) => device.usedPercent > 75) && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-500/10 text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Disk space on {storageDevices.find((device) => device.usedPercent > 75)?.mountPoint} is running low (
            {storageDevices.find((device) => device.usedPercent > 75)?.usedPercent}% used). Consider freeing up space.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Disk Usage</CardTitle>
            <CardDescription>Storage utilization across mounted devices</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="ml-2">Loading storage data...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {storageDevices.map((device, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {device.mountPoint} ({device.device})
                      </span>
                      <span>
                        {device.used} / {device.size} ({device.usedPercent}%)
                      </span>
                    </div>
                    <Progress
                      value={device.usedPercent}
                      className={`h-2 ${device.usedPercent > 90 ? "bg-red-500" : device.usedPercent > 75 ? "bg-amber-500" : ""}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Storage Devices</CardTitle>
            <CardDescription>Physical and virtual storage devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Mount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                        <div className="mt-2 text-sm text-muted-foreground">Loading storage devices...</div>
                      </TableCell>
                    </TableRow>
                  ) : storageDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No storage devices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    storageDevices.map((device, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{device.device}</TableCell>
                        <TableCell>{device.mountPoint}</TableCell>
                        <TableCell>{device.fsType}</TableCell>
                        <TableCell>{device.size}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                device.usedPercent > 90
                                  ? "bg-red-500"
                                  : device.usedPercent > 75
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                            />
                            {device.usedPercent}%
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle className="text-lg font-medium">File Browser</CardTitle>
            <CardDescription>Browse and manage files</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 text-sm">
            <HardDrive className="w-4 h-4" />
            <span>Path: {currentPath}</span>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                      <div className="mt-2 text-sm text-muted-foreground">Loading files...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {currentPath !== "/" && (
                      <TableRow>
                        <TableCell className="font-medium">
                          <Button
                            variant="ghost"
                            className="p-0 h-auto font-medium"
                            onClick={() => setCurrentPath(currentPath.split("/").slice(0, -1).join("/") || "/")}
                          >
                            ..
                          </Button>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    )}
                    {filteredFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No files found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFiles.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {file.type === "directory" ? (
                                <Folder className="w-4 h-4 mr-2 text-amber-500" />
                              ) : (
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                              )}
                              <Button
                                variant="ghost"
                                className="p-0 h-auto font-medium"
                                onClick={() =>
                                  file.type === "directory" &&
                                  setCurrentPath(`${currentPath === "/" ? "" : currentPath}/${file.name}`)
                                }
                              >
                                {file.name}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{file.size}</TableCell>
                          <TableCell>{file.modified}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{file.permissions}</code>
                          </TableCell>
                          <TableCell>{file.owner}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingDisk} onOpenChange={setIsAddingDisk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Disk</DialogTitle>
            <DialogDescription>Configure and mount a new storage device</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="mount">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="mount">Mount Disk</TabsTrigger>
              <TabsTrigger value="format">Format Disk</TabsTrigger>
              <TabsTrigger value="partition">Partition</TabsTrigger>
            </TabsList>
            <TabsContent value="mount" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="device" className="text-sm font-medium">
                    Device
                  </label>
                  <select
                    id="device"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="/dev/sde">/dev/sde</option>
                    <option value="/dev/sdf">/dev/sdf</option>
                    <option value="/dev/sdg">/dev/sdg</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="mount-point" className="text-sm font-medium">
                    Mount Point
                  </label>
                  <Input id="mount-point" placeholder="/mnt/data" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="fs-type" className="text-sm font-medium">
                    Filesystem Type
                  </label>
                  <select
                    id="fs-type"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="ext4">ext4</option>
                    <option value="xfs">xfs</option>
                    <option value="btrfs">btrfs</option>
                    <option value="ntfs">ntfs</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="mount-options" className="text-sm font-medium">
                    Mount Options
                  </label>
                  <Input id="mount-options" placeholder="defaults,noatime" className="col-span-3" />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-mount"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="auto-mount" className="text-sm font-medium">
                    Mount at boot (add to fstab)
                  </label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="format" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="format-device" className="text-sm font-medium">
                    Device
                  </label>
                  <select
                    id="format-device"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="/dev/sde">/dev/sde</option>
                    <option value="/dev/sdf">/dev/sdf</option>
                    <option value="/dev/sdg">/dev/sdg</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="format-fs-type" className="text-sm font-medium">
                    Filesystem Type
                  </label>
                  <select
                    id="format-fs-type"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="ext4">ext4</option>
                    <option value="xfs">xfs</option>
                    <option value="btrfs">btrfs</option>
                    <option value="ntfs">ntfs</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="label" className="text-sm font-medium">
                    Label
                  </label>
                  <Input id="label" placeholder="data-disk" className="col-span-3" />
                </div>
                <Alert variant="destructive" className="col-span-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Formatting will erase all data on the selected device. This action cannot be undone.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            <TabsContent value="partition" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="partition-device" className="text-sm font-medium">
                    Device
                  </label>
                  <select
                    id="partition-device"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="/dev/sde">/dev/sde</option>
                    <option value="/dev/sdf">/dev/sdf</option>
                    <option value="/dev/sdg">/dev/sdg</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="partition-table" className="text-sm font-medium">
                    Partition Table
                  </label>
                  <select
                    id="partition-table"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="gpt">GPT</option>
                    <option value="mbr">MBR</option>
                  </select>
                </div>
                <Alert variant="destructive" className="col-span-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Creating a new partition table will erase all data on the selected device. This action cannot be
                    undone.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDisk(false)}>
              Cancel
            </Button>
            <Button>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

