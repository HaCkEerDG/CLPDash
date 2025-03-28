'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import 'xterm/css/xterm.css'

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1b1e',
        foreground: '#d4d4d4'
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    if (terminalRef.current) {
      term.open(terminalRef.current)
      fitAddon.fit()
      xtermRef.current = term

      // Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/terminal`)
      wsRef.current = ws

      ws.onopen = () => {
        setError(null)
        term.write('\r\n\x1B[1;32mConnected to server.\x1B[0m\r\n')
      }

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data)
          if (type === 'output') {
            term.write(data)
          } else if (type === 'error') {
            setError(data)
            term.write(`\r\n\x1B[1;31mError: ${data}\x1B[0m\r\n`)
          } else if (type === 'system') {
            term.write(`\r\n\x1B[1;33m${data}\x1B[0m\r\n`)
          }
        } catch (err) {
          console.error('Failed to process message:', err)
        }
      }

      ws.onerror = () => {
        setError('Connection error')
        term.write('\r\n\x1B[1;31mConnection error\x1B[0m\r\n')
      }

      ws.onclose = () => {
        term.write('\r\n\x1B[1;31mConnection closed\x1B[0m\r\n')
      }

      // Handle terminal input
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Handle terminal resize
      term.onResize(({ rows, cols }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', data: { rows, cols } }))
        }
      })

      // Handle window resize
      const handleResize = () => fitAddon.fit()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        ws.close()
        term.dispose()
      }
    }
  }, [])

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-0 bg-[#1a1b1e] rounded-lg overflow-hidden">
          <div ref={terminalRef} className="h-[500px]" />
        </CardContent>
      </Card>
    </>
  )
} 