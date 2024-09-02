"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { SelectTableColumn, ExportTableColumn } from "@/constants/columns"
import Actions from "@/app/_components/receipt/Actions"

const receiptColumns = ['id', 'patient', 'doctor', 'receptionist', 'service', 'amount', 'date', 'type']

const ReceiptActionsTableColumn = [
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

export const ReceiptTableColumns: ColumnDef<any>[] = [
    ...SelectTableColumn,
    ...receiptColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={column.name || column.id} />,
        cell: ({ row }: { row: Row<any> }) => {
            return <p className="capitalize">{row.getValue(column)}</p>
        },
        filterFn: (row: Row<any>, id: string, value: any) => {
            if (column == 'status') {
                return value.includes(row.getValue(id))
            }
        },
    })),
    ...ReceiptActionsTableColumn,
    ...ExportTableColumn
]