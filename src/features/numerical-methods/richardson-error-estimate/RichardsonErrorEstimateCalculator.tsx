import { useState } from 'react'
import {
  RichardsonErrorEstimateCalculationError,
  calculateRichardsonErrorEstimate,
} from './engine'
import type { RichardsonErrorEstimateResult } from './types'
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
  lowerBound: '0',
  upperBound: '2',
  coefficient3: '1',
  coefficient2: '0',
  coefficient1: '0',
  coefficient0: '0',
  coarseIntervals: '4',
  refinementRatio: '2',
  assumedOrder: '2',
}

export function RichardsonErrorEstimateCalculator() {
  const [lowerBound, setLowerBound] = useState(example.lowerBound)
  const [upperBound, setUpperBound] = useState(example.upperBound)
  const [coefficient3, setCoefficient3] = useState(example.coefficient3)
  const [coefficient2, setCoefficient2] = useState(example.coefficient2)
  const [coefficient1, setCoefficient1] = useState(example.coefficient1)
  const [coefficient0, setCoefficient0] = useState(example.coefficient0)
  const [coarseIntervals, setCoarseIntervals] = useState(example.coarseIntervals)
  const [refinementRatio, setRefinementRatio] = useState(example.refinementRatio)
  const [assumedOrder, setAssumedOrder] = useState(example.assumedOrder)

  const [result, setResult] =
    useState<RichardsonErrorEstimateResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateRichardsonErrorEstimate({
        lowerBound: Number(lowerBound),
        upperBound: Number(upperBound),
        coefficient3: Number(coefficient3),
        coefficient2: Number(coefficient2),
        coefficient1: Number(coefficient1),
        coefficient0: Number(coefficient0),
        coarseIntervals: Number(coarseIntervals),
        refinementRatio: Number(refinementRatio),
        assumedOrder: Number(assumedOrder),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof RichardsonErrorEstimateCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLowerBound(example.lowerBound)
    setUpperBound(example.upperBound)
    setCoefficient3(example.coefficient3)
    setCoefficient2(example.coefficient2)
    setCoefficient1(example.coefficient1)
    setCoefficient0(example.coefficient0)
    setCoarseIntervals(example.coarseIntervals)
    setRefinementRatio(example.refinementRatio)
    setAssumedOrder(example.assumedOrder)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLowerBound('')
    setUpperBound('')
    setCoefficient3('')
    setCoefficient2('')
    setCoefficient1('')
    setCoefficient0('')
    setCoarseIntervals('')
    setRefinementRatio('')
    setAssumedOrder('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–37"
        icon="R"
        title="Richardson Error Estimate"
        subtitle="Discretization-error estimate from coarse and refined trapezoidal solutions"
      />

      <ReferenceBasis>
        Eₕ/ᵣ ≈ (Iₕ/ᵣ − Iₕ) / (rᵖ − 1)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Lower Bound" symbol="a" value={lowerBound} unit="x" onChange={setLowerBound} />
        <NumericInput label="Upper Bound" symbol="b" value={upperBound} unit="x" onChange={setUpperBound} />
        <NumericInput label="Cubic Coefficient" symbol="c₃" value={coefficient3} unit="—" onChange={setCoefficient3} />
        <NumericInput label="Quadratic Coefficient" symbol="c₂" value={coefficient2} unit="—" onChange={setCoefficient2} />
        <NumericInput label="Linear Coefficient" symbol="c₁" value={coefficient1} unit="—" onChange={setCoefficient1} />
        <NumericInput label="Constant Coefficient" symbol="c₀" value={coefficient0} unit="—" onChange={setCoefficient0} />
        <NumericInput label="Coarse Intervals" symbol="N" value={coarseIntervals} unit="intervals" onChange={setCoarseIntervals} />
        <NumericInput label="Refinement Ratio" symbol="r" value={refinementRatio} unit="—" onChange={setRefinementRatio} />
        <NumericInput label="Assumed Order" symbol="p" value={assumedOrder} unit="—" onChange={setAssumedOrder} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Estimate discretization error" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Extrapolated integral"
          headlineValue={formatEngineeringNumber(result.extrapolatedEstimate)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Coarse Estimate" value={formatEngineeringNumber(result.coarseEstimate)} unit="—" />
          <ResultItem label="Fine Estimate" value={formatEngineeringNumber(result.fineEstimate)} unit="—" />
          <ResultItem label="Estimated Fine Error" value={formatEngineeringNumber(result.estimatedFineError)} unit="—" />
          <ResultItem label="Exact Integral" value={formatEngineeringNumber(result.exactIntegral)} unit="—" />
          <ResultItem label="Actual Fine Error" value={formatEngineeringNumber(result.actualFineError)} unit="—" />
          <ResultItem label="Effectivity Index" value={formatEngineeringNumber(result.effectivityIndex)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
