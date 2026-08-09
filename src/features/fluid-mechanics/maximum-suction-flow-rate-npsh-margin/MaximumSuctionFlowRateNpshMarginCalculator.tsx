import {
  useState,
} from 'react'

import {
  MaximumSuctionFlowRateNpshMarginError,
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateMaximumSuctionFlowRateNpshMargin,
  createMaximumSuctionFlowRateNpshMarginCsv,
} from './engine'

import type {
  MaximumSuctionFlowRateNpshMarginInput,
  MaximumSuctionFlowRateNpshMarginResult,
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
  suctionPipeDiameter: '0.10',
  suctionPipeLength: '5',

  fluidDensity: '998',
  dynamicViscosity: '0.001',

  absoluteRoughness: '0.000045',
  suctionMinorLossCoefficient: '3',

  liquidSurfaceAbsolutePressure:
    '101325',

  vaporPressure:
    '3167',

  staticLiquidLevelAbovePump:
    '2',

  requiredNpsh:
    '3',

  targetNpshMargin:
    '8',
}

type FormField =
  keyof typeof exampleForm

const fields: Array<{
  key: FormField
  label: string
  symbol: string
  unit: string
}> = [
  {
    key: 'suctionPipeDiameter',
    label: 'Suction Pipe Diameter',
    symbol: 'Ds',
    unit: 'm',
  },
  {
    key: 'suctionPipeLength',
    label: 'Suction Pipe Length',
    symbol: 'Ls',
    unit: 'm',
  },
  {
    key: 'fluidDensity',
    label: 'Fluid Density',
    symbol: 'ρ',
    unit: 'kg/m³',
  },
  {
    key: 'dynamicViscosity',
    label: 'Dynamic Viscosity',
    symbol: 'μ',
    unit: 'Pa·s',
  },
  {
    key: 'absoluteRoughness',
    label: 'Absolute Roughness',
    symbol: 'ε',
    unit: 'm',
  },
  {
    key: 'suctionMinorLossCoefficient',
    label: 'Suction Minor-Loss Coefficient',
    symbol: 'ΣKs',
    unit: '-',
  },
  {
    key: 'liquidSurfaceAbsolutePressure',
    label: 'Liquid-Surface Absolute Pressure',
    symbol: 'Ps',
    unit: 'Pa abs',
  },
  {
    key: 'vaporPressure',
    label: 'Liquid Vapor Pressure',
    symbol: 'Pv',
    unit: 'Pa abs',
  },
  {
    key: 'staticLiquidLevelAbovePump',
    label: 'Static Liquid Level Above Pump',
    symbol: 'z',
    unit: 'm',
  },
  {
    key: 'requiredNpsh',
    label: 'Pump Required NPSH',
    symbol: 'NPSHr',
    unit: 'm',
  },
  {
    key: 'targetNpshMargin',
    label: 'Required NPSH Margin',
    symbol: 'Mtarget',
    unit: 'm',
  },
]

export function MaximumSuctionFlowRateNpshMarginCalculator() {
  const [
    form,
    setForm,
  ] =
    useState(
      exampleForm,
    )

  const [
    result,
    setResult,
  ] =
    useState<
      MaximumSuctionFlowRateNpshMarginResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MaximumSuctionFlowRateNpshMarginInput | null
    >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

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
    MaximumSuctionFlowRateNpshMarginInput {
    return {
      suctionPipeDiameter:
        Number(
          form.suctionPipeDiameter,
        ),

      suctionPipeLength:
        Number(
          form.suctionPipeLength,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),

      dynamicViscosity:
        Number(
          form.dynamicViscosity,
        ),

      absoluteRoughness:
        Number(
          form.absoluteRoughness,
        ),

      suctionMinorLossCoefficient:
        Number(
          form.suctionMinorLossCoefficient,
        ),

      liquidSurfaceAbsolutePressure:
        Number(
          form.liquidSurfaceAbsolutePressure,
        ),

      vaporPressure:
        Number(
          form.vaporPressure,
        ),

      staticLiquidLevelAbovePump:
        Number(
          form.staticLiquidLevelAbovePump,
        ),

      requiredNpsh:
        Number(
          form.requiredNpsh,
        ),

      targetNpshMargin:
        Number(
          form.targetNpshMargin,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateMaximumSuctionFlowRateNpshMargin(
          input,
        )

      setResult(next)

      setCalculatedInput(input)

      setErrorMessage('')
    } catch (error) {
      setResult(null)

      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          MaximumSuctionFlowRateNpshMarginError ||
        error instanceof
          NpshAvailableCavitationMarginError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The maximum suction flow rate could not be solved.',
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
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createMaximumSuctionFlowRateNpshMarginCsv(
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
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href = url

    link.download =
      'maximum-suction-flow-rate-npsh-margin.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–25"
        icon="≈"
        title="Maximum Suction Flow Rate for Required NPSH Margin"
        subtitle="Determine the maximum pump suction flow that preserves a specified cavitation-safety margin"
      />

      <ReferenceBasis>
        Calculator 408 reuses Calculator 405
        as its NPSH and suction-hydraulics
        source of truth. Flow is increased
        until the requested NPSHa minus NPSHr
        safety margin becomes active.
      </ReferenceBasis>

      <div className="native-formula">
        Find maximum Q such that
        NPSHa(Q) − NPSHr ≥ Mtarget
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={form[field.key]}
              unit={field.unit}
              onChange={updateField(
                field.key,
              )}
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve maximum suction flow"
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
            headlineLabel="Maximum suction flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.maximumVolumetricFlowRateCubicMetersPerHour,
            )} m³/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Maximum Volumetric Flow"
              value={formatEngineeringNumber(
                result.maximumVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Maximum Volumetric Flow"
              value={formatEngineeringNumber(
                result.maximumVolumetricFlowRateLitersPerSecond,
              )}
              unit="L/s"
            />

            <ResultItem
              label="Maximum Mass Flow"
              value={formatEngineeringNumber(
                result.maximumMassFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Target NPSH Margin"
              value={formatEngineeringNumber(
                result.targetNpshMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Achieved NPSH Margin"
              value={formatEngineeringNumber(
                result.npshMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="NPSH Available"
              value={formatEngineeringNumber(
                result.availableNpsh,
              )}
              unit="m"
            />

            <ResultItem
              label="Required NPSH"
              value={formatEngineeringNumber(
                result.requiredNpsh,
              )}
              unit="m"
            />

            <ResultItem
              label="Zero-Flow NPSH Margin"
              value={formatEngineeringNumber(
                result.zeroFlowNpshMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Suction-Line Head Loss"
              value={formatEngineeringNumber(
                result.suctionLineHeadLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Suction Velocity"
              value={formatEngineeringNumber(
                result.velocity,
              )}
              unit="m/s"
            />
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
