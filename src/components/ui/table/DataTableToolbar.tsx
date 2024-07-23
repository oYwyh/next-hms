"use client"

import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { DataTableViewOptions } from "@/components/ui/table/DataTableViewOptions"

import { specialties, statuses } from "@/constants"
import { DataTableFacetedFilter } from "@/components/ui/table/DataTableFacetedFilter"
import { CirclePlus } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const statusColumnExists = table.getAllColumns().some(column => column.id === "status");
  const specialtyColumnExists = table.getAllColumns().some(column => column.id === "specialty");

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {statusColumnExists && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {specialtyColumnExists && (
          <DataTableFacetedFilter
            column={table.getColumn("specialty")}
            title="specialty"
            options={specialties}
          />
        )}
        <Button
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <CirclePlus className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}