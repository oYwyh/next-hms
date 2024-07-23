"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { SelectTableColumn, ExportTableColumn } from "@/constants/columns"
import Actions from "./AppointmentActions"
import { AppointmentStatus } from "@/types/index.types"
import { statusOpt } from "@/constants"

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

export const AppointmentTableColumns: ColumnDef<any>[] = [
    ...SelectTableColumn,
    ...appointmentColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={column.name || column.id} />,
        cell: ({ row }: { row: Row<any> }) => {
            if (column == 'status') {
                const status: AppointmentStatus = row.getValue("status");
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
    ...ExportTableColumn
]