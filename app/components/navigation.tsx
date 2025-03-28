'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Server,
  Box,
  HardDrive,
  ScrollText,
  Calendar,
  Shield,
  Archive,
  Terminal,
  Settings,
  Globe,
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Services', href: '/services', icon: Server },
  { name: 'Containers', href: '/containers', icon: Box },
  { name: 'Storage', href: '/storage', icon: HardDrive },
  { name: 'Logs', href: '/logs', icon: ScrollText },
  { name: 'Tasks', href: '/tasks', icon: Calendar },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Backups', href: '/backups', icon: Archive },
  { name: 'Terminal', href: '/terminal', icon: Terminal },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Deploy Web', href: '/deploy', icon: Globe },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <item.icon className="h-4 w-4 mr-3 shrink-0" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
} 