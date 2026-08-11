import {
  useState,
} from 'react'

import {
  MostEconomicalTrapezoidalChannelError,
  calculateMostEconomicalTrapezoidalChannel,
  createMostEconomicalTrapezoidalChannelCsv,
} from './engine'

import type {
  MostEconomicalTrapezoidalChannelInput,
  MostEconomicalTrapezoidalChannelResult,
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
  volumetricFlowRate:
    '5',

  channelSlope:
    '0.002',

  manningRoughness:
    '0.015',

  sideSlopeHorizontalPerVertical:
    '1',

  fluidDensity:
    '998',
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
    key:
      'volumetricFlowRate',

    label:
      'Design Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'channelSlope',

    label:
      'Channel / Energy Slope',

    symbol:
      'S',

    unit:
      'm/m',
  },
  {
    key:
      'manningRoughness',

    label:
      'Manning Roughness',

    symbol:
      'n',

    unit:
      's/m⅓',
  },
  {
    key:
      'sideSlopeHorizontalPerVertical',

    label:
      'Side Slope Horizontal : Vertical',

    symbol:
      'z',

    unit:
      'H:V',
  },
  {
    key:
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function MostEconomicalTrapezoidalChannelCalculator() {
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
      MostEconomicalTrapezoidalChannelResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MostEconomicalTrapezoidalChannelInput | null
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
          [field]:
            value,
        }),
      )
    }
  }

  function currentInput():
    MostEconomicalTrapezoidalChannelInput {
    return {
      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      channelSlope:
        Number(
          form.channelSlope,
        ),

      manningRoughness:
        Number(
          form.manningRoughness,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateMostEconomicalTrapezoidalChannel(
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
          MostEconomicalTrapezoidalChannelError
          ? error.message
          : 'The economical trapezoidal-channel design could not be completed.',
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
      createMostEconomicalTrapezoidalChannelCsv(
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
      'most-economical-trapezoidal-channel.csv'

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
        code="FM–47"
        icon="≈"
        title="Most Economical Trapezoidal Channel Design"
        subtitle="Size the best-hydraulic trapezoidal section for a required Manning discharge"
      />

      <ReferenceBasis>
        Calculator 430 analytically determines
        the trapezoidal section that minimizes
        wetted perimeter for the required
        Manning-flow condition and specified
        side slope.
      </ReferenceBasis>

      <div className="native-formula">
        b =
        2y(√(1+z²) − z)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        R
        <sub>h</sub>
        = y/2
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
        calculateLabel="Design economical section"
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
            headlineLabel="Optimal depth × bottom width"
            headlineValue={`${formatEngineeringNumber(
              result.flowDepth,
            )} m × ${formatEngineeringNumber(
              result.bottomWidth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Top Width"
              value={formatEngineeringNumber(
                result.topWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Wetted Perimeter"
              value={formatEngineeringNumber(
                result.wettedPerimeter,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Radius"
              value={formatEngineeringNumber(
                result.hydraulicRadius,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Depth"
              value={formatEngineeringNumber(
                result.hydraulicDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Side Length"
              value={formatEngineeringNumber(
                result.sideLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Half Top Width"
              value={formatEngineeringNumber(
                result.halfTopWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Optimum Geometry Residual"
              value={formatEngineeringNumber(
                result.optimumGeometryResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Rh − y/2 Residual"
              value={formatEngineeringNumber(
                result.hydraulicRadiusResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Bottom Width / Depth"
              value={formatEngineeringNumber(
                result.bottomWidthToDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Mean Velocity"
              value={formatEngineeringNumber(
                result.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Froude Number"
              value={formatEngineeringNumber(
                result.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Specific Energy"
              value={formatEngineeringNumber(
                result.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.boundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Manning Conveyance"
              value={formatEngineeringNumber(
                result.manningConveyance,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Reconstructed Flow Rate"
              value={formatEngineeringNumber(
                result.reconstructedFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Relative Flow Closure"
              value={formatEngineeringNumber(
                result.relativeFlowClosureResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Hydraulic Power Dissipation"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipationPerLength,
              )}
              unit="W/m"
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
