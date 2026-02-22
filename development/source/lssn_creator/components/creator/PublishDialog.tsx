"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/api";

type PublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lssnTitle: string;
  lssnDescription: string;
  thumbnailUrl: string | null;
  categories: { id: number; name: string; thumbnailUrl?: string | null }[];
  topics: { id: number; name: string }[];
  selectedCategoryIds: number[];
  selectedTopicIds: number[];
  tagsInput: string;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onThumbnailClick: () => void;
  onCategoryChange: (values: number[]) => void;
  onTopicChange: (values: number[]) => void;
  onTagsChange: (value: string) => void;
  onCancel: () => void;
  onPublish: () => void;
};

export function PublishDialog({
  open,
  onOpenChange,
  lssnTitle,
  lssnDescription,
  thumbnailUrl,
  categories,
  topics,
  selectedCategoryIds,
  selectedTopicIds,
  tagsInput,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onThumbnailClick,
  onCategoryChange,
  onTopicChange,
  onTagsChange,
  onCancel,
  onPublish,
}: PublishDialogProps) {
  const resolveAssetUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${getApiBaseUrl()}${url}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="creator-panel text-strong max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-strong">Publish LSSN</DialogTitle>
          <DialogDescription className="text-muted">
            Add the title, description, thumbnail, and metadata before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Title</Label>
            <Input
              placeholder="LSSN title"
              className="h-10 app-input focus-visible:ring-0 focus-visible:border-cyan-400"
              value={lssnTitle}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Description</Label>
            <Textarea
              placeholder="Short description"
              className="min-h-24 app-input focus-visible:ring-0 focus-visible:border-cyan-400"
              value={lssnDescription}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Thumbnail</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border app-border text-muted app-surface"
                onClick={onThumbnailClick}
              >
                {thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
              </Button>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="h-16 w-28 rounded-md object-cover border app-border"
                />
              ) : (
                <div className="h-16 w-28 rounded-md border border-dashed app-border flex items-center justify-center text-xs text-subtle">
                  No thumbnail
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Categories</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((category) => {
                  const isSelected = selectedCategoryIds.includes(category.id);
                  const imageUrl = resolveAssetUrl(category.thumbnailUrl);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-lg border app-border p-2 text-left transition ${
                        isSelected
                          ? "border-cyan-400/70 ring-2 ring-cyan-400/50"
                          : "hover:border-cyan-400/40"
                      }`}
                      onClick={() => {
                        const next = isSelected
                          ? selectedCategoryIds.filter((id) => id !== category.id)
                          : [...selectedCategoryIds, category.id];
                        onCategoryChange(next);
                      }}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-md border app-border bg-slate-900/20">
                        {imageUrl ? (
                          <img src={imageUrl} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-subtle">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center text-xs font-semibold text-strong">
                        {category.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Topics</Label>
              <select
                multiple
                className="h-32 rounded-md app-input text-sm"
                value={selectedTopicIds.map(String)}
                onChange={(event) => {
                  const values = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
                  onTopicChange(values);
                }}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-[11px] font-semibold text-subtle uppercase tracking-wider">Tags</Label>
            <Input
              placeholder="comma, separated, tags"
              className="h-10 app-input focus-visible:ring-0 focus-visible:border-cyan-400"
              value={tagsInput}
              onChange={(event) => onTagsChange(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="border app-border text-muted app-surface" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="primary-solid font-semibold" onClick={onPublish} disabled={isSaving}>
            {isSaving ? "Saving..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
