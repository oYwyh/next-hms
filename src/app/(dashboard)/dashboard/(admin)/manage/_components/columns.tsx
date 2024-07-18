"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import Actions from "@/app/(dashboard)/admin/manage/_components/Actions"
import { baseColumns, BaseColumnsTypes, SwitchTableColumn, SelectTableColumn, ExportTableColumn } from "@/constants/columns"
import { TWorkHours } from "@/lib/types"


export type UserColumnsTypes = BaseColumnsTypes;

export type AdminColmnsTypes = BaseColumnsTypes & {
    super: boolean
};

export type DoctorColumnsTypes = BaseColumnsTypes & {
    specialty: string | null; // Allow null values for specialty
    workTime: { workHour: any; day: string }[];
}

const userColumns = baseColumns;
const adminColumns = baseColumns;
const doctorColumns = baseColumns.concat('specialty');

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
            let rowData = {};
            if (row.getValue('role') == 'doctor') {
                rowData = doctorColumns.reduce((acc: { [key: string]: DoctorColumnsTypes }, column: string) => {
                    acc[column] = row.getValue(column);
                    return acc;
                }, {});
            } else {
                rowData = baseColumns.reduce((acc: { [key: string]: DoctorColumnsTypes }, column: string) => {
                    acc[column] = row.getValue(column);
                    return acc;
                }, {});
            }

            return (
                <Actions row={row} rowData={rowData} />
            )
        },
    },
]

const WithPrivileges = [
    ...ActionsTableColumn,
    ...ExportTableColumn,
]


export const DoctorTableColumns: ColumnDef<DoctorColumnsTypes>[] = [
    ...SelectTableColumn,
    ...doctorColumns.map((column: string) => ({
        id: column,
        accessorKey: column,
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={column.name || column.id} />
            )
        },
    })),
    {
        accessorKey: 'workTime',
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={'Work Time'} />
            )
        },
        cell: ({ cell, row }) => {
            const workTime: { day: string; workHour: TWorkHours }[] = row.getValue('workTime')

            if (!workTime) {
                throw new Error('Work time not found')
            }

            // Group hours by day
            const time = workTime.reduce((acc, time) => {
                const value = time.workHour.from.slice(0, 5) + ' - ' + time.workHour.to.slice(0, 5);

                // Check if the accumulator already has an entry for the current time's day
                if (!acc[time.day]) {
                    // If not, create an empty array for this day
                    acc[time.day] = [];
                }

                // Push the current time's value to the array for this day
                acc[time.day].push(value);

                // Return the updated accumulator to be used in the next iteration
                return acc;
            }, {} as Record<string, string[]>); // Initial value of the accumulator is an empty object

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <span className="sr-only">Open menu</span>
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {time && Object.entries(time).map(([day, hours]) => (
                                <DropdownMenuItem key={day}>
                                    <div className="flex flex-col gap-1">
                                        <p>{day}: &#123;</p>
                                        <ul>
                                            {hours.map((hour, index) => (
                                                <li key={index}>- {hour}</li>
                                            ))}
                                        </ul>
                                        &#125;
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        },
    },
];

export const UserTableColumns: ColumnDef<UserColumnsTypes>[] = [
    ...SelectTableColumn,
    ...userColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={column.name || column.id} />
            )
        },
    })),
];

export const AdminTableColumns: ColumnDef<AdminColmnsTypes>[] = [
    ...SelectTableColumn,
    ...adminColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={column.name || column.id} />
            )
        },
    })),
];

export const DoctorTableColumnsWithPrivileges: ColumnDef<DoctorColumnsTypes>[] = [
    ...DoctorTableColumns,
    ...WithPrivileges,
]

export const UserTableColumnsWithPrivileges: ColumnDef<UserColumnsTypes>[] = [
    ...UserTableColumns,
    ...WithPrivileges,
]

export const AdminTableColumnsWithPrivileges: ColumnDef<AdminColmnsTypes>[] = [
    ...AdminTableColumns,
    ...SwitchTableColumn,
    ...WithPrivileges
]