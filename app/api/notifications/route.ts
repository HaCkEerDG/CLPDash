import { NextResponse } from "next/server"

if (!global.notificationClients) {
  global.notificationClients = new Set()
}

export async function GET() {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        id: Date.now(),
        send: (data: string) => {
          controller.enqueue(data)
        }
      }

      // Add client to global set
      global.notificationClients.add(client)

      // Send initial connection notification
      const notification = {
        id: Date.now().toString(),
        title: 'Connected',
        message: 'Notification system is ready',
        type: 'info',
        timestamp: new Date().toISOString()
      }

      client.send(`data: ${JSON.stringify(notification)}\n\n`)

      // Remove client when connection closes
      return () => {
        global.notificationClients.delete(client)
      }
    }
  })

  return new Response(stream, { headers })
} 