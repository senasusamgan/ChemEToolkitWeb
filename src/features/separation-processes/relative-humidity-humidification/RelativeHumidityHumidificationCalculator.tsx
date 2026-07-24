import { useState } from 'react'
import {
  RelativeHumidityHumidificationCalculationError,
  calculateRelativeHumidityHumidification,
} from './engine'
import type { RelativeHumidityHumidificationResult } from './types'
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
  dryAirFlowRate: '1000',
  dryBulbTemperature: '25',
  totalPressure: '101.325',
  inletRelativeHumidity: '0.30',
  targetRelativeHumidity: '0.70',
}

export function RelativeHumidityHumidificationCalculator() {
  const [dryAirFlowRate, setDryAirFlowRate] =
    useState(example.dryAirFlowRate)
  const [dryBulbTemperature, setDryBulbTemperature] =
    useState(example.dryBulbTemperature)
  const [totalPressure, setTotalPressure] =
    useState(example.totalPressure)
  const [
    inletRelativeHumidity,
    setInletRelativeHumidity,
  ] = useState(example.inletRelativeHumidity)
  const [
    targetRelativeHumidity,
    setTargetRelativeHumidity,
  ] = useState(example.targetRelativeHumidity)

  const [result, setResult] =
    useState<RelativeHumidityHumidificationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateRelativeHumidityHumidification({
          dryAirFlowRate:
            Number(dryAirFlowRate),
          dryBulbTemperature:
            Number(dryBulbTemperature),
          totalPressure:
            Number(totalPressure),
          inletRelativeHumidity:
            Number(inletRelativeHumidity),
          targetRelativeHumidity:
            Number(targetRelativeHumidity),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          RelativeHumidityHumidificationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDryAirFlowRate(example.dryAirFlowRate)
    setDryBulbTemperature(
      example.dryBulbTemperature,
    )
    setTotalPressure(example.totalPressure)
    setInletRelativeHumidity(
      example.inletRelativeHumidity,
    )
    setTargetRelativeHumidity(
      example.targetRelativeHumidity,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDryAirFlowRate('')
    setDryBulbTemperature('')
    setTotalPressure('')
    setInletRelativeHumidity('')
    setTargetRelativeHumidity('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–35"
        icon="☁"
        title="Relative-Humidity Humidification"
        subtitle="Water addition required to reach a target relative humidity"
      />

      <ReferenceBasis>
        Buck saturation pressure and ideal humidity-ratio relation
      </ReferenceBasis>

      <div className="native-formula">
        ṁw = ṁda(wtarget − win) · w = 0.62198pv/(P − pv)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Dry-Air Flow" symbol="ṁda" value={dryAirFlowRate} unit="kg dry air/h" onChange={setDryAirFlowRate} />
        <NumericInput label="Dry-Bulb Temperature" symbol="T" value={dryBulbTemperature} unit="°C" onChange={setDryBulbTemperature} />
        <NumericInput label="Total Pressure" symbol="P" value={totalPressure} unit="kPa" onChange={setTotalPressure} />
        <NumericInput label="Inlet Relative Humidity" symbol="RHin" value={inletRelativeHumidity} unit="fraction" onChange={setInletRelativeHumidity} />
        <NumericInput label="Target Relative Humidity" symbol="RHtarget" value={targetRelativeHumidity} unit="fraction" onChange={setTargetRelativeHumidity} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate water addition"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required water addition"
          headlineValue={`${formatEngineeringNumber(
            result.waterAdditionRate,
          )} kg/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Saturation Vapor Pressure" value={formatEngineeringNumber(result.saturationVaporPressure)} unit="kPa" />
          <ResultItem label="Inlet Vapor Partial Pressure" value={formatEngineeringNumber(result.inletVaporPartialPressure)} unit="kPa" />
          <ResultItem label="Target Vapor Partial Pressure" value={formatEngineeringNumber(result.targetVaporPartialPressure)} unit="kPa" />
          <ResultItem label="Inlet Humidity Ratio" value={formatEngineeringNumber(result.inletHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Target Humidity Ratio" value={formatEngineeringNumber(result.targetHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Humidity-Ratio Increase" value={formatEngineeringNumber(result.humidityRatioIncrease)} unit="kg/kg dry air" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
