import { useState } from 'react'
import {
  CubicRouthHurwitzStabilityCalculationError,
  calculateCubicRouthHurwitzStability,
} from './engine'
import type { CubicRouthHurwitzStabilityResult } from './types'
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
  coefficient2: '6',
  coefficient1: '11',
  coefficient0: '6',
}

export function CubicRouthHurwitzStabilityCalculator() {
  const [coefficient3, setCoefficient3] = useState(example.coefficient3)
  const [coefficient2, setCoefficient2] = useState(example.coefficient2)
  const [coefficient1, setCoefficient1] = useState(example.coefficient1)
  const [coefficient0, setCoefficient0] = useState(example.coefficient0)

  const [result, setResult] =
    useState<CubicRouthHurwitzStabilityResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCubicRouthHurwitzStability({
            coefficient3: Number(coefficient3),
            coefficient2: Number(coefficient2),
            coefficient1: Number(coefficient1),
            coefficient0: Number(coefficient0),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CubicRouthHurwitzStabilityCalculationError
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
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setCoefficient3('')
    setCoefficient2('')
    setCoefficient1('')
    setCoefficient0('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–06"
        icon="RH"
        title="Cubic Routh–Hurwitz Stability"
        subtitle="Classify a cubic characteristic polynomial from its Routh first column"
      />

      <ReferenceBasis>
        a₂a₁ &gt; a₃a₀ with positive normalized first-column terms
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Cubic Coefficient"
          symbol="a₃"
          value={coefficient3}
          unit="—"
          onChange={setCoefficient3}
        />
        <NumericInput
          label="Quadratic Coefficient"
          symbol="a₂"
          value={coefficient2}
          unit="—"
          onChange={setCoefficient2}
        />
        <NumericInput
          label="Linear Coefficient"
          symbol="a₁"
          value={coefficient1}
          unit="—"
          onChange={setCoefficient1}
        />
        <NumericInput
          label="Constant Coefficient"
          symbol="a₀"
          value={coefficient0}
          unit="—"
          onChange={setCoefficient0}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Build Routh first column"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Stability classification"
          headlineValue={result.stabilityClassification}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Third-Row First Element"
            value={formatEngineeringNumber(result.thirdRowFirstElement)}
            unit="—"
          />
          <ResultItem
            label="Stability Determinant"
            value={formatEngineeringNumber(result.stabilityDeterminant)}
            unit="—"
          />
          <ResultItem
            label="Minimum First-Column Value"
            value={formatEngineeringNumber(result.minimumFirstColumnValue)}
            unit="—"
          />
          <ResultItem
            label="Right-Half-Plane Root Count"
            value={String(result.rightHalfPlaneRootCount)}
            unit="roots"
          />
          <ResultItem
            label="Normalized Coefficients"
            value={`${formatEngineeringNumber(result.normalizedCoefficient3)}, ${formatEngineeringNumber(result.normalizedCoefficient2)}, ${formatEngineeringNumber(result.normalizedCoefficient1)}, ${formatEngineeringNumber(result.normalizedCoefficient0)}`}
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
