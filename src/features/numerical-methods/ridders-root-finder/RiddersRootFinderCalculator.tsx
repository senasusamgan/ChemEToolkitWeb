import { useState } from 'react'
import {
  RiddersRootFinderCalculationError,
  calculateRiddersRootFinder,
} from './engine'
import type { RiddersRootFinderResult } from './types'
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
  coefficient3: '1',
  coefficient2: '0',
  coefficient1: '-2',
  coefficient0: '-5',
  lowerBound: '2',
  upperBound: '3',
  tolerance: '0.0000000001',
  maximumIterations: '100',
}

export function RiddersRootFinderCalculator() {
  const [coefficient3, setCoefficient3] = useState(example.coefficient3)
  const [coefficient2, setCoefficient2] = useState(example.coefficient2)
  const [coefficient1, setCoefficient1] = useState(example.coefficient1)
  const [coefficient0, setCoefficient0] = useState(example.coefficient0)
  const [lowerBound, setLowerBound] = useState(example.lowerBound)
  const [upperBound, setUpperBound] = useState(example.upperBound)
  const [tolerance, setTolerance] = useState(example.tolerance)
  const [maximumIterations, setMaximumIterations] = useState(example.maximumIterations)

  const [result, setResult] =
    useState<RiddersRootFinderResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateRiddersRootFinder({
        coefficient3: Number(coefficient3),
        coefficient2: Number(coefficient2),
        coefficient1: Number(coefficient1),
        coefficient0: Number(coefficient0),
        lowerBound: Number(lowerBound),
        upperBound: Number(upperBound),
        tolerance: Number(tolerance),
        maximumIterations: Number(maximumIterations),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof RiddersRootFinderCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setCoefficient3(example.coefficient3)
    setCoefficient2(example.coefficient2)
    setCoefficient1(example.coefficient1)
    setCoefficient0(example.coefficient0)
    setLowerBound(example.lowerBound)
    setUpperBound(example.upperBound)
    setTolerance(example.tolerance)
    setMaximumIterations(example.maximumIterations)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setCoefficient3('')
    setCoefficient2('')
    setCoefficient1('')
    setCoefficient0('')
    setLowerBound('')
    setUpperBound('')
    setTolerance('')
    setMaximumIterations('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–38"
        icon="√"
        title="Ridders Root Finder"
        subtitle="Rapid bracketing solution of a cubic-polynomial root"
      />

      <ReferenceBasis>
        Ridders exponential interpolation inside a sign-changing bracket
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Cubic Coefficient" symbol="c₃" value={coefficient3} unit="—" onChange={setCoefficient3} />
        <NumericInput label="Quadratic Coefficient" symbol="c₂" value={coefficient2} unit="—" onChange={setCoefficient2} />
        <NumericInput label="Linear Coefficient" symbol="c₁" value={coefficient1} unit="—" onChange={setCoefficient1} />
        <NumericInput label="Constant Coefficient" symbol="c₀" value={coefficient0} unit="—" onChange={setCoefficient0} />
        <NumericInput label="Lower Bracket" symbol="xL" value={lowerBound} unit="x" onChange={setLowerBound} />
        <NumericInput label="Upper Bracket" symbol="xU" value={upperBound} unit="x" onChange={setUpperBound} />
        <NumericInput label="Root Tolerance" symbol="tol" value={tolerance} unit="—" onChange={setTolerance} />
        <NumericInput label="Maximum Iterations" symbol="Nmax" value={maximumIterations} unit="—" onChange={setMaximumIterations} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Find root" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Root"
          headlineValue={formatEngineeringNumber(result.root)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Function at Root" value={formatEngineeringNumber(result.functionAtRoot)} unit="—" />
          <ResultItem label="Iterations" value={String(result.iterations)} unit="iterations" />
          <ResultItem label="Converged" value={result.converged ? 'Yes' : 'No'} unit="" />
          <ResultItem label="Final Bracket Width" value={formatEngineeringNumber(result.finalBracketWidth)} unit="x" />
          <ResultItem label="Initial f(xL)" value={formatEngineeringNumber(result.initialFunctionLower)} unit="—" />
          <ResultItem label="Initial f(xU)" value={formatEngineeringNumber(result.initialFunctionUpper)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
