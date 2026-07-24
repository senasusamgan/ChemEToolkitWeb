import { useState } from 'react'
import {
  FixedBedAdsorberBreakthroughCalculationError,
  calculateFixedBedAdsorberBreakthrough,
} from './engine'
import type { FixedBedAdsorberBreakthroughResult } from './types'
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
  adsorbentMass: '500',
  workingAdsorptionCapacity: '0.12',
  capacityUtilizationFraction: '0.75',
  feedVolumetricFlowRate: '10',
  inletSoluteConcentration: '0.05',
  breakthroughConcentrationFraction: '0.05',
}

export function FixedBedAdsorberBreakthroughCalculator() {
  const [adsorbentMass, setAdsorbentMass] =
    useState(example.adsorbentMass)
  const [
    workingAdsorptionCapacity,
    setWorkingAdsorptionCapacity,
  ] = useState(example.workingAdsorptionCapacity)
  const [
    capacityUtilizationFraction,
    setCapacityUtilizationFraction,
  ] = useState(example.capacityUtilizationFraction)
  const [
    feedVolumetricFlowRate,
    setFeedVolumetricFlowRate,
  ] = useState(example.feedVolumetricFlowRate)
  const [
    inletSoluteConcentration,
    setInletSoluteConcentration,
  ] = useState(example.inletSoluteConcentration)
  const [
    breakthroughConcentrationFraction,
    setBreakthroughConcentrationFraction,
  ] = useState(example.breakthroughConcentrationFraction)

  const [result, setResult] =
    useState<FixedBedAdsorberBreakthroughResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateFixedBedAdsorberBreakthrough({
          adsorbentMass:
            Number(adsorbentMass),
          workingAdsorptionCapacity:
            Number(workingAdsorptionCapacity),
          capacityUtilizationFraction:
            Number(capacityUtilizationFraction),
          feedVolumetricFlowRate:
            Number(feedVolumetricFlowRate),
          inletSoluteConcentration:
            Number(inletSoluteConcentration),
          breakthroughConcentrationFraction:
            Number(breakthroughConcentrationFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          FixedBedAdsorberBreakthroughCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setAdsorbentMass(example.adsorbentMass)
    setWorkingAdsorptionCapacity(
      example.workingAdsorptionCapacity,
    )
    setCapacityUtilizationFraction(
      example.capacityUtilizationFraction,
    )
    setFeedVolumetricFlowRate(
      example.feedVolumetricFlowRate,
    )
    setInletSoluteConcentration(
      example.inletSoluteConcentration,
    )
    setBreakthroughConcentrationFraction(
      example.breakthroughConcentrationFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setAdsorbentMass('')
    setWorkingAdsorptionCapacity('')
    setCapacityUtilizationFraction('')
    setFeedVolumetricFlowRate('')
    setInletSoluteConcentration('')
    setBreakthroughConcentrationFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–37"
        icon="▤"
        title="Fixed-Bed Adsorber Breakthrough"
        subtitle="Preliminary breakthrough time from usable bed capacity and solute loading"
      />

      <ReferenceBasis>
        Usable capacity divided by average removed-solute rate
      </ReferenceBasis>

      <div className="native-formula">
        tb = Mads qwork η / [Q C0(1 − Cb/C0)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Adsorbent Mass" symbol="Mads" value={adsorbentMass} unit="kg" onChange={setAdsorbentMass} />
        <NumericInput label="Working Adsorption Capacity" symbol="qwork" value={workingAdsorptionCapacity} unit="kg solute/kg adsorbent" onChange={setWorkingAdsorptionCapacity} />
        <NumericInput label="Capacity Utilization" symbol="η" value={capacityUtilizationFraction} unit="fraction" onChange={setCapacityUtilizationFraction} />
        <NumericInput label="Feed Volumetric Flow" symbol="Q" value={feedVolumetricFlowRate} unit="m³/h" onChange={setFeedVolumetricFlowRate} />
        <NumericInput label="Inlet Solute Concentration" symbol="C0" value={inletSoluteConcentration} unit="kg/m³" onChange={setInletSoluteConcentration} />
        <NumericInput label="Breakthrough Concentration Ratio" symbol="Cb/C0" value={breakthroughConcentrationFraction} unit="fraction" onChange={setBreakthroughConcentrationFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Estimate breakthrough time"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Breakthrough time"
          headlineValue={`${formatEngineeringNumber(
            result.breakthroughTime,
          )} h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Usable Solute Capacity" value={formatEngineeringNumber(result.usableSoluteCapacity)} unit="kg" />
          <ResultItem label="Inlet Solute Loading Rate" value={formatEngineeringNumber(result.inletSoluteLoadingRate)} unit="kg/h" />
          <ResultItem label="Average Removed-Solute Rate" value={formatEngineeringNumber(result.removedSoluteLoadingRate)} unit="kg/h" />
          <ResultItem label="Treated Volume at Breakthrough" value={formatEngineeringNumber(result.treatedVolumeAtBreakthrough)} unit="m³" />
          <ResultItem label="Treated Volume / Adsorbent Mass" value={formatEngineeringNumber(result.bedVolumesTreated)} unit="m³/kg" />
          <ResultItem label="Average Removal" value={formatEngineeringNumber(100 * result.averageRemovalFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
