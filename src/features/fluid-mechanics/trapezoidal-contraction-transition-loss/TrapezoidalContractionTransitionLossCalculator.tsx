import {
  useState,
} from 'react'

import {
  TrapezoidalContractionTransitionLossError,
  calculateTrapezoidalContractionTransitionLoss,
  createTrapezoidalContractionTransitionLossCsv,
} from './engine'

import type {
  TrapezoidalContractionTransitionLossInput,
  TrapezoidalContractionTransitionLossResult,
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
  upstreamBottomWidth:
    '3',

  contractedBottomWidth:
    '2',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  upstreamFlowDepth:
    '1.2',

  transitionLossCoefficient:
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
      'upstreamBottomWidth',

    label:
      'Upstream Bottom Width',

    symbol:
      'b₁',

    unit:
      'm',
  },
  {
    key:
      'contractedBottomWidth',

    label:
      'Contracted Bottom Width',

    symbol:
      'b₂',

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
      'transitionLossCoefficient',

    label:
      'Transition Loss Coefficient',

    symbol:
      'Kₗ',

    unit:
      '-',
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

export function TrapezoidalContractionTransitionLossCalculator() {
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
      TrapezoidalContractionTransitionLossResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalContractionTransitionLossInput | null
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
    TrapezoidalContractionTransitionLossInput {
    return {
      upstreamBottomWidth:
        Number(
          form.upstreamBottomWidth,
        ),

      contractedBottomWidth:
        Number(
          form.contractedBottomWidth,
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

      transitionLossCoefficient:
        Number(
          form.transitionLossCoefficient,
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
        calculateTrapezoidalContractionTransitionLoss(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          TrapezoidalContractionTransitionLossError
          ? error.message
          : 'The transition-loss contraction calculation could not be completed.',
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

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

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
      createTrapezoidalContractionTransitionLossCsv(
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
      'trapezoidal-contraction-transition-loss.csv'

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
        code="FM–58"
        icon="≈"
        title="Trapezoidal Contraction with Transition Loss"
        subtitle="Analyze contraction throat depths and choking limits with a velocity-head transition-loss coefficient"
      />

      <ReferenceBasis>
        Calculator 441 extends the ideal
        contraction model by including
        hL = KL·V²/(2g). The resulting
        minimum-energy control state shifts
        from Fr = 1 to
        Fr = 1/√(1 + KL).
      </ReferenceBasis>

      <div className="native-formula">
        E₁ =
        y₂ +
        (1 + K
        <sub>L</sub>
        )V₂²/(2g)
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
        calculateLabel="Analyze transition loss"
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
            headlineLabel="Loss-adjusted throat status"
            headlineValue={
              result.throatStatus
            }
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Lossless Minimum Width"
              value={formatEngineeringNumber(
                result.losslessMinimumContractedBottomWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss-Adjusted Minimum Width"
              value={formatEngineeringNumber(
                result.lossAdjustedMinimumContractedBottomWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss Penalty Width"
              value={formatEngineeringNumber(
                result.lossPenaltyWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Remaining Width Margin"
              value={formatEngineeringNumber(
                result.remainingWidthMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Width-Limit Utilization"
              value={formatEngineeringNumber(
                result.widthLimitUtilizationPercent,
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
              label="Loss-Adjusted Control Depth"
              value={formatEngineeringNumber(
                result.lossAdjustedControlDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Control Froude Number"
              value={formatEngineeringNumber(
                result.lossAdjustedControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Theoretical Control Froude"
              value={formatEngineeringNumber(
                result.theoreticalControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Control Transition-Loss Head"
              value={formatEngineeringNumber(
                result.controlTransitionLossHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Required Specific Energy"
              value={formatEngineeringNumber(
                result.minimumRequiredUpstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Available Energy Margin"
              value={formatEngineeringNumber(
                result.availableSpecificEnergyMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Additional Energy Required"
              value={formatEngineeringNumber(
                result.additionalSpecificEnergyRequired,
              )}
              unit="m"
            />

            {result.subcriticalThroatDepth !== null ? (
              <ResultItem
                label="Subcritical Throat Depth"
                value={formatEngineeringNumber(
                  result.subcriticalThroatDepth,
                )}
                unit="m"
              />
            ) : null}

            {result.subcriticalThroatVelocity !== null ? (
              <ResultItem
                label="Subcritical Throat Velocity"
                value={formatEngineeringNumber(
                  result.subcriticalThroatVelocity,
                )}
                unit="m/s"
              />
            ) : null}

            {result.subcriticalThroatFroudeNumber !== null ? (
              <ResultItem
                label="Subcritical Throat Froude Number"
                value={formatEngineeringNumber(
                  result.subcriticalThroatFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.subcriticalTransitionLossHead !== null ? (
              <ResultItem
                label="Subcritical Transition-Loss Head"
                value={formatEngineeringNumber(
                  result.subcriticalTransitionLossHead,
                )}
                unit="m"
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

            {result.supercriticalAlternateFroudeNumber !== null ? (
              <ResultItem
                label="Supercritical Alternate Froude Number"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.supercriticalTransitionLossHead !== null ? (
              <ResultItem
                label="Supercritical Transition-Loss Head"
                value={formatEngineeringNumber(
                  result.supercriticalTransitionLossHead,
                )}
                unit="m"
              />
            ) : null}

            {result.waterSurfaceElevationChange !== null ? (
              <ResultItem
                label="Water-Surface Elevation Change"
                value={formatEngineeringNumber(
                  result.waterSurfaceElevationChange,
                )}
                unit="m"
              />
            ) : null}

            <ResultItem
              label="Control-Condition Residual"
              value={formatEngineeringNumber(
                result.controlConditionResidual,
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
