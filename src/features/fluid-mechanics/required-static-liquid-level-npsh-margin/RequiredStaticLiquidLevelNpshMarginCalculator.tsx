import {
  useState,
} from 'react'

import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  RequiredStaticLiquidLevelNpshMarginError,
  calculateRequiredStaticLiquidLevelNpshMargin,
  createRequiredStaticLiquidLevelNpshMarginCsv,
} from './engine'

import type {
  RequiredStaticLiquidLevelNpshMarginInput,
  RequiredStaticLiquidLevelNpshMarginResult,
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

  liquidSurfaceAbsolutePressure:
    '101325',

  vaporPressure:
    '3167',

  requiredNpsh:
    '3',

  targetNpshMargin:
    '2',
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
    key: 'requiredNpsh',
    label: 'Pump Required NPSH',
    symbol: 'NPSHr',
    unit: 'm',
  },
  {
    key: 'targetNpshMargin',
    label: 'Target NPSH Margin',
    symbol: 'Mtarget',
    unit: 'm',
  },
]

export function RequiredStaticLiquidLevelNpshMarginCalculator() {
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
      RequiredStaticLiquidLevelNpshMarginResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      RequiredStaticLiquidLevelNpshMarginInput | null
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
    RequiredStaticLiquidLevelNpshMarginInput {
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
        calculateRequiredStaticLiquidLevelNpshMargin(
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
          RequiredStaticLiquidLevelNpshMarginError ||
        error instanceof
          NpshAvailableCavitationMarginError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The required static liquid level could not be calculated.',
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
      createRequiredStaticLiquidLevelNpshMarginCsv(
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
      'required-static-liquid-level-npsh-margin.csv'

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
        code="FM–24"
        icon="≈"
        title="Required Static Liquid Level / Maximum Suction Lift"
        subtitle="Determine pump elevation or minimum flooded suction level for a target NPSH margin"
      />

      <ReferenceBasis>
        Calculator 407 is an inverse-design
        companion to Calculator 405. The NPSH
        model is first evaluated with the
        liquid surface at pump centerline.
        Because static elevation contributes
        one-for-one to NPSHa, the required
        liquid level is then solved directly
        and verified through Calculator 405.
      </ReferenceBasis>

      <div className="native-formula">
        zrequired =
        Mtarget − M(z = 0)
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
        calculateLabel="Solve required liquid level"
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
            headlineLabel={
              result.requiredSuctionConfiguration ===
              'suction-lift'
                ? 'Maximum suction lift'
                : 'Minimum flooded suction head'
            }
            headlineValue={
              result.requiredSuctionConfiguration ===
              'suction-lift'
                ? `${formatEngineeringNumber(
                    result.maximumSuctionLift,
                  )} m`
                : `${formatEngineeringNumber(
                    result.minimumFloodedSuctionHead,
                  )} m`
            }
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Required Static Level Above Pump"
              value={formatEngineeringNumber(
                result.requiredStaticLiquidLevelAbovePump,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Suction Lift"
              value={formatEngineeringNumber(
                result.maximumSuctionLift,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Flooded Suction Head"
              value={formatEngineeringNumber(
                result.minimumFloodedSuctionHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Suction Configuration"
              value={result.requiredSuctionConfiguration}
              unit=""
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
              label="Zero-Level NPSH Margin"
              value={formatEngineeringNumber(
                result.zeroLevelNpshMargin,
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
