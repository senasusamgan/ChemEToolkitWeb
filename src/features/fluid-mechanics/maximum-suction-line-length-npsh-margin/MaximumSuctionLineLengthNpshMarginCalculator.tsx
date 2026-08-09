import {
  useState,
} from 'react'

import {
  MaximumSuctionLineLengthNpshMarginError,
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateMaximumSuctionLineLengthNpshMargin,
  createMaximumSuctionLineLengthNpshMarginCsv,
} from './engine'

import type {
  MaximumSuctionLineLengthNpshMarginInput,
  MaximumSuctionLineLengthNpshMarginResult,
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
  volumetricFlowRate: '0.01',

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
    '8.7',
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
    key: 'volumetricFlowRate',
    label: 'Volumetric Flow Rate',
    symbol: 'Q',
    unit: 'm³/s',
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

export function MaximumSuctionLineLengthNpshMarginCalculator() {
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
      MaximumSuctionLineLengthNpshMarginResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MaximumSuctionLineLengthNpshMarginInput | null
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
    MaximumSuctionLineLengthNpshMarginInput {
    return {
      suctionPipeDiameter:
        Number(
          form.suctionPipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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
        calculateMaximumSuctionLineLengthNpshMargin(
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
          MaximumSuctionLineLengthNpshMarginError ||
        error instanceof
          NpshAvailableCavitationMarginError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The maximum suction-line length could not be calculated.',
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
      createMaximumSuctionLineLengthNpshMarginCsv(
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

    link.href =
      url

    link.download =
      'maximum-suction-line-length-npsh-margin.csv'

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
        code="FM–26"
        icon="≈"
        title="Maximum Suction-Line Length for Required NPSH Margin"
        subtitle="Determine the maximum allowable pump suction-line length while preserving a specified cavitation-safety margin"
      />

      <ReferenceBasis>
        Calculator 409 reuses Calculator 405.
        With suction diameter and flow fixed,
        velocity, Reynolds number and Darcy
        friction factor remain constant.
        Distributed suction loss therefore
        changes linearly with pipe length,
        allowing the maximum length to be
        solved explicitly.
      </ReferenceBasis>

      <div className="native-formula">
        Lmax =
        [M(0) − Mtarget]
        / |dM/dL|
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
        calculateLabel="Solve maximum suction length"
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
            headlineLabel="Maximum suction-line length"
            headlineValue={`${formatEngineeringNumber(
              result.maximumSuctionPipeLength,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
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
              label="Zero-Length NPSH Margin"
              value={formatEngineeringNumber(
                result.zeroLengthNpshMargin,
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
              label="Distributed Head Loss Gradient"
              value={formatEngineeringNumber(
                result.distributedHeadLossPerUnitLength,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Total Suction-Line Head Loss"
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

            <ResultItem
              label="Reynolds Number"
              value={formatEngineeringNumber(
                result.reynoldsNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Darcy Friction Factor"
              value={formatEngineeringNumber(
                result.frictionFactor,
              )}
              unit="-"
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
