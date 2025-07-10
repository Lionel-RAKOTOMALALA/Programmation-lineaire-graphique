"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import type { SolutionMethod } from '@/app/page'

type TableData = {
  tableData: {
    headers: string[]
    rows: string[][]
  }
  method: SolutionMethod
}

export function ResultsTable({ tableData, method }: TableData) {
  const { headers, rows } = tableData
  
  if (!headers.length || !rows.length) {
    return null
  }

  return (
    <Card className="modern-card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"></div>
        <h2 className="text-2xl font-bold gradient-text">
          {method === 'simplex' ? 'Tableau du Simplexe' : 
           method === 'general' ? 'Résultats Forme Générale' : 'Tableau des Résultats'}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-center whitespace-nowrap text-blue-300 font-semibold">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-blue-500/10">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center text-white font-mono">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}