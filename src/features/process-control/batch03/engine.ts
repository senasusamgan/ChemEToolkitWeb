import type { Batch03CalculationResult } from './types.ts'

export type Batch03ErrorCode =
  | 'nonFiniteInput'
  | 'invalidParameter'
  | 'numericalFailure'

const messages: Record<Batch03ErrorCode, string> = {
  nonFiniteInput: 'All calculator inputs must be finite.',
  invalidParameter: 'One or more physical or numerical parameters are outside the supported range.',
  numericalFailure: 'The calculation produced a non-finite result.',
}

export class ProcessControlBatch03CalculationError extends Error {
  readonly code: Batch03ErrorCode

  constructor(code: Batch03ErrorCode, message?: string) {
    super(message ?? messages[code])
    this.name = 'ProcessControlBatch03CalculationError'
    this.code = code
  }
}

function finite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ProcessControlBatch03CalculationError('nonFiniteInput')
  }
}

function ensureFinite(values: Array<number | string>): void {
  const numbers = values.filter((value): value is number => typeof value === 'number')
  if (!numbers.every(Number.isFinite)) {
    throw new ProcessControlBatch03CalculationError('numericalFailure')
  }
}

export interface InverseLaplaceInput {
  constantOverS: number
  exponentialNumerator: number
  exponentialPole: number
  cosineNumerator: number
  sineNumerator: number
  angularFrequency: number
  evaluationTime: number
}

export function calculateInverseLaplaceTransform(
  input: InverseLaplaceInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  if (input.exponentialPole < 0 || input.angularFrequency <= 0 || input.evaluationTime < 0) {
    throw new ProcessControlBatch03CalculationError(
      'invalidParameter',
      'Pole parameter must be non-negative, angular frequency positive and evaluation time non-negative.',
    )
  }

  const constantContribution = input.constantOverS
  const exponentialContribution = input.exponentialNumerator * Math.exp(-input.exponentialPole * input.evaluationTime)
  const cosineContribution = input.cosineNumerator * Math.cos(input.angularFrequency * input.evaluationTime)
  const sineContribution = input.sineNumerator / input.angularFrequency * Math.sin(input.angularFrequency * input.evaluationTime)
  const totalValue = constantContribution + exponentialContribution + cosineContribution + sineContribution
  ensureFinite([constantContribution, exponentialContribution, cosineContribution, sineContribution, totalValue])

  return {
    headlineLabel: 'Time-domain value',
    headlineValue: totalValue,
    items: [
      { label: 'Constant Contribution', value: constantContribution, unit: '—' },
      { label: 'Exponential Contribution', value: exponentialContribution, unit: '—' },
      { label: 'Cosine Contribution', value: cosineContribution, unit: '—' },
      { label: 'Sine Contribution', value: sineContribution, unit: '—' },
      { label: 'Transform Form', value: 'A/s + B/(s+a) + Cs/(s²+ω²) + D/(s²+ω²)', unit: '' },
      { label: 'Time-Domain Form', value: 'A + B exp(−at) + C cos(ωt) + (D/ω) sin(ωt)', unit: '' },
    ],
    modelName: 'Term-by-term inverse Laplace transform for four common basis functions',
    limitationDescription: 'Repeated poles, delays and arbitrary rational functions require partial-fraction decomposition outside this compact helper.',
  }
}

export interface LaplaceInput {
  constantAmplitude: number
  rampSlope: number
  exponentialAmplitude: number
  exponentialDecayRate: number
  sineAmplitude: number
  cosineAmplitude: number
  angularFrequency: number
  evaluationS: number
}

export function calculateLaplaceTransform(
  input: LaplaceInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  if (input.exponentialDecayRate < 0 || input.angularFrequency <= 0 || input.evaluationS <= 0) {
    throw new ProcessControlBatch03CalculationError(
      'invalidParameter',
      'Decay rate must be non-negative, angular frequency positive and evaluation s greater than zero.',
    )
  }

  const s = input.evaluationS
  const constantTerm = input.constantAmplitude / s
  const rampTerm = input.rampSlope / s ** 2
  const exponentialTerm = input.exponentialAmplitude / (s + input.exponentialDecayRate)
  const sineTerm = input.sineAmplitude * input.angularFrequency / (s ** 2 + input.angularFrequency ** 2)
  const cosineTerm = input.cosineAmplitude * s / (s ** 2 + input.angularFrequency ** 2)
  const transformValue = constantTerm + rampTerm + exponentialTerm + sineTerm + cosineTerm
  ensureFinite([constantTerm, rampTerm, exponentialTerm, sineTerm, cosineTerm, transformValue])

  return {
    headlineLabel: 'Transform value F(s)',
    headlineValue: transformValue,
    items: [
      { label: 'Constant Term', value: constantTerm, unit: '—' },
      { label: 'Ramp Term', value: rampTerm, unit: '—' },
      { label: 'Exponential Term', value: exponentialTerm, unit: '—' },
      { label: 'Sine Term', value: sineTerm, unit: '—' },
      { label: 'Cosine Term', value: cosineTerm, unit: '—' },
      { label: 'Transform Form', value: 'A/s + B/s² + C/(s+a) + Dω/(s²+ω²) + Es/(s²+ω²)', unit: '' },
    ],
    modelName: 'Term-by-term Laplace transform for common process-control signals',
    limitationDescription: 'The result is evaluated on the positive real s-axis; arbitrary symbolic and complex-frequency expressions are not included.',
  }
}

export interface ValveSizingInput {
  liquidFlowRateGpm: number
  liquidSpecificGravity: number
  upstreamPressurePsi: number
  downstreamPressurePsi: number
  installedValveCv: number
  designMarginPercent: number
}

export function calculateLiquidControlValveSizing(
  input: ValveSizingInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  const pressureDrop = input.upstreamPressurePsi - input.downstreamPressurePsi
  if (
    input.liquidFlowRateGpm <= 0 ||
    input.liquidSpecificGravity <= 0 ||
    pressureDrop <= 0 ||
    input.installedValveCv <= 0 ||
    input.designMarginPercent < 0 ||
    input.designMarginPercent > 200
  ) {
    throw new ProcessControlBatch03CalculationError(
      'invalidParameter',
      'Flow, specific gravity, pressure drop and installed Cv must be positive; design margin must be from 0 through 200 percent.',
    )
  }

  const requiredCv = input.liquidFlowRateGpm * Math.sqrt(input.liquidSpecificGravity / pressureDrop)
  const designCv = requiredCv * (1 + input.designMarginPercent / 100)
  const installedToDesignRatio = input.installedValveCv / designCv
  const estimatedOpening = Math.min(100, requiredCv / input.installedValveCv * 100)
  const maximumFlow = input.installedValveCv * Math.sqrt(pressureDrop / input.liquidSpecificGravity)
  ensureFinite([pressureDrop, requiredCv, designCv, installedToDesignRatio, estimatedOpening, maximumFlow])

  return {
    headlineLabel: 'Required Cv',
    headlineValue: requiredCv,
    items: [
      { label: 'Available Pressure Drop', value: pressureDrop, unit: 'psi' },
      { label: 'Design Cv', value: designCv, unit: 'US Cv' },
      { label: 'Installed / Design Cv', value: installedToDesignRatio, unit: '—' },
      { label: 'Estimated Linear Opening', value: estimatedOpening, unit: '%' },
      { label: 'Maximum Flow at Installed Cv', value: maximumFlow, unit: 'US gpm' },
      { label: 'Valve Adequacy', value: installedToDesignRatio >= 1 ? 'Installed Cv meets the design target' : 'Installed Cv is below the design target', unit: '' },
    ],
    modelName: 'Incompressible liquid valve sizing using Q = Cv sqrt(ΔP/SG)',
    limitationDescription: 'Flashing, cavitation, viscosity correction, piping factors and manufacturer-specific coefficients are excluded.',
  }
}

export interface LiquidLevelInput {
  tankArea: number
  outletResistance: number
  inletFlowRate: number
  initialLevel: number
  evaluationTime: number
  maximumAllowableLevel: number
}

export function calculateLiquidLevelDynamics(
  input: LiquidLevelInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  if (
    input.tankArea <= 0 || input.outletResistance <= 0 || input.inletFlowRate < 0 ||
    input.initialLevel < 0 || input.evaluationTime < 0 || input.maximumAllowableLevel <= 0
  ) {
    throw new ProcessControlBatch03CalculationError('invalidParameter')
  }

  const timeConstant = input.tankArea * input.outletResistance
  const steadyStateLevel = input.inletFlowRate * input.outletResistance
  const exponentialFactor = Math.exp(-input.evaluationTime / timeConstant)
  const level = steadyStateLevel + (input.initialLevel - steadyStateLevel) * exponentialFactor
  const outletFlow = level / input.outletResistance
  const responseFraction = 1 - exponentialFactor
  const levelMargin = input.maximumAllowableLevel - level
  const overflowRisk = level > input.maximumAllowableLevel || steadyStateLevel > input.maximumAllowableLevel
  ensureFinite([timeConstant, steadyStateLevel, level, outletFlow, responseFraction, levelMargin])

  return {
    headlineLabel: 'Level at evaluation time',
    headlineValue: level,
    items: [
      { label: 'Time Constant', value: timeConstant, unit: 'time' },
      { label: 'Steady-State Level', value: steadyStateLevel, unit: 'level' },
      { label: 'Outlet Flow', value: outletFlow, unit: 'volume/time' },
      { label: 'Response Fraction', value: responseFraction, unit: '—' },
      { label: 'Level Margin', value: levelMargin, unit: 'level' },
      { label: 'Overflow Risk', value: overflowRisk ? 'Yes' : 'No', unit: '' },
    ],
    modelName: 'Linear single-tank level response with resistive outlet flow',
    limitationDescription: 'Constant area, linear outlet resistance, constant inlet flow and no valve saturation or nonlinear head-flow relation are assumed.',
  }
}

export interface MPCInput {
  processGain: number
  processTimeConstant: number
  sampleTime: number
  predictionHorizon: number
  controlPenalty: number
  currentOutput: number
  setpoint: number
  previousInput: number
  maximumMoveMagnitude: number
}

export function calculateModelPredictiveControl(
  input: MPCInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  if (
    Math.abs(input.processGain) < 1e-15 || input.processTimeConstant <= 0 || input.sampleTime <= 0 ||
    !Number.isInteger(input.predictionHorizon) || input.predictionHorizon < 1 || input.predictionHorizon > 200 ||
    input.controlPenalty < 0 || input.maximumMoveMagnitude <= 0
  ) {
    throw new ProcessControlBatch03CalculationError('invalidParameter')
  }

  const a = Math.exp(-input.sampleTime / input.processTimeConstant)
  let numerator = 0
  let denominator = input.controlPenalty
  const bases: number[] = []
  const gains: number[] = []

  for (let step = 1; step <= input.predictionHorizon; step += 1) {
    const polePower = a ** step
    const base = polePower * input.currentOutput + input.processGain * (1 - polePower) * input.previousInput
    const gain = input.processGain * (1 - polePower)
    numerator += gain * (input.setpoint - base)
    denominator += gain ** 2
    bases.push(base)
    gains.push(gain)
  }

  const unconstrainedMove = numerator / denominator
  const appliedMove = Math.min(input.maximumMoveMagnitude, Math.max(-input.maximumMoveMagnitude, unconstrainedMove))
  const recommendedInput = input.previousInput + appliedMove
  const predictedNext = bases[0] + gains[0] * appliedMove
  const last = input.predictionHorizon - 1
  const predictedTerminal = bases[last] + gains[last] * appliedMove
  const terminalError = input.setpoint - predictedTerminal
  let objective = input.controlPenalty * appliedMove ** 2
  for (let index = 0; index < bases.length; index += 1) {
    objective += (input.setpoint - (bases[index] + gains[index] * appliedMove)) ** 2
  }
  ensureFinite([a, unconstrainedMove, appliedMove, recommendedInput, predictedNext, predictedTerminal, terminalError, objective])

  return {
    headlineLabel: 'Recommended input',
    headlineValue: recommendedInput,
    items: [
      { label: 'Unconstrained Input Move', value: unconstrainedMove, unit: 'input' },
      { label: 'Applied Input Move', value: appliedMove, unit: 'input' },
      { label: 'Predicted Next Output', value: predictedNext, unit: 'output' },
      { label: 'Predicted Terminal Output', value: predictedTerminal, unit: 'output' },
      { label: 'Terminal Error', value: terminalError, unit: 'output' },
      { label: 'Move Limited', value: appliedMove !== unconstrainedMove ? 'Yes' : 'No', unit: '' },
      { label: 'Objective Value', value: objective, unit: '—' },
      { label: 'Discrete Pole', value: a, unit: '—' },
    ],
    modelName: 'Single-move predictive optimization for a discretized first-order process',
    limitationDescription: 'The optimizer assumes one constant future move, a perfect linear model and no output constraints.',
  }
}

export interface NonInteractingTankInput {
  firstTankArea: number
  firstTankResistance: number
  secondTankArea: number
  secondTankResistance: number
  inletFlowStep: number
  evaluationTime: number
  integrationSteps: number
}

interface TankState {
  h1: number
  h2: number
  cumulativeOutlet: number
}

function tankDerivative(state: TankState, input: NonInteractingTankInput): TankState {
  const q1 = state.h1 / input.firstTankResistance
  const q2 = state.h2 / input.secondTankResistance
  return {
    h1: (input.inletFlowStep - q1) / input.firstTankArea,
    h2: (q1 - q2) / input.secondTankArea,
    cumulativeOutlet: q2,
  }
}

function tankAdd(state: TankState, derivative: TankState, scale: number): TankState {
  return {
    h1: state.h1 + derivative.h1 * scale,
    h2: state.h2 + derivative.h2 * scale,
    cumulativeOutlet: state.cumulativeOutlet + derivative.cumulativeOutlet * scale,
  }
}

export function calculateNonInteractingTankSystem(
  input: NonInteractingTankInput,
): Batch03CalculationResult {
  finite(Object.values(input))
  if (
    input.firstTankArea <= 0 || input.firstTankResistance <= 0 || input.secondTankArea <= 0 ||
    input.secondTankResistance <= 0 || input.inletFlowStep < 0 || input.evaluationTime < 0 ||
    !Number.isInteger(input.integrationSteps) || input.integrationSteps < 10 || input.integrationSteps > 100000
  ) {
    throw new ProcessControlBatch03CalculationError('invalidParameter')
  }

  let state: TankState = { h1: 0, h2: 0, cumulativeOutlet: 0 }
  if (input.evaluationTime > 0) {
    const dt = input.evaluationTime / input.integrationSteps
    for (let index = 0; index < input.integrationSteps; index += 1) {
      const k1 = tankDerivative(state, input)
      const k2 = tankDerivative(tankAdd(state, k1, 0.5 * dt), input)
      const k3 = tankDerivative(tankAdd(state, k2, 0.5 * dt), input)
      const k4 = tankDerivative(tankAdd(state, k3, dt), input)
      state = {
        h1: state.h1 + dt * (k1.h1 + 2 * k2.h1 + 2 * k3.h1 + k4.h1) / 6,
        h2: state.h2 + dt * (k1.h2 + 2 * k2.h2 + 2 * k3.h2 + k4.h2) / 6,
        cumulativeOutlet: state.cumulativeOutlet + dt * (k1.cumulativeOutlet + 2 * k2.cumulativeOutlet + 2 * k3.cumulativeOutlet + k4.cumulativeOutlet) / 6,
      }
    }
  }

  const q1 = state.h1 / input.firstTankResistance
  const q2 = state.h2 / input.secondTankResistance
  const tau1 = input.firstTankArea * input.firstTankResistance
  const tau2 = input.secondTankArea * input.secondTankResistance
  const h1ss = input.inletFlowStep * input.firstTankResistance
  const h2ss = input.inletFlowStep * input.secondTankResistance
  const stored = input.firstTankArea * state.h1 + input.secondTankArea * state.h2
  const balanceResidual = input.inletFlowStep * input.evaluationTime - state.cumulativeOutlet - stored
  ensureFinite([state.h1, state.h2, q1, q2, tau1, tau2, h1ss, h2ss, stored, balanceResidual])

  return {
    headlineLabel: 'Second tank level',
    headlineValue: state.h2,
    items: [
      { label: 'First Tank Level', value: state.h1, unit: 'level' },
      { label: 'First Tank Outlet Flow', value: q1, unit: 'volume/time' },
      { label: 'Second Tank Outlet Flow', value: q2, unit: 'volume/time' },
      { label: 'First Time Constant', value: tau1, unit: 'time' },
      { label: 'Second Time Constant', value: tau2, unit: 'time' },
      { label: 'First Steady-State Level', value: h1ss, unit: 'level' },
      { label: 'Second Steady-State Level', value: h2ss, unit: 'level' },
      { label: 'Volume-Balance Residual', value: balanceResidual, unit: 'volume' },
    ],
    modelName: 'Two non-interacting linear tanks in series integrated with fourth-order Runge–Kutta',
    limitationDescription: 'The first outlet depends only on the first level and discharges freely into the second tank; constant areas and linear resistances are assumed.',
  }
}
