import { useState } from 'react'
import {
  PsychrometricAirStreamMixingCalculationError,
  calculatePsychrometricAirStreamMixing,
} from './engine'
import type { PsychrometricAirStreamMixingResult } from './types'
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
  dryAirFlowRate1: '1000',
  dryBulbTemperature1: '30',
  humidityRatio1: '0.012',
  dryAirFlowRate2: '500',
  dryBulbTemperature2: '15',
  humidityRatio2: '0.006',
}

export function PsychrometricAirStreamMixingCalculator() {
  const [dryAirFlowRate1, setDryAirFlowRate1] =
    useState(example.dryAirFlowRate1)
  const [
    dryBulbTemperature1,
    setDryBulbTemperature1,
  ] = useState(example.dryBulbTemperature1)
  const [humidityRatio1, setHumidityRatio1] =
    useState(example.humidityRatio1)
  const [dryAirFlowRate2, setDryAirFlowRate2] =
    useState(example.dryAirFlowRate2)
  const [
    dryBulbTemperature2,
    setDryBulbTemperature2,
  ] = useState(example.dryBulbTemperature2)
  const [humidityRatio2, setHumidityRatio2] =
    useState(example.humidityRatio2)

  const [result, setResult] =
    useState<PsychrometricAirStreamMixingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculatePsychrometricAirStreamMixing({
          dryAirFlowRate1:
            Number(dryAirFlowRate1),
          dryBulbTemperature1:
            Number(dryBulbTemperature1),
          humidityRatio1:
            Number(humidityRatio1),
          dryAirFlowRate2:
            Number(dryAirFlowRate2),
          dryBulbTemperature2:
            Number(dryBulbTemperature2),
          humidityRatio2:
            Number(humidityRatio2),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          PsychrometricAirStreamMixingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDryAirFlowRate1(example.dryAirFlowRate1)
    setDryBulbTemperature1(
      example.dryBulbTemperature1,
    )
    setHumidityRatio1(example.humidityRatio1)
    setDryAirFlowRate2(example.dryAirFlowRate2)
    setDryBulbTemperature2(
      example.dryBulbTemperature2,
    )
    setHumidityRatio2(example.humidityRatio2)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDryAirFlowRate1('')
    setDryBulbTemperature1('')
    setHumidityRatio1('')
    setDryAirFlowRate2('')
    setDryBulbTemperature2('')
    setHumidityRatio2('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–34"
        icon="≈"
        title="Psychrometric Air-Stream Mixing"
        subtitle="Adiabatic mixture state from two moist-air streams"
      />

      <ReferenceBasis>
        Dry-air, water-vapor and enthalpy balances
      </ReferenceBasis>

      <div className="native-formula">
        wm = Σ(ma,i wi)/Σma,i · hm = Σ(ma,i hi)/Σma,i
      </div>

      <div className="native-input-grid">
        <NumericInput label="Dry-Air Flow, Stream 1" symbol="ma,1" value={dryAirFlowRate1} unit="kg dry air/h" onChange={setDryAirFlowRate1} />
        <NumericInput label="Dry-Bulb Temperature, Stream 1" symbol="T1" value={dryBulbTemperature1} unit="°C" onChange={setDryBulbTemperature1} />
        <NumericInput label="Humidity Ratio, Stream 1" symbol="w1" value={humidityRatio1} unit="kg/kg dry air" onChange={setHumidityRatio1} />
        <NumericInput label="Dry-Air Flow, Stream 2" symbol="ma,2" value={dryAirFlowRate2} unit="kg dry air/h" onChange={setDryAirFlowRate2} />
        <NumericInput label="Dry-Bulb Temperature, Stream 2" symbol="T2" value={dryBulbTemperature2} unit="°C" onChange={setDryBulbTemperature2} />
        <NumericInput label="Humidity Ratio, Stream 2" symbol="w2" value={humidityRatio2} unit="kg/kg dry air" onChange={setHumidityRatio2} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Mix moist-air streams"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Mixed dry-bulb temperature"
          headlineValue={`${formatEngineeringNumber(
            result.mixedDryBulbTemperature,
          )} °C`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Total Dry-Air Flow" value={formatEngineeringNumber(result.totalDryAirFlowRate)} unit="kg dry air/h" />
          <ResultItem label="Mixed Humidity Ratio" value={formatEngineeringNumber(result.mixedHumidityRatio)} unit="kg/kg dry air" />
          <ResultItem label="Stream 1 Enthalpy" value={formatEngineeringNumber(result.enthalpy1)} unit="kJ/kg dry air" />
          <ResultItem label="Stream 2 Enthalpy" value={formatEngineeringNumber(result.enthalpy2)} unit="kJ/kg dry air" />
          <ResultItem label="Mixed Enthalpy" value={formatEngineeringNumber(result.mixedEnthalpy)} unit="kJ/kg dry air" />
          <ResultItem label="Water-Vapor Flow" value={formatEngineeringNumber(result.waterVaporFlowRate)} unit="kg/h" />
          <ResultItem label="Energy-Balance Residual" value={formatEngineeringNumber(result.energyBalanceResidual)} unit="kJ/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
