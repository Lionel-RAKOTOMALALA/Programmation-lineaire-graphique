"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type TableData = {
  tableData: {
    headers: string[]
    rows: string[][]
  }
}

export function ResultsTable({ tableData }: TableData) {
  const { headers, rows } = tableData
  
  if (!headers.length || !rows.length) {
    return null
  }

  return (
    <div className="p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Étapes de la Méthode du Simplexe</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-center whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}