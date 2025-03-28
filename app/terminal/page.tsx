'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Dynamically import the terminal component to avoid SSR issues
const Terminal = dynamic(() => import('@/components/Terminal'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="p-0 bg-[#1a1b1e] rounded-lg overflow-hidden">
        <div className="h-[500px] flex items-center justify-center text-gray-400">
          Loading terminal...
        </div>
      </CardContent>
    </Card>
  )
})

export default function TerminalPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Terminal</h1>
      <Terminal />
    </div>
  )
} 