"use client"

import { Column, ColumnDef, Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { baseColumns, BaseColumnsTypes, SwitchTableColumn, SelectTableColumn, ExportTableColumn, WithExportColumn } from "@/components/ui/table/Columns"
import Actions from "./AppointmentActions"

const appointmentColumns = ['id', 'userId', 'doctorId', 'doctorName', 'patientName', 'date', 'time', 'status']

const ActionsTableColumn = [
    {
        id: "actions",
        accessorKey: "actions",
        header: () => {
            return (
                <p>Actions</p>
            )
        },
        cell: ({ row }: { row: Row<any> }) => {
            return (
                <Actions row={row} />
            )
        },
    },
]

const statusOpt = [
    { label: "pending", color: "gold" },
    { label: "completed", color: "lightgreen" },
    { label: "cancelled", color: "red" },
]

export const AppointmentTableColumns: ColumnDef<any>[] = [
    ...SelectTableColumn,
    ...appointmentColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={column.name || column.id} />,
        cell: ({ row }: { row: Row<any> }) => {
            if (column == 'status') {
                const status: ("pending" | "completed" | "cancelled") = row.getValue("status");
                const statusObj = statusOpt.find(opt => opt.label === status);
                const color = statusObj ? statusObj.color : 'black'; // Default to black if status not found

                return <p style={{ color }}>{status}</p>;
            } else {
                return <p>{row.getValue(column)}</p>
            }
        },
        filterFn: (row: Row<any>, id: string, value: any) => {
            if (column == 'status') {
                return value.includes(row.getValue(id))
            }
        },
    })),
    ...ActionsTableColumn,
    ...WithExportColumn
]