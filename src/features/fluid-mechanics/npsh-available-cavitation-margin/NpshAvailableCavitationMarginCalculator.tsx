import {
  useState,
} from 'react'

import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
  createNpshAvailableCavitationMarginCsv,
} from './engine'

import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
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
  suctionPipeLength: '5',

  fluidDensity: '998',
  dynamicViscosity: '0.001',

  absoluteRoughness: '0.000045',
  suctionMinorLossCoefficient: '3',

  liquidSurfaceAbsolutePressure: '101325',
  vaporPressure: '3167',

  staticLiquidLevelAbovePump: '2',

  requiredNpsh: '3',
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
]

export function NpshAvailableCavitationMarginCalculator() {
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
      NpshAvailableCavitationMarginResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      NpshAvailableCavitationMarginInput | null
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
    NpshAvailableCavitationMarginInput {
    return {
      suctionPipeDiameter:
        Number(
          form.suctionPipeDiameter,
        ),

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
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateNpshAvailableCavitationMargin(
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
          NpshAvailableCavitationMarginError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The NPSH and cavitation-margin calculation could not be completed.',
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
      createNpshAvailableCavitationMarginCsv(
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
      'npsh-available-cavitation-margin.csv'

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
        code="FM–22"
        icon="≈"
        title="NPSH Available & Cavitation Margin"
        subtitle="Assess pump suction conditions, available NPSH and cavitation margin"
      />

      <ReferenceBasis>
        Calculator 405 evaluates pump suction
        conditions using absolute liquid-surface
        pressure, vapor pressure, static level
        and suction-line losses. The suction
        major and minor losses reuse the shared
        pipe-hydraulics core from Calculators
        401–404.
      </ReferenceBasis>

      <div className="native-formula">
        NPSHa =
        (Ps − Pv)/(ρg)
        + z − hL,suction
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
        calculateLabel="Calculate NPSH margin"
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
            headlineLabel="NPSH available"
            headlineValue={`${formatEngineeringNumber(
              result.availableNpsh,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Required NPSH"
              value={formatEngineeringNumber(
                result.requiredNpsh,
              )}
              unit="m"
            />

            <ResultItem
              label="NPSH Margin"
              value={formatEngineeringNumber(
                result.npshMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="NPSH Margin"
              value={formatEngineeringNumber(
                result.npshMarginPercent,
              )}
              unit="% of NPSHr"
            />

            <ResultItem
              label="NPSHa / NPSHr"
              value={formatEngineeringNumber(
                result.npshRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Cavitation Status"
              value={result.cavitationStatus}
              unit=""
            />

            <ResultItem
              label="Pressure Head Above Vapor"
              value={formatEngineeringNumber(
                result.pressureHeadAboveVapor,
              )}
              unit="m"
            />

            <ResultItem
              label="Static Liquid Level"
              value={formatEngineeringNumber(
                result.staticLiquidLevelAbovePump,
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
