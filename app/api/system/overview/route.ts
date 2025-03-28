import { exec } from "child_process"
import { NextResponse } from "next/server"
import { promisify } from "util"
import { withAuth } from "@/lib/auth-middleware"

const execAsync = promisify(exec)

async function handler(request: Request) {
  try {
    // Get CPU usage
    const cpuCommand = "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *$$[0-9.]*$$%* id.*/\\1/' | awk '{print 100 - $1}'"
    const { stdout: cpuStdout } = await execAsync(cpuCommand)
    const cpuUsage = Number.parseFloat(cpuStdout.trim())

    // Get memory usage
    const memCommand = "free -m | awk 'NR==2{printf \"%s/%s\", $3, $2}'"
    const { stdout: memStdout } = await execAsync(memCommand)
    const memParts = memStdout.split("/")
    const memUsed = Number.parseInt(memParts[0])
    const memTotal = Number.parseInt(memParts[1])
    const memPercent = Math.round((memUsed / memTotal) * 100)

    // Get disk usage
    const diskCommand = "df -h / | awk 'NR==2{print $5}'"
    const { stdout: diskStdout } = await execAsync(diskCommand)
    const diskUsage = Number.parseInt(diskStdout.replace("%", ""))

    // Get network usage (simplified)
    const netCommand = "cat /proc/net/dev | grep eth0 | awk '{print $2, $10}'"
    const { stdout: netStdout } = await execAsync(netCommand)
    const [rxBytes, txBytes] = netStdout.trim().split(" ").map(Number)

    // Get uptime
    const uptimeCommand = "uptime -p"
    const { stdout: uptimeStdout } = await execAsync(uptimeCommand)
    const uptime = uptimeStdout.trim()

    // Get hostname
    const hostnameCommand = "hostname"
    const { stdout: hostnameStdout } = await execAsync(hostnameCommand)
    const hostname = hostnameStdout.trim()

    // Get OS info
    const osCommand = "cat /etc/os-release | grep PRETTY_NAME | cut -d '\"' -f 2"
    const { stdout: osStdout } = await execAsync(osCommand)
    const osInfo = osStdout.trim()

    // Get kernel version
    const kernelCommand = "uname -r"
    const { stdout: kernelStdout } = await execAsync(kernelCommand)
    const kernel = kernelStdout.trim()

    return NextResponse.json({
      cpu: {
        usage: cpuUsage,
        cores: 4, // This would need a separate command to get actual core count
        frequency: "3.4GHz", // This would need a separate command to get actual frequency
      },
      memory: {
        used: `${memUsed}MB`,
        total: `${memTotal}MB`,
        percent: memPercent,
      },
      disk: {
        usage: diskUsage,
        path: "/",
      },
      network: {
        rx: rxBytes,
        tx: txBytes,
        interface: "eth0",
      },
      system: {
        hostname,
        os: osInfo,
        kernel,
        uptime,
      },
    })
  } catch (error) {
    console.error("Error fetching system data:", error)
    return NextResponse.json({ error: "Failed to fetch system data" }, { status: 500 })
  }
}

export const GET = withAuth(handler)

