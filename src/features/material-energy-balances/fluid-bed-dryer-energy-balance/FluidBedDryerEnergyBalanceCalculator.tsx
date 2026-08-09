import {
  useState,
} from 'react'

import {
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
  calculateFluidBedDryerEnergyBalance,
  createFluidBedDryerEnergyBalanceCsv,
} from './engine'

import type {
  FluidBedDryerEnergyBalanceInput,
  FluidBedDryerEnergyBalanceResult,
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
  inletAirTemperature: '120',
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

export function FluidBedDryerEnergyBalanceCalculator() {
  const [form, setForm] =
    useState(exampleForm)

  const [result, setResult] =
    useState<
      FluidBedDryerEnergyBalanceResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    FluidBedDryerEnergyBalanceInput | null
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
    FluidBedDryerEnergyBalanceInput {
    return {
      wetFeedMassFlowRate: Number(form.wetFeedMassFlowRate),
      inletMoistureWetBasis: Number(form.inletMoistureWetBasis),
      outletMoistureWetBasis: Number(form.outletMoistureWetBasis),
      dryAirMassFlowRate: Number(form.dryAirMassFlowRate),
      inletAirHumidityRatio: Number(form.inletAirHumidityRatio),
      feedTemperature: Number(form.feedTemperature),
      productTemperature: Number(form.productTemperature),
      inletAirTemperature: Number(form.inletAirTemperature),
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
        calculateFluidBedDryerEnergyBalance(
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
          FluidBedDryerEnergyBalanceError ||
        error instanceof
          FluidBedDryerBalanceCoreError
          ? error.message
          : 'The fluid-bed dryer energy balance could not be completed.',
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
        Object.keys(
          exampleForm,
        ).map(
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
      createFluidBedDryerEnergyBalanceCsv(
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
      'fluid-bed-dryer-energy-balance.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const statusLabel =
    result?.status ===
    'heating-required'
      ? 'Net heating required'
      : result?.status ===
        'energy-surplus'
        ? 'Energy surplus / cooling required'
        : 'Near-adiabatic balance'

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MEB–27"
        icon="⇄"
        title="Fluid Bed Dryer Integrated Energy Balance"
        subtitle="Shared mass core plus material and humid-air enthalpy balance"
      />

      <ReferenceBasis>
        Calculator 394 reuses the exact
        Calculator 393 dry-solids,
        evaporation and humidity-ratio
        balance, then closes a steady-state
        enthalpy balance around the dryer.
      </ReferenceBasis>

      <div className="native-formula">
        Q̇ext = Ḣout − Ḣin ·
        ḣair = ṁda cp,da ΔT +
        ṁda W(λref + cp,v ΔT)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Wet Feed Mass Flow Rate" symbol="ṁfeed" value={form.wetFeedMassFlowRate} unit="kg/h" onChange={updateField('wetFeedMassFlowRate')} />
        <NumericInput label="Inlet Moisture — Wet Basis" symbol="Xin" value={form.inletMoistureWetBasis} unit="kg water/kg wet feed" onChange={updateField('inletMoistureWetBasis')} />
        <NumericInput label="Outlet Moisture — Wet Basis" symbol="Xout" value={form.outletMoistureWetBasis} unit="kg water/kg wet product" onChange={updateField('outletMoistureWetBasis')} />
        <NumericInput label="Dry-Air Mass Flow Rate" symbol="ṁda" value={form.dryAirMassFlowRate} unit="kg dry air/h" onChange={updateField('dryAirMassFlowRate')} />
        <NumericInput label="Inlet-Air Humidity Ratio" symbol="Win" value={form.inletAirHumidityRatio} unit="kg water/kg dry air" onChange={updateField('inletAirHumidityRatio')} />
        <NumericInput label="Feed Temperature" symbol="Tf" value={form.feedTemperature} unit="°C" onChange={updateField('feedTemperature')} />
        <NumericInput label="Product Temperature" symbol="Tp" value={form.productTemperature} unit="°C" onChange={updateField('productTemperature')} />
        <NumericInput label="Inlet-Air Temperature" symbol="Ta,in" value={form.inletAirTemperature} unit="°C" onChange={updateField('inletAirTemperature')} />
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
        calculateLabel="Calculate FBD energy balance"
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
            headlineLabel={statusLabel}
            headlineValue={`${formatEngineeringNumber(
              result.netExternalHeatDutyKilowatts,
            )} kW`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem label="Net External Heat Duty" value={formatEngineeringNumber(result.netExternalHeatDuty)} unit="kJ/h" />
            <ResultItem label="Specific Duty per Water Removed" value={formatEngineeringNumber(result.specificExternalHeatDutyPerWaterRemoved)} unit="kJ/kg water" />
            <ResultItem label="Material Enthalpy Change" value={formatEngineeringNumber(result.materialEnthalpyChangeRate)} unit="kJ/h" />
            <ResultItem label="Drying-Air Enthalpy Change" value={formatEngineeringNumber(result.airEnthalpyChangeRate)} unit="kJ/h" />
            <ResultItem label="Energy-Balance Closure Error" value={formatEngineeringNumber(result.energyBalanceClosurePercent)} unit="%" />
            <ResultItem label="Mass-Balance Closure Error" value={formatEngineeringNumber(result.massBalanceClosurePercent)} unit="%" />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Shared FBD mass core
                </p>
                <strong>
                  Mass and energy streams
                </strong>
              </div>
              <span>
                Calculator 394 imports the
                same mass core used by
                Calculator 393.
              </span>
            </div>

            <ol className="native-stage-list">
              <li>
                <strong>Evaporated water</strong>
                {' — '}
                {formatEngineeringNumber(result.evaporatedWaterMassFlowRate)} kg/h
              </li>
              <li>
                <strong>Outlet humidity ratio</strong>
                {' — '}
                {formatEngineeringNumber(result.outletAirHumidityRatio)} kg water/kg dry air
              </li>
              <li>
                <strong>Total inlet enthalpy</strong>
                {' — '}
                {formatEngineeringNumber(result.totalInletEnthalpyRate)} kJ/h
              </li>
              <li>
                <strong>Total outlet enthalpy</strong>
                {' — '}
                {formatEngineeringNumber(result.totalOutletEnthalpyRate)} kJ/h
              </li>
            </ol>
          </div>

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
