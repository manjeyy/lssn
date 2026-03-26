import { Trash2 } from "lucide-react";

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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type UsersSectionProps = {
  users: Array<{
    id: string | number;
    name: string;
    email: string;
    role: string;
  }>;
  onRoleChange: (id: string | number, role: string) => void | Promise<void>;
  onDelete: (id: string | number) => void | Promise<void>;
};

export function UsersSection({
  users,
  onRoleChange,
  onDelete,
}: UsersSectionProps) {
  return (
    <Card className="app-surface border app-border shadow-none">
      <CardHeader>
        <CardTitle className="text-strong">Users</CardTitle>
        <CardDescription className="text-muted">
          Manage account access and roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="text-subtle">Name</TableHead>
              <TableHead className="text-subtle">Email</TableHead>
              <TableHead className="text-subtle">Role</TableHead>
              <TableHead className="text-right text-subtle">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-strong">
                  {row.name}
                </TableCell>
                <TableCell className="text-muted">{row.email}</TableCell>
                <TableCell>
                  <NativeSelect
                    value={row.role}
                    onChange={(event) =>
                      onRoleChange(row.id, event.target.value)
                    }
                    className="app-input text-muted"
                  >
                    <NativeSelectOption value="viewer">
                      viewer
                    </NativeSelectOption>
                    <NativeSelectOption value="creator">
                      creator
                    </NativeSelectOption>
                    <NativeSelectOption value="admin">
                      admin
                    </NativeSelectOption>
                  </NativeSelect>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => onDelete(row.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
