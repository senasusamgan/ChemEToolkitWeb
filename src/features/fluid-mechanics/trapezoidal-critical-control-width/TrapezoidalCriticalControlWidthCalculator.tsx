import {
  useState,
} from 'react'

import {
  TrapezoidalCriticalControlWidthError,
  calculateTrapezoidalCriticalControlWidth,
  createTrapezoidalCriticalControlWidthCsv,
} from './engine'

import type {
  TrapezoidalCriticalControlWidthInput,
  TrapezoidalCriticalControlWidthResult,
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

  availableSpecificEnergy:
    '1.2',

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
      'availableSpecificEnergy',

    label:
      'Available Specific Energy',

    symbol:
      'E',

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
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function TrapezoidalCriticalControlWidthCalculator() {
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
      TrapezoidalCriticalControlWidthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalCriticalControlWidthInput | null
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
    TrapezoidalCriticalControlWidthInput {
    return {
      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      availableSpecificEnergy:
        Number(
          form.availableSpecificEnergy,
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
        calculateTrapezoidalCriticalControlWidth(
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
          TrapezoidalCriticalControlWidthError
          ? error.message
          : 'The critical-control width calculation could not be completed.',
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
      createTrapezoidalCriticalControlWidthCsv(
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
      'trapezoidal-critical-control-width.csv'

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
        code="FM–52"
        icon="≈"
        title="Required Trapezoidal Critical-Control Width"
        subtitle="Size the bottom width required to pass a specified discharge at the critical-flow specific-energy limit"
      />

      <ReferenceBasis>
        Calculator 435 inverses the
        critical-flow capacity calculation.
        It determines the positive bottom width
        for which the requested discharge is
        exactly the maximum discharge supported
        by the available specific energy.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        Q
        <sub>max</sub>
        (b,E,z)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Fr
        <sub>c</sub>
        = 1
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
        calculateLabel="Size critical-control width"
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
            headlineLabel="Required bottom width"
            headlineValue={`${formatEngineeringNumber(
              result.requiredBottomWidth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
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
              label="Critical Top Width"
              value={formatEngineeringNumber(
                result.criticalTopWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Hydraulic Depth"
              value={formatEngineeringNumber(
                result.criticalHydraulicDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Velocity"
              value={formatEngineeringNumber(
                result.criticalVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Critical Froude Number"
              value={formatEngineeringNumber(
                result.criticalFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Bottom Width / Critical Depth"
              value={formatEngineeringNumber(
                result.bottomWidthToCriticalDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Zero-Width Limiting Capacity"
              value={formatEngineeringNumber(
                result.zeroBottomWidthCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Capacity Margin Above Zero-Width Limit"
              value={formatEngineeringNumber(
                result.capacityMarginAboveZeroWidthLimit,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Reconstructed Maximum Flow"
              value={formatEngineeringNumber(
                result.reconstructedMaximumFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Flow Closure Residual"
              value={formatEngineeringNumber(
                result.flowClosureResidual,
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
              label="Recovered Specific Energy"
              value={formatEngineeringNumber(
                result.recoveredSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Residual"
              value={formatEngineeringNumber(
                result.specificEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Condition Residual"
              value={formatEngineeringNumber(
                result.criticalConditionResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Design Mass Flow Rate"
              value={formatEngineeringNumber(
                result.designMassFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Width Solver Iterations"
              value={String(
                result.solverIterations,
              )}
              unit=""
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
