import {
  useState,
} from 'react'

import {
  TrapezoidalChannelBedRiseCrestDepthError,
  calculateTrapezoidalChannelBedRiseCrestDepth,
  createTrapezoidalChannelBedRiseCrestDepthCsv,
} from './engine'

import type {
  TrapezoidalChannelBedRiseCrestDepthInput,
  TrapezoidalChannelBedRiseCrestDepthResult,
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

export function TrapezoidalChannelBedRiseCrestDepthCalculator() {
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
      TrapezoidalChannelBedRiseCrestDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelBedRiseCrestDepthInput | null
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
    TrapezoidalChannelBedRiseCrestDepthInput {
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
        calculateTrapezoidalChannelBedRiseCrestDepth(
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
          TrapezoidalChannelBedRiseCrestDepthError
          ? error.message
          : 'The trapezoidal hump-flow calculation could not be completed.',
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
      createTrapezoidalChannelBedRiseCrestDepthCsv(
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
      'trapezoidal-bed-rise-crest-depth.csv'

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
        code="FM–54"
        icon="≈"
        title="Trapezoidal Channel Flow over a Bed Rise"
        subtitle="Solve crest depths and determine whether a specified hump causes open-channel choking"
      />

      <ReferenceBasis>
        Calculator 437 evaluates a specified
        bed rise against the critical choking
        limit from Calculator 436. For an
        unchoked state it solves both the
        subcritical physical crest depth and
        the alternate supercritical
        specific-energy root.
      </ReferenceBasis>

      <div className="native-formula">
        E
        <sub>crest</sub>
        =
        E₁ − Δz
        &nbsp;&nbsp;·&nbsp;&nbsp;
        E =
        y +
        V²/(2g)
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
        calculateLabel="Analyze bed rise"
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
            headlineLabel="Flow status"
            headlineValue={result.flowStatus}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Specified Bed Rise"
              value={formatEngineeringNumber(
                result.specifiedBedRise,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Bed Rise Before Choking"
              value={formatEngineeringNumber(
                result.maximumBedRiseBeforeChoking,
              )}
              unit="m"
            />

            <ResultItem
              label="Remaining Bed-Rise Margin"
              value={formatEngineeringNumber(
                result.remainingBedRiseMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed-Rise Limit Used"
              value={formatEngineeringNumber(
                result.bedRiseUtilizationRatio *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Nominal Crest Specific Energy"
              value={formatEngineeringNumber(
                result.nominalCrestSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth"
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

            {result.subcriticalCrestDepth !== null ? (
              <ResultItem
                label="Subcritical Crest Depth"
                value={formatEngineeringNumber(
                  result.subcriticalCrestDepth,
                )}
                unit="m"
              />
            ) : null}

            {result.subcriticalCrestVelocity !== null ? (
              <ResultItem
                label="Subcritical Crest Velocity"
                value={formatEngineeringNumber(
                  result.subcriticalCrestVelocity,
                )}
                unit="m/s"
              />
            ) : null}

            {result.subcriticalCrestFroudeNumber !== null ? (
              <ResultItem
                label="Subcritical Crest Froude Number"
                value={formatEngineeringNumber(
                  result.subcriticalCrestFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.supercriticalAlternateDepth !== null ? (
              <ResultItem
                label="Supercritical Alternate Depth"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateDepth,
                )}
                unit="m"
              />
            ) : null}

            {result.supercriticalAlternateVelocity !== null ? (
              <ResultItem
                label="Supercritical Alternate Velocity"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateVelocity,
                )}
                unit="m/s"
              />
            ) : null}

            {result.supercriticalAlternateFroudeNumber !== null ? (
              <ResultItem
                label="Supercritical Alternate Froude Number"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.crestWaterSurfaceElevationChange !== null ? (
              <ResultItem
                label="Crest Water-Surface Change"
                value={formatEngineeringNumber(
                  result.crestWaterSurfaceElevationChange,
                )}
                unit="m"
              />
            ) : null}

            <ResultItem
              label="Additional Specific Energy Required"
              value={formatEngineeringNumber(
                result.additionalSpecificEnergyRequired,
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
