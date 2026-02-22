'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Generate mock data for the last 7 days
const generateChartData = (name: string, baseValue: number, variance: number) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, index) => ({
    date: day,
    [name]: Math.floor(baseValue + Math.random() * variance - variance / 2),
  }))
}

const viewsData = generateChartData('views', 450, 300)
const likesData = generateChartData('likes', 280, 150)
const lssnsData = generateChartData('lssns', 15, 8)
const ratingsData = generateChartData('rating', 72, 15)

export function ViewsChart() {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-strong">Total Views Trend</CardTitle>
        <CardDescription className="text-xs text-muted">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 30, 48, 0.95)',
                  border: '1px solid rgba(51, 102, 153, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#06b6d4' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function LikesChart() {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-strong">Total Likes Trend</CardTitle>
        <CardDescription className="text-xs text-muted">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={likesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 30, 48, 0.95)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f43f5e' }}
              />
              <Area
                type="monotone"
                dataKey="likes"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLikes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function LssnsChart() {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-strong">LSSNs Created Trend</CardTitle>
        <CardDescription className="text-xs text-muted">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lssnsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLssns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 30, 48, 0.95)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#10b981' }}
              />
              <Area
                type="monotone"
                dataKey="lssns"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLssns)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RatingChart() {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-strong">Average Rating Trend</CardTitle>
        <CardDescription className="text-xs text-muted">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ratingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 30, 48, 0.95)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
