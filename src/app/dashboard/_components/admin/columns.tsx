"use client"

import { Cell, Column, ColumnDef, Row, Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { SwitchTableColumn, SelectTableColumn, ExportTableColumn } from "@/constants/columns"
import { TDepartments, TWorkHour } from "@/types/index.types"
import Actions from "@/app/dashboard/_components/admin/Actions"


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


export type ReceptionistColumnsTypes = UserColumnsTypes & {
    department: TDepartments
}
export type AdminColmnsTypes = UserColumnsTypes & {
    super: boolean
};

export type DoctorColumnsTypes = UserColumnsTypes & {
    specialty: string | null; // Allow null values for specialty
    workTime: { workHour: any; day: string }[];
}

const userColumns = ['id', 'firstname', 'lastname', 'username', 'email', 'phone', 'nationalId', 'dob', 'gender', 'role', 'table']
const adminColumns = userColumns;
const receptionistColumns = userColumns.concat('department');
const doctorColumns = userColumns.concat('fee', 'specialty');

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
            const workTimeColumnExists = table.getAllColumns().some((column: Column<any>) => column.id === "workTime");

            let rowData = {};
            if (row.getValue('table') == 'doctor' && workTimeColumnExists) {
                rowData = doctorColumns.reduce((acc: { [key: string]: DoctorColumnsTypes }, column: string) => {
                    acc[column] = row.getValue(column);
                    return acc;
                }, {});
            } else if (row.getValue('table') == 'receptionist') {
                rowData = receptionistColumns.reduce((acc: { [key: string]: ReceptionistColumnsTypes }, column: string) => {
                    acc[column] = row.getValue(column);
                    return acc;
                }, {});
            } else {
                rowData = userColumns.reduce((acc: { [key: string]: DoctorColumnsTypes }, column: string) => {
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
        filterFn: (row: Row<any>, id: string, value: any) => {
            if (column == 'specialty') {
                return value.includes(row.getValue(id))
            }
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
            const workTime: { day: string; workHour: TWorkHour }[] = row.getValue('workTime')

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
    ...ExportTableColumn,
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
    ...ExportTableColumn,
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
    ...ExportTableColumn,
];

export const ReceptionistTableColumns: ColumnDef<ReceptionistColumnsTypes>[] = [
    ...SelectTableColumn,
    ...receptionistColumns.map((column: string) => ({
        accessorKey: column,
        header: ({ column }: { column: any }) => {
            return (
                <DataTableColumnHeader column={column} title={column.name || column.id} />
            )
        },
        cell: ({ cell, row }: { cell: Cell<any, any>, row: Row<any> }) => {
            return (
                <>
                    {cell.column.id == 'department' ? (
                        <p>{(row.getValue('department') as string).toUpperCase()}</p>
                    ) : (
                        <p>{cell.getValue()}</p>
                    )}
                </>
            )
        },
    }))
];

export const ReceptionistTableColumnsWithPrivileges: ColumnDef<ReceptionistColumnsTypes>[] = [
    ...ReceptionistTableColumns,
    ...WithPrivileges,
]

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