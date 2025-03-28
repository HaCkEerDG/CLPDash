import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockLogs = [
      { 
        timestamp: '2024-03-20 10:00:00', 
        level: 'info', 
        message: 'System started successfully', 
        service: 'system' 
      },
      { 
        timestamp: '2024-03-20 10:01:00', 
        level: 'warning', 
        message: 'High CPU usage detected', 
        service: 'monitoring' 
      },
      { 
        timestamp: '2024-03-20 10:02:00', 
        level: 'error', 
        message: 'Failed to connect to database', 
        service: 'database' 
      }
    ]

    return NextResponse.json(mockLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

