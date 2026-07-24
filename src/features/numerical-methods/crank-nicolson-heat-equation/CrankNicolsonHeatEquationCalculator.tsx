import { useState } from 'react'
import {
  CrankNicolsonHeatEquationCalculationError,
  calculateCrankNicolsonHeatEquation,
} from './engine'
import type { CrankNicolsonHeatEquationResult } from './types'
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
  thermalDiffusivity: '0.00001',
  slabLength: '0.10',
  initialTemperature: '100',
  leftBoundaryTemperature: '20',
  rightBoundaryTemperature: '20',
  finalTime: '300',
  spatialNodes: '11',
  timeStep: '5',
}

export function CrankNicolsonHeatEquationCalculator() {
  const [thermalDiffusivity, setThermalDiffusivity] = useState(example.thermalDiffusivity)
  const [slabLength, setSlabLength] = useState(example.slabLength)
  const [initialTemperature, setInitialTemperature] = useState(example.initialTemperature)
  const [leftBoundaryTemperature, setLeftBoundaryTemperature] = useState(example.leftBoundaryTemperature)
  const [rightBoundaryTemperature, setRightBoundaryTemperature] = useState(example.rightBoundaryTemperature)
  const [finalTime, setFinalTime] = useState(example.finalTime)
  const [spatialNodes, setSpatialNodes] = useState(example.spatialNodes)
  const [timeStep, setTimeStep] = useState(example.timeStep)

  const [result, setResult] =
    useState<CrankNicolsonHeatEquationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateCrankNicolsonHeatEquation({
        thermalDiffusivity: Number(thermalDiffusivity),
        slabLength: Number(slabLength),
        initialTemperature: Number(initialTemperature),
        leftBoundaryTemperature: Number(leftBoundaryTemperature),
        rightBoundaryTemperature: Number(rightBoundaryTemperature),
        finalTime: Number(finalTime),
        spatialNodes: Number(spatialNodes),
        timeStep: Number(timeStep),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CrankNicolsonHeatEquationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setThermalDiffusivity(example.thermalDiffusivity)
    setSlabLength(example.slabLength)
    setInitialTemperature(example.initialTemperature)
    setLeftBoundaryTemperature(example.leftBoundaryTemperature)
    setRightBoundaryTemperature(example.rightBoundaryTemperature)
    setFinalTime(example.finalTime)
    setSpatialNodes(example.spatialNodes)
    setTimeStep(example.timeStep)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setThermalDiffusivity('')
    setSlabLength('')
    setInitialTemperature('')
    setLeftBoundaryTemperature('')
    setRightBoundaryTemperature('')
    setFinalTime('')
    setSpatialNodes('')
    setTimeStep('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–17"
        icon="≋"
        title="Crank–Nicolson Heat Equation"
        subtitle="Implicit transient conduction solution for a one-dimensional slab"
      />

      <ReferenceBasis>
        ∂T/∂t = α∂²T/∂x² with fixed endpoint temperatures
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Thermal Diffusivity" symbol="α" value={thermalDiffusivity} unit="m²/s" onChange={setThermalDiffusivity} />
        <NumericInput label="Slab Length" symbol="L" value={slabLength} unit="m" onChange={setSlabLength} />
        <NumericInput label="Initial Temperature" symbol="Ti" value={initialTemperature} unit="°C" onChange={setInitialTemperature} />
        <NumericInput label="Left Boundary Temperature" symbol="TL" value={leftBoundaryTemperature} unit="°C" onChange={setLeftBoundaryTemperature} />
        <NumericInput label="Right Boundary Temperature" symbol="TR" value={rightBoundaryTemperature} unit="°C" onChange={setRightBoundaryTemperature} />
        <NumericInput label="Final Time" symbol="tf" value={finalTime} unit="s" onChange={setFinalTime} />
        <NumericInput label="Spatial Nodes" symbol="N" value={spatialNodes} unit="nodes" onChange={setSpatialNodes} />
        <NumericInput label="Requested Time Step" symbol="Δt" value={timeStep} unit="s" onChange={setTimeStep} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve heat equation" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Center temperature"
          headlineValue={`${formatEngineeringNumber(result.centerTemperature)} °C`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Average Temperature" value={formatEngineeringNumber(result.averageTemperature)} unit="°C" />
          <ResultItem label="Minimum Temperature" value={formatEngineeringNumber(result.minimumTemperature)} unit="°C" />
          <ResultItem label="Maximum Temperature" value={formatEngineeringNumber(result.maximumTemperature)} unit="°C" />
          <ResultItem label="Fourier Number per Step" value={formatEngineeringNumber(result.fourierNumber)} unit="—" />
          <ResultItem label="Spatial Step" value={formatEngineeringNumber(result.spatialStep)} unit="m" />
          <ResultItem label="Effective Time Step" value={formatEngineeringNumber(result.effectiveTimeStep)} unit="s" />
          <ResultItem label="Time Steps" value={String(result.timeSteps)} unit="steps" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
