import { useState } from 'react'
import {
  BatchSettlingAreaEstimateCalculationError,
  calculateBatchSettlingAreaEstimate,
} from './engine'
import type { BatchSettlingAreaEstimateResult } from './types'
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
  feedVolumetricFlowRate: '50',
  feedSolidsConcentration: '20',
  underflowSolidsConcentration: '100',
  zoneSettlingVelocity: '1.5',
  designFactor: '1.25',
}

export function BatchSettlingAreaEstimateCalculator() {
  const [feedVolumetricFlowRate, setFeedVolumetricFlowRate] =
    useState(example.feedVolumetricFlowRate)
  const [feedSolidsConcentration, setFeedSolidsConcentration] =
    useState(example.feedSolidsConcentration)
  const [
    underflowSolidsConcentration,
    setUnderflowSolidsConcentration,
  ] = useState(example.underflowSolidsConcentration)
  const [zoneSettlingVelocity, setZoneSettlingVelocity] =
    useState(example.zoneSettlingVelocity)
  const [designFactor, setDesignFactor] =
    useState(example.designFactor)

  const [result, setResult] =
    useState<BatchSettlingAreaEstimateResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateBatchSettlingAreaEstimate({
          feedVolumetricFlowRate:
            Number(feedVolumetricFlowRate),
          feedSolidsConcentration:
            Number(feedSolidsConcentration),
          underflowSolidsConcentration:
            Number(underflowSolidsConcentration),
          zoneSettlingVelocity:
            Number(zoneSettlingVelocity),
          designFactor:
            Number(designFactor),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          BatchSettlingAreaEstimateCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedVolumetricFlowRate(
      example.feedVolumetricFlowRate,
    )
    setFeedSolidsConcentration(
      example.feedSolidsConcentration,
    )
    setUnderflowSolidsConcentration(
      example.underflowSolidsConcentration,
    )
    setZoneSettlingVelocity(
      example.zoneSettlingVelocity,
    )
    setDesignFactor(example.designFactor)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedVolumetricFlowRate('')
    setFeedSolidsConcentration('')
    setUnderflowSolidsConcentration('')
    setZoneSettlingVelocity('')
    setDesignFactor('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–12"
        icon="▽"
        title="Batch Settling Area Estimate"
        subtitle="Preliminary thickener area from hydraulic and solids-flux constraints"
      />

      <ReferenceBasis>
        Zone-settling velocity with ideal underflow concentration balance
      </ReferenceBasis>

      <div className="native-formula">
        Aₕ = Q/vz · Aₛ = QCf/[vz(Cu − Cf)]
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Feed Volumetric Flow"
          symbol="Q"
          value={feedVolumetricFlowRate}
          unit="m³/h"
          onChange={setFeedVolumetricFlowRate}
        />
        <NumericInput
          label="Feed Solids Concentration"
          symbol="Cf"
          value={feedSolidsConcentration}
          unit="kg/m³"
          onChange={setFeedSolidsConcentration}
        />
        <NumericInput
          label="Underflow Solids Concentration"
          symbol="Cu"
          value={underflowSolidsConcentration}
          unit="kg/m³"
          onChange={setUnderflowSolidsConcentration}
        />
        <NumericInput
          label="Zone Settling Velocity"
          symbol="vz"
          value={zoneSettlingVelocity}
          unit="m/h"
          onChange={setZoneSettlingVelocity}
        />
        <NumericInput
          label="Design Factor"
          symbol="Fd"
          value={designFactor}
          unit="—"
          onChange={setDesignFactor}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate settling area"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Design settling area"
          headlineValue={`${formatEngineeringNumber(
            result.designArea,
          )} m²`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Hydraulic Area" value={formatEngineeringNumber(result.hydraulicArea)} unit="m²" />
          <ResultItem label="Solids-Flux Area" value={formatEngineeringNumber(result.solidsFluxArea)} unit="m²" />
          <ResultItem label="Equivalent Diameter" value={formatEngineeringNumber(result.designDiameter)} unit="m" />
          <ResultItem label="Feed Solids Rate" value={formatEngineeringNumber(result.feedSolidsRate)} unit="kg/h" />
          <ResultItem label="Thickening Ratio" value={formatEngineeringNumber(result.thickeningRatio)} unit="—" />
          <ResultItem label="Design Solids Flux" value={formatEngineeringNumber(result.solidsFluxCapacity)} unit="kg/(m²·h)" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
