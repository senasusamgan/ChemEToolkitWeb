import { useState } from 'react'
import {
  LaplaceEquationFiniteDifferenceCalculationError,
  calculateLaplaceEquationFiniteDifference,
} from './engine'
import type { LaplaceEquationFiniteDifferenceResult } from './types'
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
  topBoundary: '100',
  bottomBoundary: '0',
  leftBoundary: '0',
  rightBoundary: '0',
  interiorNodesPerSide: '9',
  tolerance: '0.000001',
  maximumIterations: '10000',
  relaxationFactor: '1.5',
}

export function LaplaceEquationFiniteDifferenceCalculator() {
  const [topBoundary, setTopBoundary] = useState(example.topBoundary)
  const [bottomBoundary, setBottomBoundary] = useState(example.bottomBoundary)
  const [leftBoundary, setLeftBoundary] = useState(example.leftBoundary)
  const [rightBoundary, setRightBoundary] = useState(example.rightBoundary)
  const [interiorNodesPerSide, setInteriorNodesPerSide] = useState(example.interiorNodesPerSide)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)
  const [relaxationFactor, setRelaxationFactor] = useState(example.relaxationFactor)

  const [result, setResult] =
    useState<LaplaceEquationFiniteDifferenceResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateLaplaceEquationFiniteDifference({
        topBoundary: Number(topBoundary),
        bottomBoundary: Number(bottomBoundary),
        leftBoundary: Number(leftBoundary),
        rightBoundary: Number(rightBoundary),
        interiorNodesPerSide: Number(interiorNodesPerSide),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
        relaxationFactor: Number(relaxationFactor),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof LaplaceEquationFiniteDifferenceCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setTopBoundary(example.topBoundary)
    setBottomBoundary(example.bottomBoundary)
    setLeftBoundary(example.leftBoundary)
    setRightBoundary(example.rightBoundary)
    setInteriorNodesPerSide(example.interiorNodesPerSide)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setRelaxationFactor(example.relaxationFactor)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setTopBoundary('')
    setBottomBoundary('')
    setLeftBoundary('')
    setRightBoundary('')
    setInteriorNodesPerSide('')
    setTolerance('')
    setMaximumIterations('')
    setRelaxationFactor('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–24"
        icon="▦"
        title="Laplace Equation Finite Difference"
        subtitle="Steady two-dimensional field solution on a square grid"
      />

      <ReferenceBasis>
        ∂²u/∂x² + ∂²u/∂y² = 0 with fixed edge values
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Top Boundary" symbol="uT" value={topBoundary} unit="field units" onChange={setTopBoundary} />
        <NumericInput label="Bottom Boundary" symbol="uB" value={bottomBoundary} unit="field units" onChange={setBottomBoundary} />
        <NumericInput label="Left Boundary" symbol="uL" value={leftBoundary} unit="field units" onChange={setLeftBoundary} />
        <NumericInput label="Right Boundary" symbol="uR" value={rightBoundary} unit="field units" onChange={setRightBoundary} />
        <NumericInput label="Interior Nodes per Side" symbol="N" value={interiorNodesPerSide} unit="nodes" onChange={setInteriorNodesPerSide} />
        <NumericInput label="Update Tolerance" symbol="tol" value={tolerance} unit="field units" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="iterations" onChange={setMaximumIterations} />
        <NumericInput label="Relaxation Factor" symbol="ω" value={relaxationFactor} unit="—" onChange={setRelaxationFactor} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve Laplace equation" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Center value"
          headlineValue={formatEngineeringNumber(result.centerValue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Average Interior Value" value={formatEngineeringNumber(result.averageInteriorValue)} unit="field units" />
          <ResultItem label="Minimum Grid Value" value={formatEngineeringNumber(result.minimumValue)} unit="field units" />
          <ResultItem label="Maximum Grid Value" value={formatEngineeringNumber(result.maximumValue)} unit="field units" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
          <ResultItem label="Maximum Final Update" value={formatEngineeringNumber(result.maximumUpdate)} unit="field units" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
