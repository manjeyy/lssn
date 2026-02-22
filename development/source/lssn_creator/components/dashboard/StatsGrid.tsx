"use client";

import { Eye, ThumbsUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewsChart, LikesChart, LssnsChart, RatingChart } from "./StatsCharts";

type StatsGridProps = {
  totalViews: number;
  totalLikes: number;
  totalLssns: number;
  avgRating: number;
};

export function StatsGrid({ totalViews, totalLikes, totalLssns, avgRating }: StatsGridProps) {
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
        <ViewsChart />
        <LikesChart />
        <LssnsChart />
        <RatingChart />
      </div>
    </div>
  );
}
