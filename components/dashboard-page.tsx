"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { SystemOverview } from "@/components/system-overview"
import { ServicesList } from "@/components/services-list"
import { ContainersList } from "@/components/containers-list"
import { StorageOverview } from "@/components/storage-overview"
import { LogViewer } from "@/components/log-viewer"

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <MainLayout>
      {activeTab === "overview" && <SystemOverview />}
      {activeTab === "services" && <ServicesList />}
      {activeTab === "containers" && <ContainersList />}
      {activeTab === "storage" && <StorageOverview />}
      {activeTab === "logs" && <LogViewer />}
    </MainLayout>
  )
}

