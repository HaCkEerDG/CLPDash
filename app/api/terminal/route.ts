import { NextResponse } from "next/server"
import { Server } from 'ws'
import { NodeSSH } from 'node-ssh'

// SSH configuration from environment variables
const sshConfig = {
  host: process.env.SSH_HOST,
  port: parseInt(process.env.SSH_PORT || '22'),
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
  privateKey: process.env.SSH_KEY,
  // Add timeout and keepalive options
  readyTimeout: 20000,
  keepaliveInterval: 10000,
}

// Validate SSH config
if (!sshConfig.host || !sshConfig.username || (!sshConfig.password && !sshConfig.privateKey)) {
  console.error('Missing required SSH configuration. Check your .env.local file')
}

// Initialize WebSocket server if not exists
if (!global.wss) {
  global.wss = new Server({ noServer: true })
}

export function GET() {
  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket'
    }
  })
}

// Handle WebSocket connections
global.wss.on('connection', async (ws) => {
  const ssh = new NodeSSH()
  let shell: any = null

  try {
    await ssh.connect(sshConfig)

    shell = await ssh.requestShell({
      term: process.env.TERM || 'xterm-256color',
      rows: 30,
      cols: 80
    })

    // Handle incoming data from SSH
    shell.on('data', (data: Buffer) => {
      ws.send(JSON.stringify({
        type: 'output',
        data: data.toString()
      }))
    })

    // Handle SSH stream errors
    shell.on('error', (err: Error) => {
      ws.send(JSON.stringify({
        type: 'error',
        data: `Stream error: ${err.message}`
      }))
    })

    // Handle SSH stream close
    shell.on('close', () => {
      ws.send(JSON.stringify({
        type: 'system',
        data: 'SSH connection closed'
      }))
      ws.close()
    })

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'system',
      data: 'Connected to SSH server'
    }))

  } catch (err) {
    ws.send(JSON.stringify({
      type: 'error',
      data: `SSH connection error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }))
    ws.close()
    return
  }

  // Handle incoming messages from client
  ws.on('message', (message: string) => {
    try {
      const { type, data } = JSON.parse(message.toString())
      
      if (type === 'input' && shell) {
        // Send the command to SSH stream
        shell.write(data)
      } else if (type === 'resize' && shell) {
        // Handle terminal resize
        const { rows, cols } = data
        shell.setWindow(rows, cols)
      }
    } catch (err) {
      console.error('Failed to process message:', err)
    }
  })

  // Handle WebSocket close
  ws.on('close', () => {
    if (shell) {
      shell.end('exit\n')
    }
    ssh.dispose()
  })
}) 