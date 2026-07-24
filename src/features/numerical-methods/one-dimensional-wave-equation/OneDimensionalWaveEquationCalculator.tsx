import { useState } from 'react'
import {
  OneDimensionalWaveEquationCalculationError,
  calculateOneDimensionalWaveEquation,
} from './engine'
import type { OneDimensionalWaveEquationResult } from './types'
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
  waveSpeed: '2',
  domainLength: '1',
  initialAmplitude: '1',
  finalTime: '0.25',
  spatialNodes: '101',
  timeStep: '0.0025',
}

export function OneDimensionalWaveEquationCalculator() {
  const [waveSpeed, setWaveSpeed] = useState(example.waveSpeed)
  const [domainLength, setDomainLength] = useState(example.domainLength)
  const [initialAmplitude, setInitialAmplitude] = useState(example.initialAmplitude)
  const [finalTime, setFinalTime] = useState(example.finalTime)
  const [spatialNodes, setSpatialNodes] = useState(example.spatialNodes)
  const [timeStep, setTimeStep] = useState(example.timeStep)

  const [result, setResult] =
    useState<OneDimensionalWaveEquationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateOneDimensionalWaveEquation({
        waveSpeed: Number(waveSpeed),
        domainLength: Number(domainLength),
        initialAmplitude: Number(initialAmplitude),
        finalTime: Number(finalTime),
        spatialNodes: Number(spatialNodes),
        timeStep: Number(timeStep),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof OneDimensionalWaveEquationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setWaveSpeed(example.waveSpeed)
    setDomainLength(example.domainLength)
    setInitialAmplitude(example.initialAmplitude)
    setFinalTime(example.finalTime)
    setSpatialNodes(example.spatialNodes)
    setTimeStep(example.timeStep)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setWaveSpeed('')
    setDomainLength('')
    setInitialAmplitude('')
    setFinalTime('')
    setSpatialNodes('')
    setTimeStep('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–34"
        icon="∿"
        title="One-Dimensional Wave Equation"
        subtitle="Transient vibration of a fixed-end string"
      />

      <ReferenceBasis>
        ∂²u/∂t² = c²∂²u/∂x²
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Wave Speed" symbol="c" value={waveSpeed} unit="length/time" onChange={setWaveSpeed} />
        <NumericInput label="Domain Length" symbol="L" value={domainLength} unit="length" onChange={setDomainLength} />
        <NumericInput label="Initial Amplitude" symbol="A" value={initialAmplitude} unit="displacement" onChange={setInitialAmplitude} />
        <NumericInput label="Final Time" symbol="tf" value={finalTime} unit="time" onChange={setFinalTime} />
        <NumericInput label="Spatial Nodes" symbol="N" value={spatialNodes} unit="nodes" onChange={setSpatialNodes} />
        <NumericInput label="Requested Time Step" symbol="Δt" value={timeStep} unit="time" onChange={setTimeStep} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve wave equation" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Center displacement"
          headlineValue={formatEngineeringNumber(result.centerDisplacement)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Maximum Absolute Displacement" value={formatEngineeringNumber(result.maximumAbsoluteDisplacement)} unit="displacement" />
          <ResultItem label="RMS Displacement" value={formatEngineeringNumber(result.rootMeanSquareDisplacement)} unit="displacement" />
          <ResultItem label="Courant Number" value={formatEngineeringNumber(result.courantNumber)} unit="—" />
          <ResultItem label="Spatial Step" value={formatEngineeringNumber(result.spatialStep)} unit="length" />
          <ResultItem label="Effective Time Step" value={formatEngineeringNumber(result.effectiveTimeStep)} unit="time" />
          <ResultItem label="Time Steps" value={String(result.timeSteps)} unit="steps" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
