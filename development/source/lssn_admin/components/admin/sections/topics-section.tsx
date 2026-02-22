import { Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TopicsSectionProps = {
  topics: Array<{ id: string | number; name: string; slug: string }>;
  topicName: string;
  topicSlug: string;
  onTopicNameChange: (value: string) => void;
  onTopicSlugChange: (value: string) => void;
  onCreate: () => void | Promise<void>;
  onRefresh: (id: string | number, name: string) => void | Promise<void>;
  onDelete: (id: string | number) => void | Promise<void>;
};

export function TopicsSection({
  topics,
  topicName,
  topicSlug,
  onTopicNameChange,
  onTopicSlugChange,
  onCreate,
  onRefresh,
  onDelete,
}: TopicsSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
      <Card className="app-surface border app-border shadow-none">
        <CardHeader>
          <CardTitle className="text-strong">New topic</CardTitle>
          <CardDescription className="text-muted">
            Start a new conversation lane.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Topic name"
            value={topicName}
            onChange={(event) => onTopicNameChange(event.target.value)}
            className="app-input"
          />
          <Input
            placeholder="Slug (optional)"
            value={topicSlug}
            onChange={(event) => onTopicSlugChange(event.target.value)}
            className="app-input"
          />
          <Button
            className="w-full gap-2 bg-lime-800 hover:bg-lime-900 font-semibold text-white"
            onClick={onCreate}
          >
            <Sparkles className="size-4" />
            Create topic
          </Button>
        </CardContent>
      </Card>

      <Card className="app-surface border app-border shadow-none">
        <CardHeader>
          <CardTitle className="text-strong">Topics</CardTitle>
          <CardDescription className="text-muted">
            Keep the roadmap organized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-subtle">Name</TableHead>
                <TableHead className="text-subtle">Slug</TableHead>
                <TableHead className="text-right text-subtle">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-strong">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-muted">{row.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
