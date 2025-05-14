"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, MinusCircle, ChevronRightCircle } from 'lucide-react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const formSchema = z.object({
  problemType: z.enum(['max', 'min']),
  objectiveFunction: z.array(z.number()),
  constraintCoefficients: z.array(z.array(z.number())),
  constraintSigns: z.array(z.enum(['<=', '=', '>='])),
  constraintValues: z.array(z.number()),
})

type LPFormProps = {
  onSolve: (data: z.infer<typeof formSchema>) => void
}

export function LPForm({ onSolve }: LPFormProps) {
  const [numVariables, setNumVariables] = useState(2)
  const [numConstraints, setNumConstraints] = useState(2)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemType: 'max',
      objectiveFunction: [3, 2],
      constraintCoefficients: [
        [2, 1],
        [1, 2],
      ],
      constraintSigns: ['<=', '<='],
      constraintValues: [10, 8],
    },
  })

  const addVariable = () => {
    if (numVariables < 5) {
      const newObjectiveFunction = [...form.getValues().objectiveFunction, 0]
      const newConstraintCoefficients = form.getValues().constraintCoefficients.map(row => [...row, 0])
      
      form.setValue('objectiveFunction', newObjectiveFunction)
      form.setValue('constraintCoefficients', newConstraintCoefficients)
      setNumVariables(numVariables + 1)
    }
  }

  const removeVariable = () => {
    if (numVariables > 2) {
      const newObjectiveFunction = [...form.getValues().objectiveFunction]
      newObjectiveFunction.pop()
      
      const newConstraintCoefficients = form.getValues().constraintCoefficients.map(row => {
        const newRow = [...row]
        newRow.pop()
        return newRow
      })
      
      form.setValue('objectiveFunction', newObjectiveFunction)
      form.setValue('constraintCoefficients', newConstraintCoefficients)
      setNumVariables(numVariables - 1)
    }
  }

  const addConstraint = () => {
    if (numConstraints < 5) {
      const newConstraint = Array(numVariables).fill(0)
      const newConstraintCoefficients = [...form.getValues().constraintCoefficients, newConstraint]
      const newConstraintSigns = [...form.getValues().constraintSigns, '<=']
      const newConstraintValues = [...form.getValues().constraintValues, 0]
      
      form.setValue('constraintCoefficients', newConstraintCoefficients)
      form.setValue('constraintSigns', newConstraintSigns)
      form.setValue('constraintValues', newConstraintValues)
      setNumConstraints(numConstraints + 1)
    }
  }

  const removeConstraint = () => {
    if (numConstraints > 2) {
      const newConstraintCoefficients = [...form.getValues().constraintCoefficients]
      newConstraintCoefficients.pop()
      
      const newConstraintSigns = [...form.getValues().constraintSigns]
      newConstraintSigns.pop()
      
      const newConstraintValues = [...form.getValues().constraintValues]
      newConstraintValues.pop()
      
      form.setValue('constraintCoefficients', newConstraintCoefficients)
      form.setValue('constraintSigns', newConstraintSigns)
      form.setValue('constraintValues', newConstraintValues)
      setNumConstraints(numConstraints - 1)
    }
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSolve(data)
  }

  return (
    <div className="p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Problème de Programmation Linéaire</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="problemType"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Type de Problème</FormLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="max" />
                    </FormControl>
                    <FormLabel className="font-normal">Maximiser</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="min" />
                    </FormControl>
                    <FormLabel className="font-normal">Minimiser</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fonction Objectif</h3>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={removeVariable}
                  disabled={numVariables <= 2}
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Variable
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addVariable}
                  disabled={numVariables >= 5}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Variable
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-lg">Z = </span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: numVariables }).map((_, index) => (
                  <div key={`obj-${index}`} className="flex items-center">
                    <Input
                      className="w-16 text-center"
                      type="number"
                      {...form.register(`objectiveFunction.${index}`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const val = parseFloat(e.target.value) || 0
                          const current = [...form.getValues().objectiveFunction]
                          current[index] = val
                          form.setValue('objectiveFunction', current)
                        }
                      })}
                    />
                    <span className="ml-1 mr-2">x<sub>{index + 1}</sub></span>
                    {index < numVariables - 1 && <span>+</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contraintes</h3>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={removeConstraint}
                  disabled={numConstraints <= 2}
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Contrainte
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addConstraint}
                  disabled={numConstraints >= 5}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Contrainte
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: numConstraints }).map((_, constraintIndex) => (
                <div key={`constraint-${constraintIndex}`} className="flex items-center flex-wrap gap-2">
                  {Array.from({ length: numVariables }).map((_, varIndex) => (
                    <div key={`constraint-${constraintIndex}-var-${varIndex}`} className="flex items-center">
                      <Input
                        className="w-16 text-center"
                        type="number"
                        {...form.register(`constraintCoefficients.${constraintIndex}.${varIndex}`, { 
                          valueAsNumber: true,
                          onChange: (e) => {
                            const val = parseFloat(e.target.value) || 0
                            const current = [...form.getValues().constraintCoefficients]
                            current[constraintIndex][varIndex] = val
                            form.setValue('constraintCoefficients', current)
                          }
                        })}
                      />
                      <span className="ml-1 mr-2">x<sub>{varIndex + 1}</sub></span>
                      {varIndex < numVariables - 1 && <span>+</span>}
                    </div>
                  ))}
                  
                  <select
                    className="w-16 h-10 rounded-md border border-input bg-background px-3"
                    {...form.register(`constraintSigns.${constraintIndex}`, {
                      onChange: (e) => {
                        const current = [...form.getValues().constraintSigns]
                        current[constraintIndex] = e.target.value as any
                        form.setValue('constraintSigns', current)
                      }
                    })}
                  >
                    <option value="<=">≤</option>
                    <option value="=">=</option>
                    <option value=">=">≥</option>
                  </select>
                  
                  <Input
                    className="w-16 text-center"
                    type="number"
                    {...form.register(`constraintValues.${constraintIndex}`, { 
                      valueAsNumber: true,
                      onChange: (e) => {
                        const val = parseFloat(e.target.value) || 0
                        const current = [...form.getValues().constraintValues]
                        current[constraintIndex] = val
                        form.setValue('constraintValues', current)
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <FormDescription>
              Entrez les détails de votre problème de programmation linéaire et cliquez sur Résoudre.
            </FormDescription>
            <Button type="submit" size="lg" className="gap-2">
              Résoudre <ChevronRightCircle className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}