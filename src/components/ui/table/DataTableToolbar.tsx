"use client"

import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { DataTableViewOptions } from "@/components/ui/table/DataTableViewOptions"

import { statuses } from "@/constants"
import { DataTableFacetedFilter } from "@/components/ui/table/DataTableFacetedFilter"
import { CirclePlus } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CirclePlus className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}