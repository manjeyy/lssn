import { ImagePlus, Trash2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api";

type CategoriesSectionProps = {
  categories: Array<{
    id: string | number;
    name: string;
    slug: string;
    thumbnailUrl?: string | null;
  }>;
  categoryName: string;
  categorySlug: string;
  categoryThumb: string | null;
  onCategoryNameChange: (value: string) => void;
  onCategorySlugChange: (value: string) => void;
  onUpload: (file: File) => void | Promise<void>;
  onCreate: () => void | Promise<void>;
  onRefresh: (id: string | number, name: string) => void | Promise<void>;
  onDelete: (id: string | number) => void | Promise<void>;
};

export function CategoriesSection({
  categories,
  categoryName,
  categorySlug,
  categoryThumb,
  onCategoryNameChange,
  onCategorySlugChange,
  onUpload,
  onCreate,
  onRefresh,
  onDelete,
}: CategoriesSectionProps) {
  const resolveAssetUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${getApiBaseUrl()}${url}`;
  };

  const previewUrl = resolveAssetUrl(categoryThumb ?? undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
      <Card className="app-surface border app-border shadow-none">
        <CardHeader>
          <CardTitle className="text-strong">New category</CardTitle>
          <CardDescription className="text-muted">
            Add a new content bucket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Category name"
            value={categoryName}
            onChange={(event) => onCategoryNameChange(event.target.value)}
            className="app-input"
          />
          <Input
            placeholder="Slug (optional)"
            value={categorySlug}
            onChange={(event) => onCategorySlugChange(event.target.value)}
            className="app-input"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
              }
            }}
            className="app-input"
          />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Category thumbnail"
              className="h-24 w-full rounded-lg border app-border object-cover"
            />
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed app-border text-xs text-subtle">
              <ImagePlus className="size-4" />
              <span className="ml-2">Upload a thumbnail</span>
            </div>
          )}
          <Button
            className="w-full gap-2 bg-lime-800 hover:bg-lime-900 font-semibold text-white"
            onClick={onCreate}
          >
            <Wand2 className="size-4" />
            Create category
          </Button>
        </CardContent>
      </Card>

      <Card className="app-surface border app-border shadow-none">
        <CardHeader>
          <CardTitle className="text-strong">Categories</CardTitle>
          <CardDescription className="text-muted">
            Keep your taxonomy tidy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((row) => {
              const thumbnailUrl = resolveAssetUrl(row.thumbnailUrl);

              return (
                <div
                  key={row.id}
                  className="overflow-hidden rounded-lg border app-border app-surface-2"
                >
                  <div className="relative h-36 w-full overflow-hidden border-b app-border">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={row.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-subtle">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <div>
                      <p className="text-sm font-semibold text-strong">
                        {row.name}
                      </p>
                      <p className="text-xs text-muted">{row.slug}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="app-input text-muted"
                        onClick={() => onRefresh(row.id, row.name)}
                      >
                        Sync
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => onDelete(row.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
