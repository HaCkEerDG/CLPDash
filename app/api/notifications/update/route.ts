import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { title, message, type } = await request.json()

    // Store notification in global array or database
    if (!global.notifications) {
      global.notifications = []
    }

    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    }

    global.notifications.push(notification)

    // Notify all connected SSE clients
    if (global.notificationClients) {
      global.notificationClients.forEach(client => {
        client.send(`data: ${JSON.stringify(notification)}\n\n`)
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
} 