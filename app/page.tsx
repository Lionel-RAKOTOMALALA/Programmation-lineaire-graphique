"use client"

import { useState } from 'react'
import { LPForm } from '@/components/lp-form'
import { ResultsTable } from '@/components/results-table'
import { LPVisualization } from '@/components/lp-visualization'
import { solveLPProblem, type LPProblem, type LPSolution } from '@/lib/lp-solver'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModeToggle } from '@/components/mode-toggle'
import { CalculatorIcon, LineChartIcon, TableIcon } from 'lucide-react'

export default function Home() {
  const [solution, setSolution] = useState<LPSolution | null>(null)
  const [problem, setProblem] = useState<LPProblem | null>(null)
  
  const handleSolve = (formData: LPProblem) => {
    setProblem(formData)
    const result = solveLPProblem(formData)
    setSolution(result)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <CalculatorIcon className="h-6 w-6 mr-2" />
            <span className="hidden font-bold sm:inline-block">
              Résolution de Programmation Linéaire
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-3">
            <LPForm onSolve={handleSolve} />
          </div>
          
          {solution && (
            <div className="md:col-span-3">
              <Tabs defaultValue="visualization" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visualization" className="flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2" /> Visualisation Graphique
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center">
                    <TableIcon className="h-4 w-4 mr-2" /> Méthode de Simplexe
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visualization" className="mt-4">
                  {problem && solution && (
                    <LPVisualization
                      constraints={{
                        coefficients: problem.constraintCoefficients,
                        signs: problem.constraintSigns,
                        values: problem.constraintValues
                      }}
                      objectiveFunction={problem.objectiveFunction}
                      problemType={problem.problemType}
                      solution={solution}
                    />
                  )}
                </TabsContent>
                <TabsContent value="table" className="mt-4">
                  {solution.tableData && (
                    <ResultsTable tableData={solution.tableData} />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {solution && !solution.isValid && (
            <div className="md:col-span-3">
              <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <CardContent className="pt-6">
                  <p className="text-red-600 dark:text-red-300">
                    Aucune solution valide n'a été trouvée pour ce problème. Veuillez vérifier vos contraintes et réessayer.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {solution && solution.isValid && (
            <div className="md:col-span-3">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Explication de la Résolution</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Formulation du Problème</h4>
                    <p>Fonction objectif : {problem?.problemType === 'max' ? 'Maximiser' : 'Minimiser'} Z = 
                      {problem?.objectiveFunction.map((coeff, idx) => 
                        ` ${coeff >= 0 ? '+' : ''} ${coeff}x${idx + 1}`
                      )}
                    </p>
                    <p>Sous les contraintes :</p>
                    <ul className="list-disc list-inside">
                      {problem?.constraintCoefficients.map((coeffs, idx) => (
                        <li key={idx}>
                          {coeffs.map((coeff, cIdx) => 
                            `${coeff >= 0 ? '+' : ''} ${coeff}x${cIdx + 1}`
                          )} {problem.constraintSigns[idx]} {problem.constraintValues[idx]}
                        </li>
                      ))}
                      <li>x₁, x₂ ≥ 0</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Méthode de Résolution</h4>
                    <p>La résolution utilise la méthode du simplexe qui suit ces étapes :</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Mise sous forme standard du problème</li>
                      <li>Construction du tableau initial du simplexe</li>
                      <li>Identification de la variable entrante (coefficient le plus négatif)</li>
                      <li>Identification de la variable sortante (test du ratio minimum)</li>
                      <li>Pivotage et mise à jour du tableau</li>
                      <li>Répétition jusqu'à l'optimalité</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Solution Optimale</h4>
                    <p>Point optimal : ({solution.coordinates.map(c => c.toFixed(2)).join(', ')})</p>
                    <p>Valeur optimale : Z = {solution.value.toFixed(2)}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">4. Interprétation</h4>
                    <p>Cette solution signifie que pour {problem?.problemType === 'max' ? 'maximiser' : 'minimiser'} la fonction objectif :</p>
                    <ul className="list-disc list-inside">
                      {solution.coordinates.map((coord, idx) => (
                        <li key={idx}>Il faut produire {coord.toFixed(2)} unités de x{idx + 1}</li>
                      ))}
                      <li>Ce qui donne une valeur optimale de {solution.value.toFixed(2)}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}