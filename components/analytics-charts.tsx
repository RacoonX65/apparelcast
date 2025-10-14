"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"

interface AnalyticsChartsProps {
  orders: Array<{ total_amount: number; created_at: string }>
}

export function AnalyticsCharts({ orders }: AnalyticsChartsProps) {
  // Process data for monthly revenue chart
  const monthlyData = orders.reduce(
    (acc, order) => {
      const month = format(new Date(order.created_at), "MMM yyyy")
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, orders: 0 }
      }
      acc[month].revenue += Number(order.total_amount)
      acc[month].orders += 1
      return acc
    },
    {} as Record<string, { month: string; revenue: number; orders: number }>,
  )

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime()
  })

  // Process data for daily sales (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return format(date, "MMM dd")
  })

  const dailyData = last7Days.map((day) => {
    const dayOrders = orders.filter((order) => format(new Date(order.created_at), "MMM dd") === day)
    return {
      day,
      revenue: dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      orders: dayOrders.length,
    }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue (R)",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue (R)",
                color: "hsl(var(--primary))",
              },
              orders: {
                label: "Orders",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
