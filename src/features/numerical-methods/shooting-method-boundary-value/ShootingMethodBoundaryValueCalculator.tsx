import { useState } from 'react'
import {
  ShootingMethodBoundaryValueCalculationError,
  calculateShootingMethodBoundaryValue,
} from './engine'
import type { ShootingMethodBoundaryValueResult } from './types'
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
  domainLength: '1',
  frequencySquared: '1',
  leftBoundaryValue: '0',
  rightBoundaryValue: '1',
  initialSlopeGuess1: '0.5',
  initialSlopeGuess2: '2',
  integrationSteps: '200',
  boundaryTolerance: '0.0000000001',
  maximumIterations: '50',
}

export function ShootingMethodBoundaryValueCalculator() {
  const [domainLength, setDomainLength] = useState(example.domainLength)
  const [frequencySquared, setFrequencySquared] = useState(example.frequencySquared)
  const [leftBoundaryValue, setLeftBoundaryValue] = useState(example.leftBoundaryValue)
  const [rightBoundaryValue, setRightBoundaryValue] = useState(example.rightBoundaryValue)
  const [initialSlopeGuess1, setInitialSlopeGuess1] = useState(example.initialSlopeGuess1)
  const [initialSlopeGuess2, setInitialSlopeGuess2] = useState(example.initialSlopeGuess2)
  const [integrationSteps, setIntegrationSteps] = useState(example.integrationSteps)
  const [boundaryTolerance, setBoundaryTolerance] = useState(example.boundaryTolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<ShootingMethodBoundaryValueResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateShootingMethodBoundaryValue({
        domainLength: Number(domainLength),
        frequencySquared: Number(frequencySquared),
        leftBoundaryValue: Number(leftBoundaryValue),
        rightBoundaryValue: Number(rightBoundaryValue),
        initialSlopeGuess1: Number(initialSlopeGuess1),
        initialSlopeGuess2: Number(initialSlopeGuess2),
        integrationSteps: Number(integrationSteps),
        boundaryTolerance: Number(boundaryTolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ShootingMethodBoundaryValueCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDomainLength(example.domainLength)
    setFrequencySquared(example.frequencySquared)
    setLeftBoundaryValue(example.leftBoundaryValue)
    setRightBoundaryValue(example.rightBoundaryValue)
    setInitialSlopeGuess1(example.initialSlopeGuess1)
    setInitialSlopeGuess2(example.initialSlopeGuess2)
    setIntegrationSteps(example.integrationSteps)
    setBoundaryTolerance(example.boundaryTolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDomainLength('')
    setFrequencySquared('')
    setLeftBoundaryValue('')
    setRightBoundaryValue('')
    setInitialSlopeGuess1('')
    setInitialSlopeGuess2('')
    setIntegrationSteps('')
    setBoundaryTolerance('')
    setMaximumIterations('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–39"
        icon="↗"
        title="Shooting Method Boundary Value"
        subtitle="Boundary-value solution by slope iteration and RK4 integration"
      />

      <ReferenceBasis>
        y″ + ω²y = 0 with y(0) and y(L) specified
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Domain Length" symbol="L" value={domainLength} unit="x" onChange={setDomainLength} />
        <NumericInput label="Frequency Squared" symbol="ω²" value={frequencySquared} unit="1/x²" onChange={setFrequencySquared} />
        <NumericInput label="Left Boundary Value" symbol="y(0)" value={leftBoundaryValue} unit="y" onChange={setLeftBoundaryValue} />
        <NumericInput label="Right Boundary Value" symbol="y(L)" value={rightBoundaryValue} unit="y" onChange={setRightBoundaryValue} />
        <NumericInput label="Initial Slope Guess 1" symbol="s₁" value={initialSlopeGuess1} unit="y/x" onChange={setInitialSlopeGuess1} />
        <NumericInput label="Initial Slope Guess 2" symbol="s₂" value={initialSlopeGuess2} unit="y/x" onChange={setInitialSlopeGuess2} />
        <NumericInput label="Integration Steps" symbol="N" value={integrationSteps} unit="steps" onChange={setIntegrationSteps} />
        <NumericInput label="Boundary Tolerance" symbol="tol" value={boundaryTolerance} unit="y" onChange={setBoundaryTolerance} />
        <NumericInput label="Maximum Secant Iterations" symbol="Nmax" value={maximumIterations} unit="iterations" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve boundary-value problem" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required initial slope"
          headlineValue={formatEngineeringNumber(result.initialSlope)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Achieved Right Boundary" value={formatEngineeringNumber(result.achievedRightBoundary)} unit="y" />
          <ResultItem label="Boundary Residual" value={formatEngineeringNumber(result.boundaryResidual)} unit="y" />
          <ResultItem label="Center Value" value={formatEngineeringNumber(result.centerValue)} unit="y" />
          <ResultItem label="Secant Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
