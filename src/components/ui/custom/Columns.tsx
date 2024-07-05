"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/custom/DataTableColumnHeader"
import Edit from "@/app/(dashboard)/admin/manage/_components/edit"
import Delete from "@/app/(dashboard)/admin/manage/_components/delete"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import * as XLSX from 'xlsx'
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader, DialogTitle } from "../dialog"
import { Label } from "@radix-ui/react-label"
import { Input } from "../input"
import { ChangeEvent, useState } from "react"
import { useForm } from "react-hook-form"
import { Form } from "../form"
import FormField from "./FormField"
import SwitchInput from "./SwitchInput"
import Actions from "@/app/(dashboard)/admin/manage/_components/actions"

export type BaseColumnsTypes = {
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

export type UserColumnsTypes = BaseColumnsTypes;

export type AdminColmnsTypes = BaseColumnsTypes & {
  super: boolean
};

export type DoctorColumnsTypes = BaseColumnsTypes & {
  specialty: string | null; // Allow null values for specialty
  workTime: { workHour: any; day: string }[];
}

const baseColumns = ['id', 'firstname', 'lastname', 'username', 'email', 'phone', 'nationalId', 'age', 'gender', 'role']
const userColumns = baseColumns;
const adminColumns = baseColumns;
const doctorColumns = baseColumns.concat('specialty');



const selectTableColumn = [
  {
    id: "select",
    accessorKey: "select",
    header: ({ table }: { table: any }) => (
      <>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />

      </>
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

const exportTableColumn = [{
  id: "export",
  accessorKey: "export",
  header: ({ table }: { table: any }) => {
    const onExport = (data: any, title: string) => {
      // Create Excel workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils?.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'test');
      // Save the workbook as an Excel file
      XLSX.writeFile(workbook, `${title}.xlsx`);
    }

    let fileName = '';
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      fileName = e.target.value;
    };

    const handleExportClick = () => {
      const selectedRows = table.getSelectedRowModel().rows.map((row: any) => row.original);
      onExport(selectedRows, fileName);
    };

    return (
      <>
        {table.getIsSomeRowsSelected() == true && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Export</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>File Name</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    onChange={handleInputChange}
                    id="name"
                    placeholder="File name"
                    className="col-span-3"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleExportClick} type="submit">Export</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>

        )}
        {table.getIsAllRowsSelected() == true && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Export</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>File Name</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  onChange={handleInputChange}
                  id="name"
                  placeholder="File name"
                  className="col-span-3"
                />
              </div>
              {/* <Button onClick={() => onExport(table.getSelectedRowModel().rows.map(row => row.original))}>Export</Button> */}

              <DialogFooter>
                <Button onClick={handleExportClick} type="submit">Export</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  },
}]

const actionsTableColumn = [
  {
    id: "actions",
    accessorKey: "actions",
    header: () => {
      return (
        <p>Actions</p>
      )
    },
    cell: ({ row }: { row: any }) => {
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

const SwitchTableColumn = [
  {
    id: "super",
    accessorKey: 'super',
    header: ({ column }: { column: any }) => {
      return (
        <DataTableColumnHeader column={column} title='Super' />
      )
    },
    cell: ({ row }: { row: any }) => {
      return (
        <SwitchInput id={row.getValue('id')} value={row.getValue('super')} />
      )
    }
  }
]

const WithPrivileges = [
  ...actionsTableColumn,
  ...exportTableColumn,
]

export const DoctorTableColumns: ColumnDef<DoctorColumnsTypes>[] = [
  ...selectTableColumn,
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
      const workTime: { day: string; workHour: { id: number, workdayId: number, startAt: string; endAt: string } }[] = row.getValue('workTime')

      if (!workTime) {
        throw new Error('Work time not found')
      }

      // Group hours by day
      const time = workTime.reduce((acc, time) => {
        const value = time.workHour.startAt.slice(0, 5) + ' - ' + time.workHour.endAt.slice(0, 5);

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
  ...selectTableColumn,
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
  ...selectTableColumn,
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
  ...WithPrivileges,
]