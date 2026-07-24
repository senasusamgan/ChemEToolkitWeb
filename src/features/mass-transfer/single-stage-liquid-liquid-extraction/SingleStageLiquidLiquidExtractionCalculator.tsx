import { useState } from 'react'
import {
  SingleStageLiquidLiquidExtractionCalculationError,
  calculateSingleStageLiquidLiquidExtraction,
} from './engine'
import type { SingleStageLiquidLiquidExtractionResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const example = {
  raffinateCarrierFlowRate: '100',
  solventCarrierFlowRate: '50',
  feedSoluteRatio: '0.2',
  enteringSolventSoluteRatio: '0',
  distributionCoefficient: '3',
}

export function SingleStageLiquidLiquidExtractionCalculator() {
  const [
    raffinateCarrierFlowRate,
    setRaffinateCarrierFlowRate,
  ] = useState(example.raffinateCarrierFlowRate)
  const [
    solventCarrierFlowRate,
    setSolventCarrierFlowRate,
  ] = useState(example.solventCarrierFlowRate)
  const [feedSoluteRatio, setFeedSoluteRatio] =
    useState(example.feedSoluteRatio)
  const [
    enteringSolventSoluteRatio,
    setEnteringSolventSoluteRatio,
  ] = useState(example.enteringSolventSoluteRatio)
  const [
    distributionCoefficient,
    setDistributionCoefficient,
  ] = useState(example.distributionCoefficient)

  const [result, setResult] =
    useState<SingleStageLiquidLiquidExtractionResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateSingleStageLiquidLiquidExtraction({
          raffinateCarrierFlowRate:
            Number(raffinateCarrierFlowRate),
          solventCarrierFlowRate:
            Number(solventCarrierFlowRate),
          feedSoluteRatio:
            Number(feedSoluteRatio),
          enteringSolventSoluteRatio:
            Number(enteringSolventSoluteRatio),
          distributionCoefficient:
            Number(distributionCoefficient),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          SingleStageLiquidLiquidExtractionCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setRaffinateCarrierFlowRate(
      example.raffinateCarrierFlowRate,
    )
    setSolventCarrierFlowRate(
      example.solventCarrierFlowRate,
    )
    setFeedSoluteRatio(example.feedSoluteRatio)
    setEnteringSolventSoluteRatio(
      example.enteringSolventSoluteRatio,
    )
    setDistributionCoefficient(
      example.distributionCoefficient,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setRaffinateCarrierFlowRate('')
    setSolventCarrierFlowRate('')
    setFeedSoluteRatio('')
    setEnteringSolventSoluteRatio('')
    setDistributionCoefficient('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–44"
        icon="⇄"
        title="Single-Stage Liquid–Liquid Extraction"
        subtitle="One equilibrium contact between immiscible carrier phases"
      />

      <ReferenceBasis>
        Solute balance with the linear equilibrium relation Y = DX
      </ReferenceBasis>

      <div className="native-formula">
        F XF + S YS = F XR + S YE · YE = D XR
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Raffinate Carrier Flow"
          symbol="F"
          value={raffinateCarrierFlowRate}
          unit="kg/h"
          onChange={setRaffinateCarrierFlowRate}
        />
        <NumericInput
          label="Solvent Carrier Flow"
          symbol="S"
          value={solventCarrierFlowRate}
          unit="kg/h"
          onChange={setSolventCarrierFlowRate}
        />
        <NumericInput
          label="Feed Solute Ratio"
          symbol="XF"
          value={feedSoluteRatio}
          unit="kg/kg"
          onChange={setFeedSoluteRatio}
        />
        <NumericInput
          label="Entering-Solvent Solute Ratio"
          symbol="YS"
          value={enteringSolventSoluteRatio}
          unit="kg/kg"
          onChange={setEnteringSolventSoluteRatio}
        />
        <NumericInput
          label="Distribution Coefficient"
          symbol="D"
          value={distributionCoefficient}
          unit="—"
          onChange={setDistributionCoefficient}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate extraction stage"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Raffinate removal"
          headlineValue={`${formatEngineeringNumber(
            100 * result.raffinateRemovalFraction,
          )}%`}
          modelName={result.modelName}
          note={result.directionDescription}
        >
          <ResultItem
            label="Raffinate Outlet Solute Ratio"
            value={formatEngineeringNumber(
              result.raffinateOutletSoluteRatio,
            )}
            unit="kg/kg"
          />
          <ResultItem
            label="Extract Outlet Solute Ratio"
            value={formatEngineeringNumber(
              result.extractOutletSoluteRatio,
            )}
            unit="kg/kg"
          />
          <ResultItem
            label="Extraction Factor"
            value={formatEngineeringNumber(
              result.extractionFactor,
            )}
            unit="—"
          />
          <ResultItem
            label="Signed Transfer Rate to Extract"
            value={formatEngineeringNumber(
              result.signedTransferRateToExtract,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Transfer-Rate Magnitude"
            value={formatEngineeringNumber(
              result.transferRateMagnitude,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Solute-Balance Residual"
            value={formatEngineeringNumber(
              result.soluteBalanceResidual,
            )}
            unit="kg/h"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
