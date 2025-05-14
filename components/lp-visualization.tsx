"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

type LPVisualizationProps = {
  constraints: {
    coefficients: number[][]
    signs: string[]
    values: number[]
  }
  objectiveFunction: number[]
  problemType: 'max' | 'min'
  solution: {
    isValid: boolean
    coordinates: number[]
    value: number
  }
}

export function LPVisualization({ constraints, objectiveFunction, problemType, solution }: LPVisualizationProps) {
  const [plotData, setPlotData] = useState<any[]>([])
  const [plotLayout, setPlotLayout] = useState<any>({})

  useEffect(() => {
    if (constraints.coefficients.length === 0 || !objectiveFunction || objectiveFunction.length !== 2) {
      return
    }

    if (objectiveFunction.length > 2) {
      console.warn('Seule la visualisation 2D est supportée')
      return
    }

    const xRange = [0, 20]
    const yRange = [0, 20]
    
    const constraintLines = constraints.coefficients.map((coeffs, i) => {
      const a = coeffs[0]
      const b = coeffs[1]
      const c = constraints.values[i]
      
      let xEndpoints: number[] = []
      let yEndpoints: number[] = []
      
      if (b !== 0) {
        const y = c / b
        if (y >= 0 && y <= yRange[1]) {
          xEndpoints.push(0)
          yEndpoints.push(y)
        }
      }
      
      if (a !== 0) {
        const x = c / a
        if (x >= 0 && x <= xRange[1]) {
          xEndpoints.push(x)
          yEndpoints.push(0)
        }
      }
      
      if (b !== 0) {
        const y = (c - a * xRange[1]) / b
        if (y >= 0 && y <= yRange[1]) {
          xEndpoints.push(xRange[1])
          yEndpoints.push(y)
        }
      }
      
      if (a !== 0) {
        const x = (c - b * yRange[1]) / a
        if (x >= 0 && x <= xRange[1]) {
          xEndpoints.push(x)
          yEndpoints.push(yRange[1])
        }
      }
      
      const pairs = xEndpoints.map((x, i) => ({ x, y: yEndpoints[i] }))
      pairs.sort((a, b) => a.x - b.x)
      
      xEndpoints = pairs.map(p => p.x)
      yEndpoints = pairs.map(p => p.y)
      
      return {
        x: xEndpoints,
        y: yEndpoints,
        mode: 'lines',
        name: `${coeffs[0]}x₁ + ${coeffs[1]}x₂ ${constraints.signs[i]} ${constraints.values[i]}`,
        line: {
          color: ['#FF5733', '#33FF57', '#3357FF', '#FFBD33', '#33FFBD'][i % 5],
          width: 2
        }
      }
    })
    
    const xAxisLine = {
      x: [0, xRange[1]],
      y: [0, 0],
      mode: 'lines',
      name: 'x₂ = 0',
      line: { color: 'gray', width: 2 }
    }
    
    const yAxisLine = {
      x: [0, 0],
      y: [0, yRange[1]],
      mode: 'lines',
      name: 'x₁ = 0',
      line: { color: 'gray', width: 2 }
    }
    
    let solutionPoint = null
    if (solution.isValid && solution.coordinates.length === 2) {
      solutionPoint = {
        x: [solution.coordinates[0]],
        y: [solution.coordinates[1]],
        mode: 'markers+text',
        type: 'scatter',
        name: `Solution Optimale (${solution.coordinates[0].toFixed(2)}, ${solution.coordinates[1].toFixed(2)})`,
        text: [`(${solution.coordinates[0].toFixed(2)}, ${solution.coordinates[1].toFixed(2)})`],
        textposition: 'top right',
        marker: {
          size: 10,
          color: 'rgb(255, 0, 0)'
        }
      }
    }
    
    const objFuncSlope = -objectiveFunction[0] / objectiveFunction[1]
    const objFuncIntercept = solution.isValid ? solution.value / objectiveFunction[1] : 5
    
    const objFuncLine = {
      x: [0, xRange[1]],
      y: [objFuncIntercept, objFuncIntercept + objFuncSlope * xRange[1]],
      mode: 'lines',
      name: `Z = ${objectiveFunction[0]}x₁ + ${objectiveFunction[1]}x₂`,
      line: {
        color: 'rgb(0, 0, 0)',
        width: 2,
        dash: 'dash'
      }
    }
    
    const data = [...constraintLines, xAxisLine, yAxisLine]
    
    if (solutionPoint) {
      data.push(solutionPoint)
    }
    
    data.push(objFuncLine)
    
    const layout = {
      title: 'Visualisation Graphique de la Solution',
      xaxis: {
        title: 'x₁',
        range: [0, Math.min(20, Math.max(...constraintLines.flatMap(line => line.x)) * 1.2)]
      },
      yaxis: {
        title: 'x₂',
        range: [0, Math.min(20, Math.max(...constraintLines.flatMap(line => line.y)) * 1.2)]
      },
      autosize: true,
      legend: {
        x: 0,
        y: 1,
        traceorder: 'normal',
        font: {
          family: 'sans-serif',
          size: 10,
          color: '#000'
        },
        bgcolor: '#E2E2E2',
        bordercolor: '#FFFFFF',
        borderwidth: 2
      }
    }
    
    setPlotData(data)
    setPlotLayout(layout)
  }, [constraints, objectiveFunction, problemType, solution])

  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Solution Graphique</h2>
      <Separator className="my-4" />
      
      {objectiveFunction && objectiveFunction.length > 2 ? (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
          La visualisation graphique n'est disponible que pour les problèmes à 2 variables.
        </div>
      ) : (
        <div className="w-full h-[500px]">
          {plotData.length > 0 && (
            <Plot
              data={plotData}
              layout={plotLayout}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
              config={{ responsive: true }}
            />
          )}
        </div>
      )}
      
      {solution.isValid && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Résumé de la Solution</h3>
          <p>
            <strong>Valeur Optimale :</strong> Z = {solution.value.toFixed(2)}
          </p>
          <p>
            <strong>Point Optimal :</strong> (
            {solution.coordinates.map((coord, i) => (
              <span key={i}>
                x<sub>{i+1}</sub> = {coord.toFixed(2)}
                {i < solution.coordinates.length - 1 ? ', ' : ''}
              </span>
            ))}
            )
          </p>
        </div>
      )}
    </Card>
  )
}