import Actions from "@/app/_components/receipt/Actions";
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader";
import { ColumnDef, Row, Table } from "@tanstack/react-table";

export type UserColumnsTypes = {
    id: string | number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phone: string;
    nationalId: string;
    age: string;
    gender: string;
    role: string;
}

const userColumns = ['id', 'firstname', 'lastname', 'username', 'email', 'phone', 'nationalId', 'dob', 'gender', 'role']

const ActionsTableColumn = [
    {
        id: "actions",
        accessorKey: "actions",
        header: () => {
            return (
                <p>Actions</p>
            )
        },
        cell: ({ row, table }: { row: Row<any>, table: Table<any> }) => {
            return (
                <Actions row={row} />
            )
        },
    },
]

export const UserTableColumns: ColumnDef<UserColumnsTypes>[] = [
    ...userColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={column.name || column.id} />
            )
        },
    })),
    ...ActionsTableColumn
];