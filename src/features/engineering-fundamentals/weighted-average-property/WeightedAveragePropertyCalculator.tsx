import { useState } from 'react'
import {
  WeightedAveragePropertyCalculationError,
  calculateWeightedAverageProperty,
} from './engine'
import type { WeightedAveragePropertyResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const EXAMPLE = {
  firstValue: '10',
  firstWeight: '1',
  secondValue: '20',
  secondWeight: '2',
  thirdValue: '40',
  thirdWeight: '1',
}

export function WeightedAveragePropertyCalculator() {
  const [firstValue, setFirstValue] =
    useState(EXAMPLE.firstValue)
  const [firstWeight, setFirstWeight] =
    useState(EXAMPLE.firstWeight)
  const [secondValue, setSecondValue] =
    useState(EXAMPLE.secondValue)
  const [secondWeight, setSecondWeight] =
    useState(EXAMPLE.secondWeight)
  const [thirdValue, setThirdValue] =
    useState(EXAMPLE.thirdValue)
  const [thirdWeight, setThirdWeight] =
    useState(EXAMPLE.thirdWeight)

  const [result, setResult] =
    useState<WeightedAveragePropertyResult | null>(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  function calculate() {
    try {
      setResult(
        calculateWeightedAverageProperty({
          items: [
            {
              value: Number(firstValue),
              weight: Number(firstWeight),
            },
            {
              value: Number(secondValue),
              weight: Number(secondWeight),
            },
            {
              value: Number(thirdValue),
              weight: Number(thirdWeight),
            },
          ],
        }),
      )

      setErrorMessage('')
    } catch (error) {
      setResult(null)

      setErrorMessage(
        error instanceof WeightedAveragePropertyCalculationError
          ? error.message
          : 'The weighted average could not be completed.',
      )
    }
  }

  function loadExample() {
    setFirstValue(EXAMPLE.firstValue)
    setFirstWeight(EXAMPLE.firstWeight)
    setSecondValue(EXAMPLE.secondValue)
    setSecondWeight(EXAMPLE.secondWeight)
    setThirdValue(EXAMPLE.thirdValue)
    setThirdWeight(EXAMPLE.thirdWeight)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFirstValue('')
    setFirstWeight('')
    setSecondValue('')
    setSecondWeight('')
    setThirdValue('')
    setThirdWeight('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="EF–18"
        icon="Σ"
        title="Weighted Average Property"
        subtitle="Combine property values using normalized weights"
      />

      <ReferenceBasis>
        Weighted arithmetic mean with automatic weight normalization
      </ReferenceBasis>

      <div className="native-formula">
        p̄ = Σ(wᵢpᵢ) / Σwᵢ
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Property value 1"
          symbol="p₁"
          value={firstValue}
          unit="—"
          onChange={setFirstValue}
        />
        <NumericInput
          label="Weight 1"
          symbol="w₁"
          value={firstWeight}
          unit="—"
          onChange={setFirstWeight}
        />
        <NumericInput
          label="Property value 2"
          symbol="p₂"
          value={secondValue}
          unit="—"
          onChange={setSecondValue}
        />
        <NumericInput
          label="Weight 2"
          symbol="w₂"
          value={secondWeight}
          unit="—"
          onChange={setSecondWeight}
        />
        <NumericInput
          label="Property value 3"
          symbol="p₃"
          value={thirdValue}
          unit="—"
          onChange={setThirdValue}
        />
        <NumericInput
          label="Weight 3"
          symbol="w₃"
          value={thirdWeight}
          unit="—"
          onChange={setThirdWeight}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate average"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Weighted average"
          headlineValue={formatEngineeringNumber(
            result.weightedAverage,
          )}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Total supplied weight"
            value={formatEngineeringNumber(
              result.totalWeight,
            )}
            unit="—"
          />
          <ResultItem
            label="Weighted sum"
            value={formatEngineeringNumber(
              result.weightedSum,
            )}
            unit="—"
          />
          <ResultItem
            label="Normalized weight 1"
            value={formatEngineeringNumber(
              100 * result.normalizedWeights[0],
            )}
            unit="%"
          />
          <ResultItem
            label="Normalized weight 2"
            value={formatEngineeringNumber(
              100 * result.normalizedWeights[1],
            )}
            unit="%"
          />
          <ResultItem
            label="Normalized weight 3"
            value={formatEngineeringNumber(
              100 * result.normalizedWeights[2],
            )}
            unit="%"
          />
          <ResultItem
            label="Active value range"
            value={`${formatEngineeringNumber(
              result.minimumActiveValue,
            )} – ${formatEngineeringNumber(
              result.maximumActiveValue,
            )}`}
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
