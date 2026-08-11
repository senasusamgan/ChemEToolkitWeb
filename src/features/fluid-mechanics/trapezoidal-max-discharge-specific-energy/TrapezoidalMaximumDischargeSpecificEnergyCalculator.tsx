import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumDischargeSpecificEnergyError,
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
  createTrapezoidalMaximumDischargeSpecificEnergyCsv,
} from './engine'

import type {
  TrapezoidalMaximumDischargeSpecificEnergyInput,
  TrapezoidalMaximumDischargeSpecificEnergyResult,
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

  availableSpecificEnergy:
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
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function TrapezoidalMaximumDischargeSpecificEnergyCalculator() {
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
      TrapezoidalMaximumDischargeSpecificEnergyResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumDischargeSpecificEnergyInput | null
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
    TrapezoidalMaximumDischargeSpecificEnergyInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      availableSpecificEnergy:
        Number(
          form.availableSpecificEnergy,
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
        calculateTrapezoidalMaximumDischargeSpecificEnergy(
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
          TrapezoidalMaximumDischargeSpecificEnergyError
          ? error.message
          : 'The critical-flow maximum-discharge calculation could not be completed.',
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
      createTrapezoidalMaximumDischargeSpecificEnergyCsv(
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
      'trapezoidal-maximum-discharge-specific-energy.csv'

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
        code="FM–51"
        icon="≈"
        title="Maximum Trapezoidal Discharge from Specific Energy"
        subtitle="Determine the critical-flow discharge capacity and choking limit of a trapezoidal channel section"
      />

      <ReferenceBasis>
        Calculator 434 determines the
        maximum discharge compatible with
        the available specific energy. At this
        limiting state the section operates at
        critical flow with Froude number equal
        to one.
      </ReferenceBasis>

      <div className="native-formula">
        E =
        y
        <sub>c</sub>
        +
        A
        <sub>c</sub>
        /(2T
        <sub>c</sub>
        )
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q
        <sub>max</sub>
        =
        √(gA
        <sub>c</sub>
        ³/T
        <sub>c</sub>
        )
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
        calculateLabel="Calculate maximum discharge"
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
            headlineLabel="Maximum volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.maximumVolumetricFlowRate,
            )} m³/s`}
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
              label="Maximum Flow Rate"
              value={formatEngineeringNumber(
                result.maximumVolumetricFlowRateCubicMetersPerHour,
              )}
              unit="m³/h"
            />

            <ResultItem
              label="Maximum Mass Flow Rate"
              value={formatEngineeringNumber(
                result.maximumMassFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Discharge per Unit Top Width"
              value={formatEngineeringNumber(
                result.dischargePerUnitTopWidth,
              )}
              unit="m²/s"
            />

            <ResultItem
              label="Critical Depth / Specific Energy"
              value={formatEngineeringNumber(
                result.criticalDepthToEnergyRatio,
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
              label="Forward Critical Depth"
              value={formatEngineeringNumber(
                result.forwardCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth Closure Residual"
              value={formatEngineeringNumber(
                result.criticalDepthClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Solver Iterations"
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
