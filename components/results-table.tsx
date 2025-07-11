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

  // Pour la méthode graphique, on utilise un format spécial basé sur l'image
  if (method === 'graphical') {
    return (
      <Card className="modern-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"></div>
          <h2 className="text-2xl font-bold gradient-text">
            Résolution graphique - Tableau des Points
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-blue-500/30">
                <TableHead className="text-center font-bold text-blue-300 bg-blue-900/20 border-r border-blue-500/30">
                  Contraintes
                </TableHead>
                <TableHead className="text-center font-bold text-blue-300 bg-blue-900/20 border-r border-blue-500/30">
                  Équations des droites
                </TableHead>
                <TableHead className="text-center font-bold text-blue-300 bg-blue-900/20 border-r border-blue-500/30">
                  Point 1
                </TableHead>
                <TableHead className="text-center font-bold text-blue-300 bg-blue-900/20 border-r border-blue-500/30">
                  Point 2
                </TableHead>
                <TableHead className="text-center font-bold text-blue-300 bg-blue-900/20">
                  Point 3
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-blue-500/10 border-b border-blue-500/20">
                  <TableCell className="text-center text-white font-mono bg-blue-900/10 border-r border-blue-500/20 font-medium">
                    {row[0]}
                  </TableCell>
                  <TableCell className="text-center text-cyan-300 font-mono bg-blue-900/10 border-r border-blue-500/20">
                    {row[1]}
                  </TableCell>
                  <TableCell className="text-center text-green-300 font-mono bg-blue-900/10 border-r border-blue-500/20">
                    {row[2]}
                  </TableCell>
                  <TableCell className="text-center text-green-300 font-mono bg-blue-900/10 border-r border-blue-500/20">
                    {row[3] || '-'}
                  </TableCell>
                  <TableCell className="text-center text-green-300 font-mono bg-blue-900/10">
                    {row[4] || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 glass-effect rounded-xl border border-blue-500/20">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">📝 Explication</h3>
          <p className="text-sm text-blue-200/80">
            Ce tableau présente les contraintes du problème, leurs équations de droites correspondantes, 
            et les points d'intersection calculés pour déterminer la région réalisable.
          </p>
        </div>
      </Card>
    )
  }

  // Format standard pour les autres méthodes
  return (
    <Card className="modern-card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"></div>
        <h2 className="text-2xl font-bold gradient-text">
          {method === 'simplex' ? 'Algorithme du Simplexe - Itérations Complètes' : 
           method === 'general' ? 'Résultats Forme Générale' : 'Tableau des Résultats'}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-center whitespace-nowrap text-blue-300 font-semibold text-xs px-2">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={`hover:bg-blue-500/10 ${
                row[0] && (row[0].includes('Tableau') || row[0].includes('Itération')) 
                  ? 'bg-blue-600/20 font-bold' 
                  : row[1] === 'Ci' || row[1] === 'Cj' || row[1] === 'Δj'
                    ? 'bg-blue-500/10'
                    : ''
              }`}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className={`text-center font-mono text-xs px-2 ${
                    row[0] && (row[0].includes('Tableau') || row[0].includes('Itération'))
                      ? 'text-blue-300 font-bold'
                      : row[1] === 'Δj' && parseFloat(cell) > 0
                        ? 'text-red-400 font-bold'
                        : row[1] === 'Δj' && cell.includes('Z =')
                          ? 'text-green-400 font-bold'
                          : 'text-white'
                  }`}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {method === 'simplex' && (
        <div className="mt-6 p-4 glass-effect rounded-xl border border-blue-500/20">
          <h3 className="text-lg font-semibold mb-3 text-blue-300">📋 Explication de l'Algorithme</h3>
          <div className="space-y-2 text-sm text-blue-200/80">
            <p><strong>F1:</strong> Nouvelle valeur de la ligne i : x<sub>ir</sub> = x<sub>ir</sub>/a<sub>ij</sub></p>
            <p><strong>F2:</strong> Nouvelles valeurs des autres lignes : x<sub>kr</sub> = x<sub>kr</sub> - x<sub>kj</sub>(x<sub>i</sub>/a<sub>ij</sub>)</p>
            <p><strong>F3:</strong> Nouvelle valeur de la fonction économique : Z = Z + (x<sub>i</sub>/a<sub>ij</sub>) Δ<sub>j</sub></p>
            <p><strong>Test d'optimalité:</strong> Tous les Δ<sub>j</sub> ≤ 0 pour la maximisation</p>
          </div>
        </div>
      )}
    </Card>
  )
}