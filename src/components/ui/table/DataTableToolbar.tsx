"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/Button"
import { CirclePlus } from "lucide-react"
import { DataTableFacetedFilter } from "@/components/ui/table/DataTableFacetedFilter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  filters?: { column: string, options: { label: string, value: string }[] }[]
}

export function DataTableToolbar<TData>({
  table,
  filters = []
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filters.map(filter => {
          const column = table.getColumn(filter.column);
          if (!column) return null;

          const title = filter.column.charAt(0).toUpperCase() + filter.column.slice(1);

          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
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