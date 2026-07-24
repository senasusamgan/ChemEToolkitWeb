import { useState } from 'react'
import {
  MethodOfLinesPDESolverCalculationError,
  calculateMethodOfLinesPDESolver,
} from './engine'
import type { MethodOfLinesPDESolverResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const example = {
  diffusivity: '0.01',
  domainLength: '1',
  leftBoundary: '0',
  rightBoundary: '0',
  initialInteriorValue: '1',
  finalTime: '0.1',
  interiorNodes: '9',
  timeStep: '0.001',
}

export function MethodOfLinesPDESolverCalculator() {
  const [diffusivity, setDiffusivity] = useState(example.diffusivity)
  const [domainLength, setDomainLength] = useState(example.domainLength)
  const [leftBoundary, setLeftBoundary] = useState(example.leftBoundary)
  const [rightBoundary, setRightBoundary] = useState(example.rightBoundary)
  const [initialInteriorValue, setInitialInteriorValue] = useState(example.initialInteriorValue)
  const [finalTime, setFinalTime] = useState(example.finalTime)
  const [interiorNodes, setInteriorNodes] = useState(example.interiorNodes)
  const [timeStep, setTimeStep] = useState(example.timeStep)

  const [result, setResult] =
    useState<MethodOfLinesPDESolverResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateMethodOfLinesPDESolver({
        diffusivity: Number(diffusivity),
        domainLength: Number(domainLength),
        leftBoundary: Number(leftBoundary),
        rightBoundary: Number(rightBoundary),
        initialInteriorValue: Number(initialInteriorValue),
        finalTime: Number(finalTime),
        interiorNodes: Number(interiorNodes),
        timeStep: Number(timeStep),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof MethodOfLinesPDESolverCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDiffusivity(example.diffusivity)
    setDomainLength(example.domainLength)
    setLeftBoundary(example.leftBoundary)
    setRightBoundary(example.rightBoundary)
    setInitialInteriorValue(example.initialInteriorValue)
    setFinalTime(example.finalTime)
    setInteriorNodes(example.interiorNodes)
    setTimeStep(example.timeStep)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDiffusivity('')
    setDomainLength('')
    setLeftBoundary('')
    setRightBoundary('')
    setInitialInteriorValue('')
    setFinalTime('')
    setInteriorNodes('')
    setTimeStep('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–27"
        icon="∂"
        title="Method of Lines PDE Solver"
        subtitle="One-dimensional diffusion equation solved as an ODE system"
      />

      <ReferenceBasis>
        ∂u/∂t = D∂²u/∂x² with RK4 time integration
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Diffusivity" symbol="D" value={diffusivity} unit="length²/time" onChange={setDiffusivity} />
        <NumericInput label="Domain Length" symbol="L" value={domainLength} unit="length" onChange={setDomainLength} />
        <NumericInput label="Left Boundary" symbol="uL" value={leftBoundary} unit="field units" onChange={setLeftBoundary} />
        <NumericInput label="Right Boundary" symbol="uR" value={rightBoundary} unit="field units" onChange={setRightBoundary} />
        <NumericInput label="Initial Interior Value" symbol="ui" value={initialInteriorValue} unit="field units" onChange={setInitialInteriorValue} />
        <NumericInput label="Final Time" symbol="tf" value={finalTime} unit="time" onChange={setFinalTime} />
        <NumericInput label="Interior Nodes" symbol="N" value={interiorNodes} unit="nodes" onChange={setInteriorNodes} />
        <NumericInput label="Requested Time Step" symbol="Δt" value={timeStep} unit="time" onChange={setTimeStep} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve with method of lines" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Center value"
          headlineValue={formatEngineeringNumber(result.centerValue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Average Value" value={formatEngineeringNumber(result.averageValue)} unit="field units" />
          <ResultItem label="Minimum Value" value={formatEngineeringNumber(result.minimumValue)} unit="field units" />
          <ResultItem label="Maximum Value" value={formatEngineeringNumber(result.maximumValue)} unit="field units" />
          <ResultItem label="Spatial Step" value={formatEngineeringNumber(result.spatialStep)} unit="length" />
          <ResultItem label="Effective Time Step" value={formatEngineeringNumber(result.effectiveTimeStep)} unit="time" />
          <ResultItem label="Time Steps" value={String(result.timeSteps)} unit="steps" />
          <ResultItem label="Stability Number" value={formatEngineeringNumber(result.explicitStabilityNumber)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
