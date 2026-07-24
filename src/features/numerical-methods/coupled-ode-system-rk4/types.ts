export interface CoupledODESystemRK4Input {
  initialX: number
  finalX: number
  initialY1: number
  initialY2: number
  a11: number
  a12: number
  a21: number
  a22: number
  b1: number
  b2: number
  stepSize: number
}

export interface CoupledODESystemRK4Result {
  finalY1: number
  finalY2: number
  stepCount: number
  finalX: number
  stateNorm: number
  modelName: string
  limitationDescription: string
}
