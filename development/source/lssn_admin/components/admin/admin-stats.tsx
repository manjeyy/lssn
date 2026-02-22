"use client";

import { BookOpenCheck, Layers3, Tags, Users2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

type AdminStatsProps = {
  usersCount: number;
  lssnsCount: number;
  categoriesCount: number;
  topicsCount: number;
  showCharts?: boolean;
};

const statCards = [
  {
    label: "Total users",
    key: "usersCount",
    icon: Users2,
    iconWrapper: "bg-cyan-500/10",
    iconClassName: "text-cyan-300",
    caption: "Across all roles",
    color: "#06b6d4",
    dataKey: "users",
  },
  {
    label: "LSSNs",
    key: "lssnsCount",
    icon: BookOpenCheck,
    iconWrapper: "bg-emerald-500/10",
    iconClassName: "text-emerald-300",
    caption: "Lessons in the library",
    color: "#10b981",
    dataKey: "lssns",
  },
  {
    label: "Categories",
    key: "categoriesCount",
    icon: Layers3,
    iconWrapper: "bg-amber-500/10",
    iconClassName: "text-amber-300",
    caption: "Taxonomy buckets",
    color: "#f59e0b",
    dataKey: "categories",
  },
  {
    label: "Topics",
    key: "topicsCount",
    icon: Tags,
    iconWrapper: "bg-rose-500/10",
    iconClassName: "text-rose-300",
    caption: "Topic groupings",
    color: "#f43f5e",
    dataKey: "topics",
  },
] as const;

// Sample data for the last 6 months
const chartData = [
  { month: "Sep", users: 45, lssns: 12, categories: 8, topics: 24 },
  { month: "Oct", users: 52, lssns: 15, categories: 9, topics: 28 },
  { month: "Nov", users: 68, lssns: 22, categories: 11, topics: 35 },
  { month: "Dec", users: 85, lssns: 31, categories: 14, topics: 42 },
  { month: "Jan", users: 102, lssns: 42, categories: 18, topics: 51 },
  { month: "Feb", users: 128, lssns: 58, categories: 22, topics: 63 },
];

const chartConfig = {
  users: {
    label: "Users",
    color: "#06b6d4",
  },
  lssns: {
    label: "LSSNs",
    color: "#10b981",
  },
  categories: {
    label: "Categories",
    color: "#f59e0b",
  },
  topics: {
    label: "Topics",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

export function AdminStats({
  usersCount,
  lssnsCount,
  categoriesCount,
  topicsCount,
  showCharts = false,
}: AdminStatsProps) {
  const values = {
    usersCount,
    lssnsCount,
    categoriesCount,
    topicsCount,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              className="app-surface border app-border shadow-none"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted">
                    {card.label}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${card.iconWrapper}`}>
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-strong">
                  {values[card.key]}
                </div>
                <p className="text-xs text-subtle mt-2">{card.caption}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showCharts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Users Chart */}
          <Card className="app-surface border app-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg p-2 bg-cyan-500/10">
                  <Users2 className="h-4 w-4 text-cyan-300" />
                </div>
                User Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="app-surface border app-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg p-2 bg-emerald-500/10">
                  <BookOpenCheck className="h-4 w-4 text-emerald-300" />
                </div>
                LSSNs Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLssns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="lssns"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLssns)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="app-surface border app-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg p-2 bg-amber-500/10">
                  <Layers3 className="h-4 w-4 text-amber-300" />
                </div>
                Categories Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCategories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="categories"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCategories)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="app-surface border app-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg p-2 bg-rose-500/10">
                  <Tags className="h-4 w-4 text-rose-300" />
                </div>
                Topics Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTopics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="topics"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTopics)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="app-surface border app-border shadow-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Platform Overview - All Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsersAll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLssnsAll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCategoriesAll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTopicsAll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    fill="url(#colorUsersAll)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="lssns"
                    stroke="#10b981"
                    fill="url(#colorLssnsAll)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="categories"
                    stroke="#f59e0b"
                    fill="url(#colorCategoriesAll)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="topics"
                    stroke="#f43f5e"
                    fill="url(#colorTopicsAll)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}