import { Eye, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LssnsSectionProps = {
  lssns: Array<{
    id: string | number;
    title: string;
    ownerId: string | number;
    status: string;
    views: number;
    likesCount: number;
    rating: number;
  }>;
  onToggleStatus: (id: string | number, status: string) => void | Promise<void>;
  onDelete: (id: string | number) => void | Promise<void>;
};

export function LssnsSection({
  lssns,
  onToggleStatus,
  onDelete,
}: LssnsSectionProps) {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-strong">LSSNs</CardTitle>
        <CardDescription className="text-muted">
          Publish, review, and curate content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="text-subtle">Title</TableHead>
              <TableHead className="text-subtle">Owner</TableHead>
              <TableHead className="text-subtle">Status</TableHead>
              <TableHead className="text-subtle">Engagement</TableHead>
              <TableHead className="text-right text-subtle">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lssns.map((row) => {
              const isPublished = row.status === "published";
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-strong">
                    {row.title}
                  </TableCell>
                  <TableCell className="text-muted">
                    Owner #{row.ownerId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPublished ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">
                    {row.views} views · {row.likesCount} likes ·
                    {" " + Number(row.rating).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="app-input text-muted"
                        onClick={() =>
                          onToggleStatus(
                            row.id,
                            isPublished ? "draft" : "published"
                          )
                        }
                      >
                        <Eye className="size-4" />
                        {isPublished ? "Unpublish" : "Publish"}
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
