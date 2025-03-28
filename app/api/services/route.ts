import { exec } from "child_process"
import { NextResponse } from "next/server"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get systemd services status
    const { stdout: serviceList } = await execAsync('systemctl list-units --type=service --all --no-pager --plain')
    
    // Parse the output
    const services = serviceList
      .split('\n')
      .filter(line => line.includes('.service'))
      .map(line => {
        const parts = line.split(/\s+/)
        const name = parts[0].replace('.service', '')
        const status = parts[3] // active, inactive, failed
        return { name, status }
      })

    // Get memory usage for each service
    const servicesWithMemory = await Promise.all(
      services.map(async service => {
        try {
          const { stdout: memory } = await execAsync(`systemctl show ${service.name} -p MemoryCurrent`)
          const memoryValue = parseInt(memory.split('=')[1]) / 1024 / 1024 // Convert to MB
          
          const { stdout: uptime } = await execAsync(`systemctl show ${service.name} -p ActiveEnterTimestamp`)
          const uptimeDate = new Date(uptime.split('=')[1])
          const uptimeDiff = Date.now() - uptimeDate.getTime()
          const uptimeStr = `${Math.floor(uptimeDiff / (1000 * 60 * 60 * 24))}d ${Math.floor((uptimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h`

          return {
            ...service,
            memory: `${Math.round(memoryValue)}MB`,
            uptime: service.status === 'active' ? uptimeStr : '-'
          }
        } catch {
          return {
            ...service,
            memory: 'N/A',
            uptime: '-'
          }
        }
      })
    )

    return NextResponse.json(servicesWithMemory)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, action } = await request.json()

    if (!name || !action) {
      return NextResponse.json({ error: "Service name and action are required" }, { status: 400 })
    }

    let command
    switch (action) {
      case "start":
        command = `systemctl start ${name}.service`
        break
      case "stop":
        command = `systemctl stop ${name}.service`
        break
      case "restart":
        command = `systemctl restart ${name}.service`
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await execAsync(command)

    return NextResponse.json({ success: true, message: `Service ${name} ${action}ed successfully` })
  } catch (error) {
    console.error("Error managing service:", error)
    return NextResponse.json({ error: "Failed to manage service" }, { status: 500 })
  }
}

