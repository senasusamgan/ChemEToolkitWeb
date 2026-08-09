import {
  useState,
} from 'react'

import {
  FluidBedDryerAdiabaticInletTemperatureError,
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
  calculateFluidBedDryerAdiabaticInletTemperature,
  createFluidBedDryerAdiabaticInletTemperatureCsv,
} from './engine'

import type {
  FluidBedDryerAdiabaticInletTemperatureInput,
  FluidBedDryerAdiabaticInletTemperatureResult,
} from './types'

import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const exampleForm = {
  wetFeedMassFlowRate: '100',
  inletMoistureWetBasis: '0.30',
  outletMoistureWetBasis: '0.10',
  dryAirMassFlowRate: '500',
  inletAirHumidityRatio: '0.01',
  feedTemperature: '25',
  productTemperature: '60',
  outletAirTemperature: '70',
  referenceTemperature: '0',
  drySolidHeatCapacity: '1.0',
  liquidWaterHeatCapacity: '4.18',
  dryAirHeatCapacity: '1.005',
  waterVaporHeatCapacity: '1.88',
  waterLatentHeatReference: '2500',
}

type FormField =
  keyof typeof exampleForm

export function FluidBedDryerAdiabaticInletTemperatureCalculator() {
  const [form, setForm] =
    useState(exampleForm)

  const [result, setResult] =
    useState<
      FluidBedDryerAdiabaticInletTemperatureResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    FluidBedDryerAdiabaticInletTemperatureInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,
          [field]: value,
        }),
      )
    }
  }

  function currentInput():
    FluidBedDryerAdiabaticInletTemperatureInput {
    return {
      wetFeedMassFlowRate: Number(form.wetFeedMassFlowRate),
      inletMoistureWetBasis: Number(form.inletMoistureWetBasis),
      outletMoistureWetBasis: Number(form.outletMoistureWetBasis),
      dryAirMassFlowRate: Number(form.dryAirMassFlowRate),
      inletAirHumidityRatio: Number(form.inletAirHumidityRatio),
      feedTemperature: Number(form.feedTemperature),
      productTemperature: Number(form.productTemperature),
      outletAirTemperature: Number(form.outletAirTemperature),
      referenceTemperature: Number(form.referenceTemperature),
      drySolidHeatCapacity: Number(form.drySolidHeatCapacity),
      liquidWaterHeatCapacity: Number(form.liquidWaterHeatCapacity),
      dryAirHeatCapacity: Number(form.dryAirHeatCapacity),
      waterVaporHeatCapacity: Number(form.waterVaporHeatCapacity),
      waterLatentHeatReference: Number(form.waterLatentHeatReference),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateFluidBedDryerAdiabaticInletTemperature(
          input,
        )

      setResult(nextResult)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          FluidBedDryerAdiabaticInletTemperatureError ||
        error instanceof
          FluidBedDryerEnergyBalanceError ||
        error instanceof
          FluidBedDryerBalanceCoreError
          ? error.message
          : 'The adiabatic FBD inlet-air temperature could not be solved.',
      )
    }
  }

  function loadExample() {
    setForm(exampleForm)
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setForm(
      Object.fromEntries(
        Object.keys(exampleForm).map(
          key => [
            key,
            '',
          ],
        ),
      ) as typeof exampleForm,
    )
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function exportCsv() {
    if (!result || !calculatedInput) {
      return
    }

    const csv =
      createFluidBedDryerAdiabaticInletTemperatureCsv(
        calculatedInput,
        result,
      )

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      'fluid-bed-dryer-adiabatic-inlet-temperature.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MEB–28"
        icon="⇄"
        title="Fluid Bed Dryer Adiabatic Inlet-Air Temperature"
        subtitle="Solve the Calculator 394 energy balance at zero external heat duty"
      />

      <ReferenceBasis>
        Calculator 395 solves the existing
        Calculator 394 enthalpy model for
        the inlet drying-air temperature
        that gives Q̇ext = 0. The Calculator
        393 mass core remains unchanged.
      </ReferenceBasis>

      <div className="native-formula">
        Q̇ext(Tin) = 0 ·
        Tin = T0 − Q̇(T0) /
        [Q̇(T0 + 1) − Q̇(T0)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Wet Feed Mass Flow Rate" symbol="ṁfeed" value={form.wetFeedMassFlowRate} unit="kg/h" onChange={updateField('wetFeedMassFlowRate')} />
        <NumericInput label="Inlet Moisture — Wet Basis" symbol="Xin" value={form.inletMoistureWetBasis} unit="kg water/kg wet feed" onChange={updateField('inletMoistureWetBasis')} />
        <NumericInput label="Outlet Moisture — Wet Basis" symbol="Xout" value={form.outletMoistureWetBasis} unit="kg water/kg wet product" onChange={updateField('outletMoistureWetBasis')} />
        <NumericInput label="Dry-Air Mass Flow Rate" symbol="ṁda" value={form.dryAirMassFlowRate} unit="kg dry air/h" onChange={updateField('dryAirMassFlowRate')} />
        <NumericInput label="Inlet-Air Humidity Ratio" symbol="Win" value={form.inletAirHumidityRatio} unit="kg water/kg dry air" onChange={updateField('inletAirHumidityRatio')} />
        <NumericInput label="Feed Temperature" symbol="Tf" value={form.feedTemperature} unit="°C" onChange={updateField('feedTemperature')} />
        <NumericInput label="Product Temperature" symbol="Tp" value={form.productTemperature} unit="°C" onChange={updateField('productTemperature')} />
        <NumericInput label="Outlet-Air Temperature" symbol="Ta,out" value={form.outletAirTemperature} unit="°C" onChange={updateField('outletAirTemperature')} />
        <NumericInput label="Reference Temperature" symbol="Tref" value={form.referenceTemperature} unit="°C" onChange={updateField('referenceTemperature')} />
        <NumericInput label="Dry-Solid Heat Capacity" symbol="cp,s" value={form.drySolidHeatCapacity} unit="kJ/(kg·K)" onChange={updateField('drySolidHeatCapacity')} />
        <NumericInput label="Liquid-Water Heat Capacity" symbol="cp,l" value={form.liquidWaterHeatCapacity} unit="kJ/(kg·K)" onChange={updateField('liquidWaterHeatCapacity')} />
        <NumericInput label="Dry-Air Heat Capacity" symbol="cp,da" value={form.dryAirHeatCapacity} unit="kJ/(kg·K)" onChange={updateField('dryAirHeatCapacity')} />
        <NumericInput label="Water-Vapor Heat Capacity" symbol="cp,v" value={form.waterVaporHeatCapacity} unit="kJ/(kg·K)" onChange={updateField('waterVaporHeatCapacity')} />
        <NumericInput label="Water Latent-Heat Reference" symbol="λref" value={form.waterLatentHeatReference} unit="kJ/kg" onChange={updateField('waterLatentHeatReference')} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve adiabatic inlet temperature"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <>
          <ResultPanel
            headlineLabel="Required inlet-air temperature"
            headlineValue={`${formatEngineeringNumber(
              result.requiredInletAirTemperature,
            )} °C`}
            modelName="Fluid Bed Dryer Adiabatic Design Point"
            note="The solution reuses Calculator 394 directly; the reported residual duty verifies Q̇ext ≈ 0."
          >
            <ResultItem label="Adiabatic Residual Duty" value={formatEngineeringNumber(result.adiabaticResidualDutyKilowatts)} unit="kW" />
            <ResultItem label="Evaporated Water" value={formatEngineeringNumber(result.evaporatedWaterMassFlowRate)} unit="kg/h" />
            <ResultItem label="Outlet Humidity Ratio" value={formatEngineeringNumber(result.outletAirHumidityRatio)} unit="kg water/kg dry air" />
            <ResultItem label="Duty Slope per Degree" value={formatEngineeringNumber(result.dutySlopePerDegree)} unit="kJ/(h·°C)" />
            <ResultItem label="Mass-Balance Closure Error" value={formatEngineeringNumber(result.massBalanceClosurePercent)} unit="%" />
            <ResultItem label="Energy-Balance Closure Error" value={formatEngineeringNumber(result.energyBalanceClosurePercent)} unit="%" />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={exportCsv}
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
