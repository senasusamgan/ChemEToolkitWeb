import {
  useState,
} from 'react'

import {
  MinimumSuctionPipeDiameterNpshMarginError,
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateMinimumSuctionPipeDiameterNpshMargin,
  createMinimumSuctionPipeDiameterNpshMarginCsv,
} from './engine'

import type {
  MinimumSuctionPipeDiameterNpshMarginInput,
  MinimumSuctionPipeDiameterNpshMarginResult,
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
  volumetricFlowRate: '0.01',
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
    '8.8',
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
    key: 'volumetricFlowRate',
    label: 'Volumetric Flow Rate',
    symbol: 'Q',
    unit: 'm³/s',
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

export function MinimumSuctionPipeDiameterNpshMarginCalculator() {
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
      MinimumSuctionPipeDiameterNpshMarginResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MinimumSuctionPipeDiameterNpshMarginInput | null
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
    MinimumSuctionPipeDiameterNpshMarginInput {
    return {
      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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
        calculateMinimumSuctionPipeDiameterNpshMargin(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage(
        '',
      )
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          MinimumSuctionPipeDiameterNpshMarginError ||
        error instanceof
          NpshAvailableCavitationMarginError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The minimum suction-pipe diameter could not be solved.',
      )
    }
  }

  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage(
      '',
    )
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

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage(
      '',
    )
  }

  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createMinimumSuctionPipeDiameterNpshMarginCsv(
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
      'minimum-suction-pipe-diameter-npsh-margin.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–23"
        icon="≈"
        title="Minimum Suction Pipe Diameter for Required NPSH Margin"
        subtitle="Size the pump suction line to satisfy a specified cavitation-safety margin"
      />

      <ReferenceBasis>
        Calculator 406 is the inverse-design
        companion to Calculator 405.
        Calculator 405 is evaluated repeatedly
        while suction-pipe diameter is varied.
        The smallest diameter satisfying the
        requested NPSHa minus NPSHr margin is
        returned.
      </ReferenceBasis>

      <div className="native-formula">
        Find minimum Ds such that
        NPSHa(Ds) − NPSHr ≥ Mtarget
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
        calculateLabel="Size suction pipe"
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
            headlineLabel="Minimum suction-pipe diameter"
            headlineValue={`${formatEngineeringNumber(
              result.requiredSuctionPipeDiameterMillimeters,
            )} mm`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Required Diameter"
              value={formatEngineeringNumber(
                result.requiredSuctionPipeDiameter,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Diameter"
              value={formatEngineeringNumber(
                result.requiredSuctionPipeDiameterInches,
              )}
              unit="in"
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
