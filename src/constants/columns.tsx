"use client"

import { Checkbox } from "@/components/ui/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import * as XLSX from 'xlsx'
import SwitchInput from "@/components/ui/custom/SwitchInput"
import Name, { TnameSchema } from "@/components/ui/custom/Name"

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

export const baseColumns = ['id', 'firstname', 'lastname', 'username', 'email', 'phone', 'nationalId', 'age', 'gender', 'role']

export const SelectTableColumn = [
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

export const ExportTableColumn = [{
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

    const handleExportClick = (data: TnameSchema) => {
      const selectedRows = table.getSelectedRowModel().rows.map((row: any) => row.original);
      onExport(selectedRows, data.name);
    }

    return (
      <>
        {table.getIsSomeRowsSelected() == true && (
          <Name handleClick={handleExportClick} title={'Export'} name={'File'} />
        )}
        {table.getIsAllRowsSelected() == true && (
          <Name handleClick={handleExportClick} title={'Export'} name={'File'} />
        )}
      </>
    )
  },
}]

export const SwitchTableColumn = [
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

export const WithExportColumn = [
  ...ExportTableColumn,
]