import { useState } from 'react'
import {
  MonteCarloIntegrationCalculationError,
  calculateMonteCarloIntegration,
} from './engine'
import type { MonteCarloIntegrationResult } from './types'
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
  sampleCount: '100000',
  randomSeed: '12345',
}

export function MonteCarloIntegrationCalculator() {
  const [lowerBound, setLowerBound] = useState(example.lowerBound)
  const [upperBound, setUpperBound] = useState(example.upperBound)
  const [coefficient3, setCoefficient3] = useState(example.coefficient3)
  const [coefficient2, setCoefficient2] = useState(example.coefficient2)
  const [coefficient1, setCoefficient1] = useState(example.coefficient1)
  const [coefficient0, setCoefficient0] = useState(example.coefficient0)
  const [sampleCount, setSampleCount] = useState(example.sampleCount)
  const [randomSeed, setRandomSeed] = useState(example.randomSeed)

  const [result, setResult] =
    useState<MonteCarloIntegrationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateMonteCarloIntegration({
        lowerBound: Number(lowerBound),
        upperBound: Number(upperBound),
        coefficient3: Number(coefficient3),
        coefficient2: Number(coefficient2),
        coefficient1: Number(coefficient1),
        coefficient0: Number(coefficient0),
        sampleCount: Number(sampleCount),
        randomSeed: Number(randomSeed),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof MonteCarloIntegrationCalculationError
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
    setSampleCount(example.sampleCount)
    setRandomSeed(example.randomSeed)
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
    setSampleCount('')
    setRandomSeed('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–28"
        icon="∫"
        title="Monte Carlo Integration"
        subtitle="Seeded random-sampling estimate for a cubic polynomial integral"
      />

      <ReferenceBasis>
        I ≈ (b − a) mean[f(X)], X ~ Uniform(a,b)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Lower Bound" symbol="a" value={lowerBound} unit="x" onChange={setLowerBound} />
        <NumericInput label="Upper Bound" symbol="b" value={upperBound} unit="x" onChange={setUpperBound} />
        <NumericInput label="Cubic Coefficient" symbol="c₃" value={coefficient3} unit="—" onChange={setCoefficient3} />
        <NumericInput label="Quadratic Coefficient" symbol="c₂" value={coefficient2} unit="—" onChange={setCoefficient2} />
        <NumericInput label="Linear Coefficient" symbol="c₁" value={coefficient1} unit="—" onChange={setCoefficient1} />
        <NumericInput label="Constant Coefficient" symbol="c₀" value={coefficient0} unit="—" onChange={setCoefficient0} />
        <NumericInput label="Sample Count" symbol="N" value={sampleCount} unit="samples" onChange={setSampleCount} />
        <NumericInput label="Random Seed" symbol="seed" value={randomSeed} unit="integer" onChange={setRandomSeed} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Estimate integral" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Integral estimate"
          headlineValue={formatEngineeringNumber(result.integralEstimate)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Exact Integral" value={formatEngineeringNumber(result.exactIntegral)} unit="—" />
          <ResultItem label="Absolute Error" value={formatEngineeringNumber(result.absoluteError)} unit="—" />
          <ResultItem label="Standard Error" value={formatEngineeringNumber(result.standardError)} unit="—" />
          <ResultItem label="95% Confidence Lower" value={formatEngineeringNumber(result.confidenceLower95)} unit="—" />
          <ResultItem label="95% Confidence Upper" value={formatEngineeringNumber(result.confidenceUpper95)} unit="—" />
          <ResultItem label="Sample Mean" value={formatEngineeringNumber(result.sampleMean)} unit="—" />
          <ResultItem label="Sample Standard Deviation" value={formatEngineeringNumber(result.sampleStandardDeviation)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
