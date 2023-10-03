import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { LucideMoreHorizontal, Trash2 } from "lucide-react";

const deleteSupervisor = async (id: string) => {
  await fetch(`/api/admin/supervisors/${id}`, { method: "DELETE" });
};

export interface SupervisorProjectData {
  id: string;
  title: string;
}

export const columns: ColumnDef<SupervisorProjectData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" canFilter />
    ),
  },
  {
    accessorKey: "actions",
    id: "Actions",
    header: () => {
      return <div className="text-xs text-gray-500">Actions</div>;
    },
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <LucideMoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a href={`/supervisors/${row.original.id}`}>
                <Button variant="link">View Details</Button>
              </a>
            </DropdownMenuItem>
            {false && (
              <DropdownMenuItem>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => deleteSupervisor(row.original.id)} // TODO: removes student from isntance instead of deleting from database
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
