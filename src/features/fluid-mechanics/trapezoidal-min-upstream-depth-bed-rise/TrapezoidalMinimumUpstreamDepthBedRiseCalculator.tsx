import {
  useState,
} from 'react'

import {
  TrapezoidalMinimumUpstreamDepthBedRiseError,
  calculateTrapezoidalMinimumUpstreamDepthBedRise,
  createTrapezoidalMinimumUpstreamDepthBedRiseCsv,
} from './engine'

import type {
  TrapezoidalMinimumUpstreamDepthBedRiseInput,
  TrapezoidalMinimumUpstreamDepthBedRiseResult,
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
  bottomWidth:
    '2',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  bedRise:
    '0.1',

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
      'bottomWidth',

    label:
      'Channel Bottom Width',

    symbol:
      'b',

    unit:
      'm',
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
      'volumetricFlowRate',

    label:
      'Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'bedRise',

    label:
      'Specified Bed Rise',

    symbol:
      'Δz',

    unit:
      'm',
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

export function TrapezoidalMinimumUpstreamDepthBedRiseCalculator() {
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
      TrapezoidalMinimumUpstreamDepthBedRiseResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMinimumUpstreamDepthBedRiseInput | null
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
    TrapezoidalMinimumUpstreamDepthBedRiseInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      bedRise:
        Number(
          form.bedRise,
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
        calculateTrapezoidalMinimumUpstreamDepthBedRise(
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
          TrapezoidalMinimumUpstreamDepthBedRiseError
          ? error.message
          : 'The minimum upstream-depth hump calculation could not be completed.',
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
      createTrapezoidalMinimumUpstreamDepthBedRiseCsv(
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
      'trapezoidal-minimum-upstream-depth-bed-rise.csv'

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
        code="FM–55"
        icon="≈"
        title="Minimum Upstream Depth for a Bed Rise"
        subtitle="Determine the minimum subcritical approach depth required to pass a specified hump exactly at the choking limit"
      />

      <ReferenceBasis>
        Calculator 438 solves the inverse
        hump-choking problem. The required
        upstream specific energy equals the
        critical crest energy plus the bed
        rise, and the subcritical alternate
        depth becomes the minimum approach
        depth.
      </ReferenceBasis>

      <div className="native-formula">
        E
        <sub>1,min</sub>
        =
        E
        <sub>c</sub>
        + Δz
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
        calculateLabel="Calculate minimum upstream depth"
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
            headlineLabel="Minimum subcritical upstream depth"
            headlineValue={`${formatEngineeringNumber(
              result.minimumSubcriticalUpstreamDepth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Critical Crest Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Specific Energy"
              value={formatEngineeringNumber(
                result.criticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.requiredUpstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Flow Area"
              value={formatEngineeringNumber(
                result.upstreamFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Upstream Velocity"
              value={formatEngineeringNumber(
                result.upstreamVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Alternate Supercritical Depth"
              value={formatEngineeringNumber(
                result.alternateSupercriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Alternate Froude Number"
              value={formatEngineeringNumber(
                result.alternateFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Depth Above Critical"
              value={formatEngineeringNumber(
                result.depthAboveCritical,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream / Critical Depth"
              value={formatEngineeringNumber(
                result.upstreamDepthToCriticalDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Crest Water-Surface Change"
              value={formatEngineeringNumber(
                result.crestWaterSurfaceElevationChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Forward Maximum Bed Rise"
              value={formatEngineeringNumber(
                result.forwardMaximumBedRise,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed-Rise Closure Residual"
              value={formatEngineeringNumber(
                result.bedRiseClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Energy Residual"
              value={formatEngineeringNumber(
                result.upstreamEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Alternate Energy Residual"
              value={formatEngineeringNumber(
                result.alternateEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
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
