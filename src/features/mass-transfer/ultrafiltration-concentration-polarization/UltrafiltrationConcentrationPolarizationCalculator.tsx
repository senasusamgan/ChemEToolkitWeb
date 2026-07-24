import { useState } from 'react'
import {
  UltrafiltrationConcentrationPolarizationCalculationError,
  calculateUltrafiltrationConcentrationPolarization,
} from './engine'
import type { UltrafiltrationConcentrationPolarizationResult } from './types'
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
  feedVolumetricFlowRate: '5',
  membraneArea: '20',
  liquidSideMassTransferCoefficient: '0.02',
  bulkSoluteConcentration: '10',
  gelConcentration: '100',
  observedSievingCoefficient: '0.02',
}

export function UltrafiltrationConcentrationPolarizationCalculator() {
  const [
    feedVolumetricFlowRate,
    setFeedVolumetricFlowRate,
  ] = useState(example.feedVolumetricFlowRate)
  const [membraneArea, setMembraneArea] =
    useState(example.membraneArea)
  const [
    liquidSideMassTransferCoefficient,
    setLiquidSideMassTransferCoefficient,
  ] = useState(
    example.liquidSideMassTransferCoefficient,
  )
  const [
    bulkSoluteConcentration,
    setBulkSoluteConcentration,
  ] = useState(example.bulkSoluteConcentration)
  const [
    gelConcentration,
    setGelConcentration,
  ] = useState(example.gelConcentration)
  const [
    observedSievingCoefficient,
    setObservedSievingCoefficient,
  ] = useState(example.observedSievingCoefficient)

  const [result, setResult] =
    useState<UltrafiltrationConcentrationPolarizationResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateUltrafiltrationConcentrationPolarization({
          feedVolumetricFlowRate:
            Number(feedVolumetricFlowRate),
          membraneArea:
            Number(membraneArea),
          liquidSideMassTransferCoefficient:
            Number(
              liquidSideMassTransferCoefficient,
            ),
          bulkSoluteConcentration:
            Number(bulkSoluteConcentration),
          gelConcentration:
            Number(gelConcentration),
          observedSievingCoefficient:
            Number(observedSievingCoefficient),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          UltrafiltrationConcentrationPolarizationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedVolumetricFlowRate(
      example.feedVolumetricFlowRate,
    )
    setMembraneArea(example.membraneArea)
    setLiquidSideMassTransferCoefficient(
      example.liquidSideMassTransferCoefficient,
    )
    setBulkSoluteConcentration(
      example.bulkSoluteConcentration,
    )
    setGelConcentration(
      example.gelConcentration,
    )
    setObservedSievingCoefficient(
      example.observedSievingCoefficient,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedVolumetricFlowRate('')
    setMembraneArea('')
    setLiquidSideMassTransferCoefficient('')
    setBulkSoluteConcentration('')
    setGelConcentration('')
    setObservedSievingCoefficient('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–45"
        icon="≋"
        title="Ultrafiltration Concentration Polarization"
        subtitle="Gel-polarization limiting flux, recovery and retentate concentration"
      />

      <ReferenceBasis>
        Low-recovery gel-polarization limiting-flux model
      </ReferenceBasis>

      <div className="native-formula">
        Jlim = k ln(Cg/Cb) · Qp = Jlim A
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Feed Volumetric Flow"
          symbol="Qf"
          value={feedVolumetricFlowRate}
          unit="m³/h"
          onChange={setFeedVolumetricFlowRate}
        />
        <NumericInput
          label="Membrane Area"
          symbol="A"
          value={membraneArea}
          unit="m²"
          onChange={setMembraneArea}
        />
        <NumericInput
          label="Liquid-Side Mass-Transfer Coefficient"
          symbol="k"
          value={liquidSideMassTransferCoefficient}
          unit="m/h"
          onChange={setLiquidSideMassTransferCoefficient}
        />
        <NumericInput
          label="Bulk Solute Concentration"
          symbol="Cb"
          value={bulkSoluteConcentration}
          unit="kg/m³"
          onChange={setBulkSoluteConcentration}
        />
        <NumericInput
          label="Gel Concentration"
          symbol="Cg"
          value={gelConcentration}
          unit="kg/m³"
          onChange={setGelConcentration}
        />
        <NumericInput
          label="Observed Sieving Coefficient"
          symbol="Sobs"
          value={observedSievingCoefficient}
          unit="—"
          onChange={setObservedSievingCoefficient}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate ultrafiltration"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Limiting flux"
          headlineValue={`${formatEngineeringNumber(
            result.limitingFluxLMH,
          )} LMH`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Polarization Modulus"
            value={formatEngineeringNumber(
              result.polarizationModulus,
            )}
            unit="—"
          />
          <ResultItem
            label="Permeate Flow Rate"
            value={formatEngineeringNumber(
              result.permeateFlowRate,
            )}
            unit="m³/h"
          />
          <ResultItem
            label="Retentate Flow Rate"
            value={formatEngineeringNumber(
              result.retentateFlowRate,
            )}
            unit="m³/h"
          />
          <ResultItem
            label="Volumetric Recovery"
            value={formatEngineeringNumber(
              100 * result.volumetricRecoveryFraction,
            )}
            unit="%"
          />
          <ResultItem
            label="Permeate Solute Concentration"
            value={formatEngineeringNumber(
              result.permeateSoluteConcentration,
            )}
            unit="kg/m³"
          />
          <ResultItem
            label="Retentate Solute Concentration"
            value={formatEngineeringNumber(
              result.retentateSoluteConcentration,
            )}
            unit="kg/m³"
          />
          <ResultItem
            label="Observed Rejection"
            value={formatEngineeringNumber(
              100 * result.observedRejection,
            )}
            unit="%"
          />
          <ResultItem
            label="Concentration Factor"
            value={formatEngineeringNumber(
              result.concentrationFactor,
            )}
            unit="—"
          />
          <ResultItem
            label="Retained Solute Rate"
            value={formatEngineeringNumber(
              result.retainedSoluteRate,
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
