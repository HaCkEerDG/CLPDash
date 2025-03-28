'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Play, Square, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Container {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  image: string
  ports: string
  created: string
}

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([
    { 
      id: 'abc123', 
      name: 'wordpress', 
      status: 'running', 
      image: 'wordpress:latest',
      ports: '80:80',
      created: '2 days ago'
    },
    { 
      id: 'def456', 
      name: 'mongodb', 
      status: 'running', 
      image: 'mongo:latest',
      ports: '27017:27017',
      created: '5 days ago'
    },
    { 
      id: 'ghi789', 
      name: 'redis-cache', 
      status: 'stopped', 
      image: 'redis:alpine',
      ports: '6379:6379',
      created: '1 week ago'
    }
  ])
  const [error, setError] = useState<string>('')

  const handleAction = async (containerId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      const response = await fetch(`/api/containers/${containerId}/${action}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error(`Failed to ${action} container`)
      
      if (action === 'delete') {
        setContainers(containers.filter(c => c.id !== containerId))
      } else {
        setContainers(containers.map(c => {
          if (c.id === containerId) {
            return {
              ...c,
              status: action === 'stop' ? 'stopped' : 'running'
            }
          }
          return c
        }))
      }
    } catch (err) {
      setError(`Failed to ${action} container`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Containers</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {containers.map((container) => (
          <Card key={container.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {container.name}
              </CardTitle>
              <Badge 
                variant={container.status === 'running' ? 'default' : 'destructive'}
              >
                {container.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                <p>Image: {container.image}</p>
                <p>Ports: {container.ports}</p>
                <p>Created: {container.created}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(container.id, 'start')}
                  disabled={container.status === 'running'}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(container.id, 'stop')}
                  disabled={container.status === 'stopped'}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(container.id, 'restart')}
                  disabled={container.status === 'stopped'}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction(container.id, 'delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 