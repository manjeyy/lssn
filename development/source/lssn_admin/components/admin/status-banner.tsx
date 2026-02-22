import { AlertCircle, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";

type StatusBannerProps = {
  error: string | null;
  isLoading: boolean;
  hasData: boolean;
};

export function StatusBanner({ error, isLoading, hasData }: StatusBannerProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="size-4" />
          Something went wrong
        </div>
        <p className="mt-1 text-red-200/90">{error}</p>
      </div>
    );
  }

  if (!hasData && isLoading) {
    return (
      <Card className="border-dashed border-2 app-border app-bg shadow-none">
        <div className="flex items-center justify-center gap-2 px-6 py-8 text-sm text-subtle">
          <Loader2 className="size-4 animate-spin" />
          Loading admin data...
        </div>
      </Card>
    );
  }

  return null;
}
