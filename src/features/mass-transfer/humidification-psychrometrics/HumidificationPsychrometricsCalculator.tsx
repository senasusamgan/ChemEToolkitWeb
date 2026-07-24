import { useState } from 'react'
import {
  HumidificationPsychrometricsCalculationError,
  calculateHumidificationPsychrometrics,
} from './engine'
import type { HumidificationPsychrometricsResult } from './types'
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
  dryAirMassFlowRate: '1000',
  dryBulbTemperatureCelsius: '25',
  totalPressureKPa: '101.325',
  inletRelativeHumidity: '0.3',
  outletRelativeHumidity: '0.6',
}

function optionalTemperature(value: number | null): string {
  return value === null ? 'Undefined for dry air' : formatEngineeringNumber(value)
}

export function HumidificationPsychrometricsCalculator() {
  const [dryAirMassFlowRate, setDryAirMassFlowRate] = useState(EXAMPLE.dryAirMassFlowRate)
  const [dryBulbTemperatureCelsius, setDryBulbTemperatureCelsius] = useState(EXAMPLE.dryBulbTemperatureCelsius)
  const [totalPressureKPa, setTotalPressureKPa] = useState(EXAMPLE.totalPressureKPa)
  const [inletRelativeHumidity, setInletRelativeHumidity] = useState(EXAMPLE.inletRelativeHumidity)
  const [outletRelativeHumidity, setOutletRelativeHumidity] = useState(EXAMPLE.outletRelativeHumidity)
  const [result, setResult] = useState<HumidificationPsychrometricsResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateHumidificationPsychrometrics({
        dryAirMassFlowRate: Number(dryAirMassFlowRate),
        dryBulbTemperatureCelsius: Number(dryBulbTemperatureCelsius),
        totalPressureKPa: Number(totalPressureKPa),
        inletRelativeHumidity: Number(inletRelativeHumidity),
        outletRelativeHumidity: Number(outletRelativeHumidity),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof HumidificationPsychrometricsCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDryAirMassFlowRate(EXAMPLE.dryAirMassFlowRate)
    setDryBulbTemperatureCelsius(EXAMPLE.dryBulbTemperatureCelsius)
    setTotalPressureKPa(EXAMPLE.totalPressureKPa)
    setInletRelativeHumidity(EXAMPLE.inletRelativeHumidity)
    setOutletRelativeHumidity(EXAMPLE.outletRelativeHumidity)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDryAirMassFlowRate('')
    setDryBulbTemperatureCelsius('')
    setTotalPressureKPa('')
    setInletRelativeHumidity('')
    setOutletRelativeHumidity('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–37"
        icon="◌"
        title="Humidification & Psychrometrics"
        subtitle="Humidity ratios, dew points, water transfer and isothermal duty"
      />
      <ReferenceBasis>Ideal moist-air relations with the Magnus saturation-pressure correlation</ReferenceBasis>
      <div className="native-formula">
        Y = 0.62198 pᵥ/(P−pᵥ) · h = 1.005T + Y(2500 + 1.88T)
      </div>
      <div className="native-input-grid">
        <NumericInput label="Dry-Air Mass Flow" symbol="mda" value={dryAirMassFlowRate} unit="kg dry air/h" onChange={setDryAirMassFlowRate} />
        <NumericInput label="Dry-Bulb Temperature" symbol="Tdb" value={dryBulbTemperatureCelsius} unit="°C" onChange={setDryBulbTemperatureCelsius} />
        <NumericInput label="Total Pressure" symbol="P" value={totalPressureKPa} unit="kPa" onChange={setTotalPressureKPa} />
        <NumericInput label="Inlet Relative Humidity" symbol="φin" value={inletRelativeHumidity} unit="fraction" onChange={setInletRelativeHumidity} />
        <NumericInput label="Outlet Relative Humidity" symbol="φout" value={outletRelativeHumidity} unit="fraction" onChange={setOutletRelativeHumidity} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Calculate psychrometric change" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Signed water transfer"
          headlineValue={`${formatEngineeringNumber(result.signedWaterTransferRate)} kg/h`}
          modelName={result.modelName}
          note={result.directionDescription}
        >
          <ResultItem label="Saturation Vapor Pressure" value={formatEngineeringNumber(result.saturationVaporPressureKPa)} unit="kPa" />
          <ResultItem label="Inlet Vapor Pressure" value={formatEngineeringNumber(result.inletVaporPressureKPa)} unit="kPa" />
          <ResultItem label="Outlet Vapor Pressure" value={formatEngineeringNumber(result.outletVaporPressureKPa)} unit="kPa" />
          <ResultItem label="Inlet Humidity Ratio" value={formatEngineeringNumber(result.inletHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Outlet Humidity Ratio" value={formatEngineeringNumber(result.outletHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Saturation Humidity Ratio" value={formatEngineeringNumber(result.saturationHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Water Transfer Magnitude" value={formatEngineeringNumber(result.waterTransferMagnitude)} unit="kg/h" />
          <ResultItem label="Inlet Dew Point" value={optionalTemperature(result.inletDewPointCelsius)} unit={result.inletDewPointCelsius === null ? '' : '°C'} />
          <ResultItem label="Outlet Dew Point" value={optionalTemperature(result.outletDewPointCelsius)} unit={result.outletDewPointCelsius === null ? '' : '°C'} />
          <ResultItem label="Inlet Humid Enthalpy" value={formatEngineeringNumber(result.inletHumidEnthalpy)} unit="kJ/kg dry air" />
          <ResultItem label="Outlet Humid Enthalpy" value={formatEngineeringNumber(result.outletHumidEnthalpy)} unit="kJ/kg dry air" />
          <ResultItem label="Signed Isothermal Duty" value={formatEngineeringNumber(result.signedIsothermalHeatDuty)} unit="kJ/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
