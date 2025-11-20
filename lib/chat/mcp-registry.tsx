import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, DollarSign, Activity } from 'lucide-react'

// This registry maps tool names to React components
// Used to render custom UI for specific tool calls in the chat stream

export const MCP_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Example: Weather Tool
  fetch_weather: ({ data }) => (
    <Card className="w-full max-w-sm my-2 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="h-5 w-5 text-blue-500" />
          Weather Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold">{data.temperature}°C</p>
            <p className="text-muted-foreground">{data.condition}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Humidity: {data.humidity}%</p>
            <p>Wind: {data.wind_speed}km/h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),

  // Example: Stock Price Tool
  get_stock_price: ({ data }) => (
    <Card className="w-full max-w-sm my-2">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{data.symbol}</h3>
            <p className="text-sm text-muted-foreground">{data.company}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold">${data.price}</p>
            <Badge variant={data.change >= 0 ? 'default' : 'destructive'}>
              {data.change >= 0 ? '+' : ''}{data.change}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ),

  // Example: System Status
  check_system_status: ({ data }) => (
    <div className="flex items-center gap-2 p-3 my-2 rounded-md border bg-muted/50">
      <Activity className="h-4 w-4 text-green-500" />
      <span className="font-medium">System Status:</span>
      <Badge variant="outline" className="ml-auto">
        {data.status}
      </Badge>
    </div>
  ),
}

export function getToolComponent(toolName: string): React.ComponentType<any> {
  return MCP_REGISTRY[toolName] || (() => null)
}

export function renderToolComponent(toolName: string, data: any) {
  const Component = MCP_REGISTRY[toolName]
  if (!Component) return null
  return <Component data={data} />
}
