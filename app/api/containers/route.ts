import { exec } from "child_process"
import { NextResponse } from "next/server"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Check if Docker is installed
    try {
      await execAsync("which docker")
    } catch (error) {
      return NextResponse.json({ error: "Docker is not installed on this system" }, { status: 500 })
    }

    // Get list of containers with detailed info
    const command = "docker ps -a --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}'"
    const { stdout } = await execAsync(command)

    if (!stdout.trim()) {
      return NextResponse.json([])
    }

    const containers = stdout
      .trim()
      .split("\n")
      .map((line) => {
        const [id, name, image, status, ports] = line.split("|")

        // Parse status to determine if running
        const isRunning = status.includes("Up")
        const uptime = isRunning ? status.replace("Up ", "") : "0d 0h 0m"

        return {
          id,
          name,
          image,
          status: isRunning ? "running" : "stopped",
          uptime,
          cpu: "—", // Would need docker stats to get this
          memory: "—", // Would need docker stats to get this
          ports,
        }
      })

    // For running containers, get stats
    for (const container of containers) {
      if (container.status === "running") {
        try {
          const statsCommand = `docker stats ${container.id} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}"`
          const { stdout: statsStdout } = await execAsync(statsCommand)
          const [cpu, memory] = statsStdout.trim().split("|")

          container.cpu = cpu
          container.memory = memory
        } catch (error) {
          console.error(`Error getting stats for container ${container.id}:`, error)
        }
      }
    }

    return NextResponse.json(containers)
  } catch (error) {
    console.error("Error fetching containers:", error)
    return NextResponse.json({ error: "Failed to fetch containers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { id, action } = await request.json()

    if (!id || !action) {
      return NextResponse.json({ error: "Container ID and action are required" }, { status: 400 })
    }

    let command
    switch (action) {
      case "start":
        command = `docker start ${id}`
        break
      case "stop":
        command = `docker stop ${id}`
        break
      case "restart":
        command = `docker restart ${id}`
        break
      case "remove":
        command = `docker rm ${id}`
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await execAsync(command)

    return NextResponse.json({ success: true, message: `Container ${action}ed successfully` })
  } catch (error) {
    console.error("Error managing container:", error)
    return NextResponse.json({ error: "Failed to manage container" }, { status: 500 })
  }
}

