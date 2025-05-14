export type LPProblem = {
  problemType: 'max' | 'min'
  objectiveFunction: number[]
  constraintCoefficients: number[][]
  constraintSigns: string[]
  constraintValues: number[]
}

export type LPSolution = {
  isValid: boolean
  coordinates: number[]
  value: number
  tableData: {
    headers: string[]
    rows: string[][]
  }
}

function simplexMethod(
  objectiveFunction: number[],
  constraintCoefficients: number[][],
  constraintValues: number[],
  isMaximization: boolean
): LPSolution {
  // Convert minimization to maximization
  const objective = isMaximization 
    ? [...objectiveFunction]
    : objectiveFunction.map(x => -x);

  // Initialize tableau
  const m = constraintCoefficients.length; // number of constraints
  const n = objectiveFunction.length; // number of variables
  
  // Create initial tableau
  const tableau: number[][] = [];
  
  // Add objective function row
  tableau.push([
    ...objective.map(x => -x),
    ...Array(m).fill(0),
    0
  ]);
  
  // Add constraint rows
  for (let i = 0; i < m; i++) {
    const row = [
      ...constraintCoefficients[i],
      ...Array(m).fill(0),
      constraintValues[i]
    ];
    row[n + i] = 1; // Add slack variable
    tableau.push(row);
  }
  
  const basis = Array(m).fill(0).map((_, i) => n + i);
  const nonBasis = Array(n).fill(0).map((_, i) => i);
  
  // Iterate until optimal
  let iteration = 0;
  const maxIterations = 100;
  
  while (iteration < maxIterations) {
    // Find entering variable (most negative coefficient in objective row)
    const enteringCol = tableau[0].slice(0, -1).reduce(
      (iMin, x, i) => x < tableau[0][iMin] ? i : iMin,
      0
    );
    
    if (tableau[0][enteringCol] >= -1e-10) break; // Optimal solution found
    
    // Find leaving variable (minimum ratio test)
    let leavingRow = -1;
    let minRatio = Infinity;
    
    for (let i = 1; i < tableau.length; i++) {
      if (tableau[i][enteringCol] <= 0) continue;
      
      const ratio = tableau[i][tableau[i].length - 1] / tableau[i][enteringCol];
      if (ratio < minRatio) {
        minRatio = ratio;
        leavingRow = i;
      }
    }
    
    if (leavingRow === -1) {
      // Unbounded solution
      return {
        isValid: false,
        coordinates: [],
        value: 0,
        tableData: { headers: [], rows: [] }
      };
    }
    
    // Pivot
    const pivot = tableau[leavingRow][enteringCol];
    
    // Scale pivot row
    for (let j = 0; j < tableau[leavingRow].length; j++) {
      tableau[leavingRow][j] /= pivot;
    }
    
    // Eliminate column
    for (let i = 0; i < tableau.length; i++) {
      if (i === leavingRow) continue;
      
      const factor = tableau[i][enteringCol];
      for (let j = 0; j < tableau[i].length; j++) {
        tableau[i][j] -= factor * tableau[leavingRow][j];
      }
    }
    
    // Update basis
    const temp = basis[leavingRow - 1];
    basis[leavingRow - 1] = nonBasis[enteringCol];
    nonBasis[enteringCol] = temp;
    
    iteration++;
  }
  
  if (iteration >= maxIterations) {
    return {
      isValid: false,
      coordinates: [],
      value: 0,
      tableData: { headers: [], rows: [] }
    };
  }
  
  // Extract solution
  const solution = Array(n).fill(0);
  basis.forEach((basisVar, i) => {
    if (basisVar < n) {
      solution[basisVar] = tableau[i + 1][tableau[i + 1].length - 1];
    }
  });
  
  // Create table data for visualization
  const headers = ['Basic', 'Z'];
  for (let i = 0; i < n; i++) headers.push(`x${i + 1}`);
  for (let i = 0; i < m; i++) headers.push(`s${i + 1}`);
  headers.push('RHS');
  
  const rows = tableau.map((row, i) => {
    if (i === 0) {
      return ['Z', '1', ...row.map(x => x.toFixed(2))];
    }
    return [`s${i}`, '0', ...row.map(x => x.toFixed(2))];
  });
  
  return {
    isValid: true,
    coordinates: solution,
    value: isMaximization ? -tableau[0][tableau[0].length - 1] : tableau[0][tableau[0].length - 1],
    tableData: { headers, rows }
  };
}

export const solveLPProblem = (problem: LPProblem): LPSolution => {
  try {
    const { objectiveFunction, constraintCoefficients, constraintValues, problemType } = problem;
    
    return simplexMethod(
      objectiveFunction,
      constraintCoefficients,
      constraintValues,
      problemType === 'max'
    );
  } catch (error) {
    console.error('Error solving LP problem:', error);
    return {
      isValid: false,
      coordinates: [],
      value: 0,
      tableData: { headers: [], rows: [] }
    };
  }
};