export interface RiddersRootFinderInput {
  coefficient3: number
  coefficient2: number
  coefficient1: number
  coefficient0: number
  lowerBound: number
  upperBound: number
  tolerance: number
  maximumIterations: number
}

export interface RiddersRootFinderResult {
  root: number
  functionAtRoot: number
  iterations: number
  converged: boolean
  finalBracketWidth: number
  initialFunctionLower: number
  initialFunctionUpper: number
  modelName: string
  limitationDescription: string
}
