import { useState } from 'react'
import {
  BinaryDistillationBalanceCalculationError,
  calculateBinaryDistillationBalance,
} from './engine'
import type { BinaryDistillationBalanceResult } from './types'
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
  feedFlowRate: '100',
  feedLightKeyFraction: '0.45',
  distillateLightKeyFraction: '0.95',
  bottomsLightKeyFraction: '0.05',
}

export function BinaryDistillationBalanceCalculator() {
  const [feedFlowRate, setFeedFlowRate] =
    useState(example.feedFlowRate)
  const [feedLightKeyFraction, setFeedLightKeyFraction] =
    useState(example.feedLightKeyFraction)
  const [
    distillateLightKeyFraction,
    setDistillateLightKeyFraction,
  ] = useState(example.distillateLightKeyFraction)
  const [
    bottomsLightKeyFraction,
    setBottomsLightKeyFraction,
  ] = useState(example.bottomsLightKeyFraction)

  const [result, setResult] =
    useState<BinaryDistillationBalanceResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateBinaryDistillationBalance({
          feedFlowRate: Number(feedFlowRate),
          feedLightKeyFraction:
            Number(feedLightKeyFraction),
          distillateLightKeyFraction:
            Number(distillateLightKeyFraction),
          bottomsLightKeyFraction:
            Number(bottomsLightKeyFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          BinaryDistillationBalanceCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedFlowRate(example.feedFlowRate)
    setFeedLightKeyFraction(
      example.feedLightKeyFraction,
    )
    setDistillateLightKeyFraction(
      example.distillateLightKeyFraction,
    )
    setBottomsLightKeyFraction(
      example.bottomsLightKeyFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedFlowRate('')
    setFeedLightKeyFraction('')
    setDistillateLightKeyFraction('')
    setBottomsLightKeyFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–18"
        icon="⇅"
        title="Binary Distillation Balance"
        subtitle="Distillate and bottoms rates from specified binary product compositions"
      />

      <ReferenceBasis>
        Overall and light-key component balances
      </ReferenceBasis>

      <div className="native-formula">
        D = F(zF − xB)/(xD − xB) · B = F − D
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Flow Rate" symbol="F" value={feedFlowRate} unit="kmol/h" onChange={setFeedFlowRate} />
        <NumericInput label="Feed Light-Key Fraction" symbol="zF" value={feedLightKeyFraction} unit="fraction" onChange={setFeedLightKeyFraction} />
        <NumericInput label="Distillate Light-Key Fraction" symbol="xD" value={distillateLightKeyFraction} unit="fraction" onChange={setDistillateLightKeyFraction} />
        <NumericInput label="Bottoms Light-Key Fraction" symbol="xB" value={bottomsLightKeyFraction} unit="fraction" onChange={setBottomsLightKeyFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve distillation balance"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Distillate flow rate"
          headlineValue={`${formatEngineeringNumber(
            result.distillateFlowRate,
          )} kmol/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Bottoms Flow Rate" value={formatEngineeringNumber(result.bottomsFlowRate)} unit="kmol/h" />
          <ResultItem label="Distillate Fraction of Feed" value={formatEngineeringNumber(100 * result.distillateRecoveryFraction)} unit="%" />
          <ResultItem label="Bottoms Fraction of Feed" value={formatEngineeringNumber(100 * result.bottomsRecoveryFraction)} unit="%" />
          <ResultItem label="Light-Key Recovery to Distillate" value={formatEngineeringNumber(100 * result.lightKeyRecoveryToDistillate)} unit="%" />
          <ResultItem label="Heavy-Key Recovery to Bottoms" value={formatEngineeringNumber(100 * result.heavyKeyRecoveryToBottoms)} unit="%" />
          <ResultItem label="Total-Balance Residual" value={formatEngineeringNumber(result.totalBalanceResidual)} unit="kmol/h" />
          <ResultItem label="Light-Key Balance Residual" value={formatEngineeringNumber(result.lightKeyBalanceResidual)} unit="kmol/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
