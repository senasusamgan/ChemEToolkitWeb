import { useState } from 'react'
import {
  DryerThermalDutyCalculationError,
  calculateDryerThermalDuty,
} from './engine'
import type { DryerThermalDutyResult } from './types'
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
  wetFeedMassFlowRate: '1000',
  initialMoistureDryBasis: '0.5',
  finalMoistureDryBasis: '0.05',
  inletTemperature: '25',
  outletTemperature: '80',
  drySolidHeatCapacity: '1.5',
  liquidWaterHeatCapacity: '4.18',
  latentHeatOfVaporization: '2300',
  heatLossFraction: '0.15',
}

export function DryerThermalDutyCalculator() {
  const [wetFeedMassFlowRate, setWetFeedMassFlowRate] =
    useState(example.wetFeedMassFlowRate)
  const [
    initialMoistureDryBasis,
    setInitialMoistureDryBasis,
  ] = useState(example.initialMoistureDryBasis)
  const [
    finalMoistureDryBasis,
    setFinalMoistureDryBasis,
  ] = useState(example.finalMoistureDryBasis)
  const [inletTemperature, setInletTemperature] =
    useState(example.inletTemperature)
  const [outletTemperature, setOutletTemperature] =
    useState(example.outletTemperature)
  const [
    drySolidHeatCapacity,
    setDrySolidHeatCapacity,
  ] = useState(example.drySolidHeatCapacity)
  const [
    liquidWaterHeatCapacity,
    setLiquidWaterHeatCapacity,
  ] = useState(example.liquidWaterHeatCapacity)
  const [
    latentHeatOfVaporization,
    setLatentHeatOfVaporization,
  ] = useState(example.latentHeatOfVaporization)
  const [heatLossFraction, setHeatLossFraction] =
    useState(example.heatLossFraction)

  const [result, setResult] =
    useState<DryerThermalDutyResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateDryerThermalDuty({
          wetFeedMassFlowRate:
            Number(wetFeedMassFlowRate),
          initialMoistureDryBasis:
            Number(initialMoistureDryBasis),
          finalMoistureDryBasis:
            Number(finalMoistureDryBasis),
          inletTemperature:
            Number(inletTemperature),
          outletTemperature:
            Number(outletTemperature),
          drySolidHeatCapacity:
            Number(drySolidHeatCapacity),
          liquidWaterHeatCapacity:
            Number(liquidWaterHeatCapacity),
          latentHeatOfVaporization:
            Number(latentHeatOfVaporization),
          heatLossFraction:
            Number(heatLossFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          DryerThermalDutyCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setWetFeedMassFlowRate(
      example.wetFeedMassFlowRate,
    )
    setInitialMoistureDryBasis(
      example.initialMoistureDryBasis,
    )
    setFinalMoistureDryBasis(
      example.finalMoistureDryBasis,
    )
    setInletTemperature(example.inletTemperature)
    setOutletTemperature(example.outletTemperature)
    setDrySolidHeatCapacity(
      example.drySolidHeatCapacity,
    )
    setLiquidWaterHeatCapacity(
      example.liquidWaterHeatCapacity,
    )
    setLatentHeatOfVaporization(
      example.latentHeatOfVaporization,
    )
    setHeatLossFraction(example.heatLossFraction)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setWetFeedMassFlowRate('')
    setInitialMoistureDryBasis('')
    setFinalMoistureDryBasis('')
    setInletTemperature('')
    setOutletTemperature('')
    setDrySolidHeatCapacity('')
    setLiquidWaterHeatCapacity('')
    setLatentHeatOfVaporization('')
    setHeatLossFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–17"
        icon="♨"
        title="Dryer Thermal Duty"
        subtitle="Sensible, latent and heat-loss contributions to dryer energy demand"
      />

      <ReferenceBasis>
        Dry-basis moisture balance with lumped thermal duty
      </ReferenceBasis>

      <div className="native-formula">
        Q = ms cpsΔT + mw cpwΔT + mevap λ
      </div>

      <div className="native-input-grid">
        <NumericInput label="Wet Feed Mass Flow" symbol="F" value={wetFeedMassFlowRate} unit="kg/h" onChange={setWetFeedMassFlowRate} />
        <NumericInput label="Initial Moisture, Dry Basis" symbol="Xi" value={initialMoistureDryBasis} unit="kg/kg dry solid" onChange={setInitialMoistureDryBasis} />
        <NumericInput label="Final Moisture, Dry Basis" symbol="Xf" value={finalMoistureDryBasis} unit="kg/kg dry solid" onChange={setFinalMoistureDryBasis} />
        <NumericInput label="Inlet Temperature" symbol="Tin" value={inletTemperature} unit="°C" onChange={setInletTemperature} />
        <NumericInput label="Outlet Temperature" symbol="Tout" value={outletTemperature} unit="°C" onChange={setOutletTemperature} />
        <NumericInput label="Dry-Solid Heat Capacity" symbol="cps" value={drySolidHeatCapacity} unit="kJ/(kg·K)" onChange={setDrySolidHeatCapacity} />
        <NumericInput label="Water Heat Capacity" symbol="cpw" value={liquidWaterHeatCapacity} unit="kJ/(kg·K)" onChange={setLiquidWaterHeatCapacity} />
        <NumericInput label="Latent Heat" symbol="λ" value={latentHeatOfVaporization} unit="kJ/kg" onChange={setLatentHeatOfVaporization} />
        <NumericInput label="Heat-Loss Fraction" symbol="fL" value={heatLossFraction} unit="fraction" onChange={setHeatLossFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate dryer duty"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required heater duty"
          headlineValue={`${formatEngineeringNumber(
            result.requiredHeaterDuty,
          )} kJ/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Dry-Solid Flow" value={formatEngineeringNumber(result.drySolidFlowRate)} unit="kg/h" />
          <ResultItem label="Initial Water Flow" value={formatEngineeringNumber(result.initialWaterFlowRate)} unit="kg/h" />
          <ResultItem label="Final Water Flow" value={formatEngineeringNumber(result.finalWaterFlowRate)} unit="kg/h" />
          <ResultItem label="Water Evaporation Rate" value={formatEngineeringNumber(result.waterEvaporationRate)} unit="kg/h" />
          <ResultItem label="Dry-Solid Sensible Duty" value={formatEngineeringNumber(result.drySolidSensibleDuty)} unit="kJ/h" />
          <ResultItem label="Water Sensible Duty" value={formatEngineeringNumber(result.waterSensibleDuty)} unit="kJ/h" />
          <ResultItem label="Latent Duty" value={formatEngineeringNumber(result.latentDuty)} unit="kJ/h" />
          <ResultItem label="Process Duty" value={formatEngineeringNumber(result.processDuty)} unit="kJ/h" />
          <ResultItem label="Specific Energy" value={formatEngineeringNumber(result.specificEnergyPerWaterRemoved)} unit="kJ/kg water" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
