'use client'

import { useExternalViews } from '@/lib/store/external-views'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Users, DollarSign, TrendingUp, LayoutDashboard } from 'lucide-react'

/**
 * External View Component
 * Renders different views based on the global store state
 * Controlled by the LangGraph agent via 'update_dashboard' tool
 */

export function ExternalView() {
  const { dashboard } = useExternalViews()

  // Render different content based on mode
  switch (dashboard.mode) {
    case 'analytics':
      return <AnalyticsView data={dashboard.data} />
    case 'settings':
      return <SettingsView />
    case 'custom':
      return <CustomView data={dashboard.data} />
    default:
      return <DefaultView />
  }
}

// View 1: Default Dashboard
function DefaultView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
      <div className="bg-muted p-4 rounded-full mb-4">
        <LayoutDashboard className="size-8" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Dashboard Ready</h3>
      <p className="max-w-sm">
        Ask the agent to "update dashboard" or "show analytics" to see the external view change in real-time.
      </p>
    </div>
  )
}

// View 2: Analytics Dashboard (triggered by agent)
function AnalyticsView({ data }: { data: any }) {
  // Mock data if none provided
  const chartData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
  ]

  const visitors = data?.visitors || 1234
  const sales = data?.sales || 5678

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                  dataKey="value"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// View 3: Settings Placeholder
function SettingsView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-muted-foreground">Settings view loaded by agent.</p>
    </div>
  )
}

// View 4: Custom Data View
function CustomView({ data }: { data: any }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Custom View</h2>
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
