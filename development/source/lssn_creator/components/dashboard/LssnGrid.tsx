"use client";

import { Eye, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LssnItem = {
  id: number;
  title: string;
  description: string;
  slides: number;
  createdAt: string;
  thumbnail?: string;
  status: "draft" | "published";
  views: number;
  likes: number;
  rating: number;
};

type LssnGridProps = {
  isLoading: boolean;
  lssns: LssnItem[];
  searchQuery: string;
  formatDate: (dateStr: string) => string;
  onDelete: (id: number) => void;
};

export function LssnGrid({ isLoading, lssns, searchQuery, formatDate, onDelete }: LssnGridProps) {
  if (isLoading) {
    return (
      <Card className="border-dashed border-2 app-border app-bg shadow-none">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-strong mb-2">Loading...</h3>
            <p className="text-subtle">Fetching your LSSNs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lssns.length === 0) {
    return (
      <Card className="border-dashed border-2 app-border app-bg shadow-none">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-strong mb-2">No LSSNs found</h3>
            <p className="text-subtle">
              {searchQuery ? "Try adjusting your search terms" : "Create your first LSSN to get started"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {lssns.map((lssn) => (
        <Card key={lssn.id} className="app-surface p-0 border app-border shadow-none overflow-hidden">
          <div className="relative h-60 p-0 app-surface-2 flex items-center justify-center border-b app-border overflow-hidden">
            {lssn.thumbnail ? (
              <img src={lssn.thumbnail} alt={lssn.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-5xl font-bold text-strong opacity-30">{lssn.slides}</div>
                <p className="text-sm text-muted mt-2">slides</p>
              </div>
            )}
            <Badge variant={lssn.status === "published" ? "default" : "secondary"} className="absolute top-3 right-3 whitespace-nowrap">
              {lssn.status}
            </Badge>
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-base line-clamp-2 text-strong">{lssn.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-muted">{lssn.description}</CardDescription>
          </CardHeader>

          <CardContent className="pb-3">
            {lssn.status === "published" && (
              <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t app-border">
                <div className="text-center">
                  <p className="text-xs text-subtle mb-1">Views</p>
                  <p className="font-semibold text-strong text-sm">{lssn.views.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-subtle mb-1">Likes</p>
                  <p className="font-semibold text-strong text-sm">{lssn.likes}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-subtle mb-1">Rating</p>
                  <p className="font-semibold text-strong text-sm">{lssn.rating.toFixed(1)}%</p>
                </div>
              </div>
            )}
            <p className="text-xs text-subtle">Created {formatDate(lssn.createdAt)}</p>
          </CardContent>

          <div className="border-t app-border p-3 flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs app-input">
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs app-input">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted hover:text-red-300 hover:bg-red-500/10"
              onClick={() => onDelete(lssn.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
