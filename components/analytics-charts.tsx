"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"

interface AnalyticsChartsProps {
  orders: Array<{ total_amount: number; created_at: string }>
}

export function AnalyticsCharts({ orders }: AnalyticsChartsProps) {
  const monthlyMap = orders.reduce((acc, order) => {
    const d = new Date(order.created_at)
    const ts = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    if (!acc[ts]) {
      acc[ts] = { ts, month: format(d, "MMM yyyy"), revenue: 0, orders: 0 }
    }
    acc[ts].revenue += Number(order.total_amount)
    acc[ts].orders += 1
    return acc
  }, {} as Record<number, { ts: number; month: string; revenue: number; orders: number }>)

  const monthlyChartData = Object.values(monthlyMap)
    .sort((a, b) => a.ts - b.ts)
    .map((item, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : undefined
      const growth = prev ? item.revenue - prev.revenue : 0
      const pctChange = prev && prev.revenue > 0 ? (growth / prev.revenue) * 100 : 0
      const aov = item.orders > 0 ? item.revenue / item.orders : 0
      return { ...item, growth, pctChange, aov }
    })

  const monthlyAvg = monthlyChartData.length
    ? monthlyChartData.reduce((sum, m) => sum + m.revenue, 0) / monthlyChartData.length
    : 0
  const lastMonth = monthlyChartData[monthlyChartData.length - 1]
  const prevMonth = monthlyChartData[monthlyChartData.length - 2]
  const lastMonthChangePct = lastMonth && prevMonth && prevMonth.revenue > 0
    ? ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
    : 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return { date, formatted: format(date, "EEE dd") }
  })

  const dailyDataBase = last7Days.map(({ date, formatted }) => {
    const dayOrders = orders.filter((order) => {
      const od = new Date(order.created_at)
      return od.toDateString() === date.toDateString()
    })
    const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
    const ordersCount = dayOrders.length
    const aov = ordersCount > 0 ? revenue / ordersCount : 0
    return { day: formatted, revenue, orders: ordersCount, aov }
  })

  const dailyData = dailyDataBase.map((item, idx) => {
    const start = Math.max(0, idx - 2)
    const windowItems = dailyDataBase.slice(start, idx + 1)
    const rev_ma = windowItems.length
      ? windowItems.reduce((s, it) => s + it.revenue, 0) / windowItems.length
      : 0
    return { ...item, rev_ma }
  })

  const last7RevenueSum = dailyData.reduce((sum, d) => sum + d.revenue, 0)
  const prev7Window = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date
  })
  const prev7RevenueSum = orders
    .filter((order) => {
      const od = new Date(order.created_at)
      const start = prev7Window[0]
      const end = prev7Window[prev7Window.length - 1]
      return od >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        od <= new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    })
    .reduce((sum, order) => sum + Number(order.total_amount), 0)
  const sevenDayChangePct = prev7RevenueSum > 0 ? ((last7RevenueSum - prev7RevenueSum) / prev7RevenueSum) * 100 : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue & Orders</CardTitle>
          <p className="text-sm text-muted-foreground">
            Avg: R {monthlyAvg.toFixed(2)} · Last month {lastMonthChangePct >= 0 ? "+" : ""}{lastMonthChangePct.toFixed(1)}%
          </p>
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
              <ComposedChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="monthlyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R${v.toLocaleString()}`} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value, name, item) => {
                    const v = Number(value)
                    if (name === 'Revenue') return <span>R{v.toLocaleString()}</span>
                    if (name === 'Orders') return <span>{v.toLocaleString()}</span>
                    return <span>{v.toLocaleString()}</span>
                  }} />}
                />
                <Legend />
                <ReferenceLine y={monthlyAvg} stroke="hsl(var(--muted))" strokeDasharray="5 5" />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} fill="url(#monthlyRevenueGradient)">
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days Revenue & Orders</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: R {last7RevenueSum.toFixed(2)} · vs previous 7 days {sevenDayChangePct >= 0 ? "+" : ""}{sevenDayChangePct.toFixed(1)}%
          </p>
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
              rev_ma: {
                label: "Revenue (3-day MA)",
                color: "hsl(var(--muted))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="dailyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R${v.toLocaleString()}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value, name, item) => {
                    const v = Number(value)
                    if (name === 'Revenue' || name === 'Revenue (3-day MA)') return <span>R{v.toLocaleString()}</span>
                    if (name === 'Orders') return <span>{v.toLocaleString()}</span>
                    return <span>{v.toLocaleString()}</span>
                  }} />}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="url(#dailyRevenueGradient)" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="left" type="monotone" dataKey="rev_ma" name="Revenue (3-day MA)" stroke="hsl(var(--muted))" strokeDasharray="6 4" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
