"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Box,
  Calendar,
  ChevronLeft,
  Cog,
  Database,
  FileText,
  HardDrive,
  Home,
  Lock,
  Menu,
  Moon,
  Play,
  Server,
  Shield,
  Sun,
  Terminal,
  User,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: pathname === "/" },
    { name: "Services", href: "/services", icon: Play, current: pathname === "/services" },
    { name: "Containers", href: "/containers", icon: Box, current: pathname === "/containers" },
    { name: "Storage", href: "/storage", icon: HardDrive, current: pathname === "/storage" },
    { name: "Logs", href: "/logs", icon: FileText, current: pathname === "/logs" },
    { name: "Tasks", href: "/tasks", icon: Calendar, current: pathname === "/tasks" },
    { name: "Security", href: "/security", icon: Shield, current: pathname === "/security" },
    { name: "Backups", href: "/backups", icon: Database, current: pathname === "/backups" },
    { name: "Terminal", href: "/terminal", icon: Terminal, current: pathname === "/terminal" },
    { name: "Settings", href: "/settings", icon: Cog, current: pathname === "/settings" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} hidden md:flex flex-col border-r transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center h-16 px-4 border-b">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ServerHub</span>
            </div>
          ) : (
            <Server className="h-6 w-6 text-primary mx-auto" />
          )}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleSidebar}>
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${
                    item.current
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                  ${!sidebarOpen && "justify-center"}
                `}
              >
                <item.icon className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5 flex-shrink-0`} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          {sidebarOpen ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@serverhub.com</p>
              </div>
            </div>
          ) : (
            <Avatar className="h-8 w-8 mx-auto">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ServerHub</span>
            </div>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </div>
          <div className="py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      item.current
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="flex items-center h-16 px-4 border-b bg-background">
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center ml-auto">
            <Button variant="outline" size="icon" className="mr-2 relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">3</Badge>
            </Button>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mr-2"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Cog className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}

