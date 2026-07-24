import { useState } from 'react'
import {
  IdealGasMembraneStageCutCalculationError,
  calculateIdealGasMembraneStageCut,
} from './engine'
import type { IdealGasMembraneStageCutResult } from './types'
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
  feedSoluteFraction: '0.30',
  permeateSoluteFraction: '0.75',
  retentateSoluteFraction: '0.10',
}

export function IdealGasMembraneStageCutCalculator() {
  const [feedSoluteFraction, setFeedSoluteFraction] =
    useState(example.feedSoluteFraction)
  const [
    permeateSoluteFraction,
    setPermeateSoluteFraction,
  ] = useState(example.permeateSoluteFraction)
  const [
    retentateSoluteFraction,
    setRetentateSoluteFraction,
  ] = useState(example.retentateSoluteFraction)

  const [result, setResult] =
    useState<IdealGasMembraneStageCutResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateIdealGasMembraneStageCut({
          feedSoluteFraction:
            Number(feedSoluteFraction),
          permeateSoluteFraction:
            Number(permeateSoluteFraction),
          retentateSoluteFraction:
            Number(retentateSoluteFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          IdealGasMembraneStageCutCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedSoluteFraction(example.feedSoluteFraction)
    setPermeateSoluteFraction(
      example.permeateSoluteFraction,
    )
    setRetentateSoluteFraction(
      example.retentateSoluteFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedSoluteFraction('')
    setPermeateSoluteFraction('')
    setRetentateSoluteFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–31"
        icon="◁"
        title="Ideal Gas-Membrane Stage Cut"
        subtitle="Stage cut and solute recovery from feed, permeate and retentate compositions"
      />

      <ReferenceBasis>
        Unit-feed total and solute balances
      </ReferenceBasis>

      <div className="native-formula">
        θ = (zF − xR)/(yP − xR)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Solute Fraction" symbol="zF" value={feedSoluteFraction} unit="fraction" onChange={setFeedSoluteFraction} />
        <NumericInput label="Permeate Solute Fraction" symbol="yP" value={permeateSoluteFraction} unit="fraction" onChange={setPermeateSoluteFraction} />
        <NumericInput label="Retentate Solute Fraction" symbol="xR" value={retentateSoluteFraction} unit="fraction" onChange={setRetentateSoluteFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate stage cut"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Stage cut"
          headlineValue={formatEngineeringNumber(result.stageCut)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Permeate Flow / Feed" value={formatEngineeringNumber(result.permeateFlowPerUnitFeed)} unit="—" />
          <ResultItem label="Retentate Flow / Feed" value={formatEngineeringNumber(result.retentateFlowPerUnitFeed)} unit="—" />
          <ResultItem label="Solute Recovery to Permeate" value={formatEngineeringNumber(100 * result.soluteRecoveryToPermeate)} unit="%" />
          <ResultItem label="Solute Retained in Retentate" value={formatEngineeringNumber(100 * result.soluteRejectionToRetentate)} unit="%" />
          <ResultItem label="Product Composition Selectivity" value={formatEngineeringNumber(result.productSelectivity)} unit="—" />
          <ResultItem label="Total-Balance Residual" value={formatEngineeringNumber(result.totalBalanceResidual)} unit="per feed" />
          <ResultItem label="Solute-Balance Residual" value={formatEngineeringNumber(result.soluteBalanceResidual)} unit="per feed" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
