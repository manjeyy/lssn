"use client";

import { useMemo } from "react";
import { Eye, ThumbsUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewsChart, LikesChart, LssnsChart, RatingChart, type TrendDataPoint } from "./StatsCharts";

type StatsGridProps = {
  totalViews: number;
  totalLikes: number;
  totalLssns: number;
  avgRating: number;
  lssns: {
    createdAt: string;
    views: number;
    likes: number;
    rating: number;
  }[];
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
  });

export function StatsGrid({ totalViews, totalLikes, totalLssns, avgRating, lssns }: StatsGridProps) {
  const trendData = useMemo<TrendDataPoint[]>(() => {
    const now = new Date();
    const days: TrendDataPoint[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);

      return {
        date: formatDayLabel(date),
        views: 0,
        likes: 0,
        lssns: 0,
        rating: 0,
      };
    });

    const ratingsAccumulator = days.map(() => ({ total: 0, count: 0 }));

    lssns.forEach((lssn) => {
      const created = new Date(lssn.createdAt);
      created.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 6) {
        return;
      }

      const dayIndex = 6 - diffDays;
      days[dayIndex].lssns += 1;
      days[dayIndex].views += lssn.views;
      days[dayIndex].likes += lssn.likes;

      if (lssn.rating > 0) {
        ratingsAccumulator[dayIndex].total += lssn.rating;
        ratingsAccumulator[dayIndex].count += 1;
      }
    });

    return days.map((day, index) => {
      const ratingMeta = ratingsAccumulator[index];
      return {
        ...day,
        rating: ratingMeta.count > 0 ? Number((ratingMeta.total / ratingMeta.count).toFixed(1)) : 0,
      };
    });
  }, [lssns]);

  return (
    <div className="space-y-6 mb-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="app-surface border app-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted">Total Views</CardTitle>
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-strong">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-subtle mt-2">Across all lessons</p>
          </CardContent>
        </Card>

        <Card className="app-surface border app-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted">Total Likes</CardTitle>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <ThumbsUp className="h-5 w-5 text-rose-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-strong">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-subtle mt-2">Total engagement</p>
          </CardContent>
        </Card>

        <Card className="app-surface border app-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted">LSSNs</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <div className="h-5 w-5 text-emerald-300 font-bold">L</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-strong">{totalLssns}</div>
            <p className="text-xs text-subtle mt-2">Lessons created</p>
          </CardContent>
        </Card>

        <Card className="app-surface border app-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted">Avg. Rating</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Star className="h-5 w-5 text-amber-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-strong">{avgRating}%</div>
            <p className="text-xs text-subtle mt-2">Based on likes vs dislikes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsChart data={trendData} />
        <LikesChart data={trendData} />
        <LssnsChart data={trendData} />
        <RatingChart data={trendData} />
      </div>
    </div>
  );
}
