'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface StorageItem {
  name: string
  used: number
  total: number
  path: string
}

export default function StoragePage() {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchStorage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/storage')
      if (!response.ok) throw new Error('Failed to fetch storage info')
      const data = await response.json()
      setStorageItems(data)
      setError('')
    } catch (err) {
      setError('Failed to load storage information')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorage()
    const interval = setInterval(fetchStorage, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatSize = (size: number) => {
    return `${size} GB`
  }

  const calculatePercentage = (used: number, total: number) => {
    return (used / total) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Storage</h1>
        <p>Loading storage information...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Storage</h1>
        <Button variant="outline" size="icon" onClick={fetchStorage}>
          <HardDrive className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {storageItems.map((item) => (
          <Card key={item.path}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.name}
              </CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                <p>Path: {item.path}</p>
                <p>Used: {formatSize(item.used)} / {formatSize(item.total)}</p>
              </div>
              <Progress 
                value={calculatePercentage(item.used, item.total)} 
                className="h-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 