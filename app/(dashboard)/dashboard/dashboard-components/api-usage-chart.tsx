
  // app/(dashboard)/dashboard-components/api-usage-chart.tsx
  'use client'
  
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApiUsage } from '@/hooks/use-api-usage'
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
  
  export function ApiUsageChart() {
    const { data, isLoading, error } = useApiUsage()
  
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading API usage data</div>
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
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
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }
  