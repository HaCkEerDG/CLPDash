import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    const { stdout } = await execAsync('df -B1G --output=source,size,used,target')
    
    const storageItems = stdout
      .split('\n')
      .slice(1) // Skip header
      .filter(line => line.trim())
      .map(line => {
        const [device, total, used, path] = line.trim().split(/\s+/)
        return {
          name: device.includes('/dev/') ? device.replace('/dev/', '') : device,
          total: parseInt(total),
          used: parseInt(used),
          path
        }
      })
      .filter(item => item.total > 0) // Filter out special filesystems

    return NextResponse.json(storageItems)
  } catch (error) {
    console.error('Error fetching storage info:', error)
    return NextResponse.json({ error: 'Failed to fetch storage information' }, { status: 500 })
  }
}

