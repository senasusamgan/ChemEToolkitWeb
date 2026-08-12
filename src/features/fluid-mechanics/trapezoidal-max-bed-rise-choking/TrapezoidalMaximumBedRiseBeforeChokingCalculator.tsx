import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumBedRiseBeforeChokingError,
  calculateTrapezoidalMaximumBedRiseBeforeChoking,
  createTrapezoidalMaximumBedRiseBeforeChokingCsv,
} from './engine'

import type {
  TrapezoidalMaximumBedRiseBeforeChokingInput,
  TrapezoidalMaximumBedRiseBeforeChokingResult,
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

  upstreamFlowDepth:
    '1.2',

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
      'upstreamFlowDepth',

    label:
      'Upstream Flow Depth',

    symbol:
      'y₁',

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

export function TrapezoidalMaximumBedRiseBeforeChokingCalculator() {
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
      TrapezoidalMaximumBedRiseBeforeChokingResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumBedRiseBeforeChokingInput | null
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
    TrapezoidalMaximumBedRiseBeforeChokingInput {
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

      upstreamFlowDepth:
        Number(
          form.upstreamFlowDepth,
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
        calculateTrapezoidalMaximumBedRiseBeforeChoking(
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
          TrapezoidalMaximumBedRiseBeforeChokingError
          ? error.message
          : 'The maximum hump-height calculation could not be completed.',
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
      createTrapezoidalMaximumBedRiseBeforeChokingCsv(
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
      'trapezoidal-maximum-bed-rise-before-choking.csv'

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
        code="FM–53"
        icon="≈"
        title="Maximum Bed Rise Before Open-Channel Choking"
        subtitle="Determine the maximum trapezoidal-channel hump height before a subcritical approach flow becomes critical"
      />

      <ReferenceBasis>
        Calculator 436 compares the upstream
        specific energy with the minimum
        critical specific energy for the same
        discharge and channel geometry. Their
        difference is the maximum lossless bed
        rise before choking.
      </ReferenceBasis>

      <div className="native-formula">
        Δz
        <sub>max</sub>
        =
        E₁ − E
        <sub>c</sub>
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
        calculateLabel="Calculate choking bed rise"
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
            headlineLabel="Maximum bed rise before choking"
            headlineValue={`${formatEngineeringNumber(
              result.maximumBedRise,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
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
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Froude Number"
              value={formatEngineeringNumber(
                result.criticalFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Flow Area"
              value={formatEngineeringNumber(
                result.criticalFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Critical Velocity"
              value={formatEngineeringNumber(
                result.criticalVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Bed Rise / Upstream Depth"
              value={formatEngineeringNumber(
                result.maximumBedRiseToUpstreamDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Available Energy Margin"
              value={formatEngineeringNumber(
                result.availableEnergyMarginFraction *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Crest Water-Surface Elevation"
              value={formatEngineeringNumber(
                result.crestWaterSurfaceElevationRelativeToUpstreamBed,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Change at Choking"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangeAtChoking,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific-Energy Closure Residual"
              value={formatEngineeringNumber(
                result.specificEnergyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical-Condition Residual"
              value={formatEngineeringNumber(
                result.criticalConditionResidual,
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
