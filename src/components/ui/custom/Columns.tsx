"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/custom/DataTableColumnHeader"
import { Form, useForm } from "react-hook-form"
import FormField from "./FormField"
import { TaddSchema, addSchema } from "@/app/(dashboard)/types"
import { zodResolver } from "@hookform/resolvers/zod"
import Add from "@/app/(dashboard)/admin/manage/_components/add"
import Edit from "@/app/(dashboard)/admin/manage/_components/edit"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DoctorColumnsType = {
  username: string
  email: string
  phone: string
  age: string
}

const doctor = true

const doctorColumns = ['id', 'firstname', 'lastname', 'username', 'email', 'phone', 'nationalId', 'age', 'gender', 'specialty']



export const columns: ColumnDef<DoctorColumnsType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
  ...doctorColumns.map((column: string) => ({
    accessorKey: column,
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title={column.name || column.id} />
      )
    },
  })),
  // {
  //   accessorKey: 'workDay'
  // },
  {
    accessorKey: 'workTime',
    header: ({ column }) => {
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
  {
    id: "actions",
    header: ({ column }) => {
      return (
        <p>Actions</p>
      )
    },
    cell: ({ row }) => {
      const rowData = doctorColumns.reduce((acc, column: string) => {
        acc[column] = row.getValue(column);
        acc['workTime'] = row.getValue('workTime');
        return acc;
      }, {});
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Edit operation='edit' userId={row.getValue('id')} userData={rowData} />
          </DropdownMenuContent>
        </DropdownMenu >
      )
    },
  },
];
