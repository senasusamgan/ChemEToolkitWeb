import {
  useState,
} from 'react'

import {
  DarcyWeisbachPipeDiameterSizingError,
  PipeHydraulicsCoreError,
  calculateDarcyWeisbachPipeDiameterSizing,
  createDarcyWeisbachPipeDiameterSizingCsv,
} from './engine'

import type {
  DarcyWeisbachPipeDiameterSizingInput,
  DarcyWeisbachPipeDiameterSizingResult,
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
  pipeLength: '100',

  fluidDensity: '998',
  dynamicViscosity: '0.001',

  absoluteRoughness: '0.000045',
  minorLossCoefficient: '5',

  targetPressureDrop: '100000',
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
    key: 'pipeLength',
    label: 'Pipe Length',
    symbol: 'L',
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
    key: 'minorLossCoefficient',
    label: 'Total Minor-Loss Coefficient',
    symbol: 'ΣK',
    unit: '-',
  },
  {
    key: 'targetPressureDrop',
    label: 'Allowable Pressure Drop',
    symbol: 'ΔPtarget',
    unit: 'Pa',
  },
]

export function DarcyWeisbachPipeDiameterSizingCalculator() {
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
      DarcyWeisbachPipeDiameterSizingResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      DarcyWeisbachPipeDiameterSizingInput | null
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
    DarcyWeisbachPipeDiameterSizingInput {
    return {
      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      pipeLength:
        Number(
          form.pipeLength,
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

      minorLossCoefficient:
        Number(
          form.minorLossCoefficient,
        ),

      targetPressureDrop:
        Number(
          form.targetPressureDrop,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateDarcyWeisbachPipeDiameterSizing(
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
          DarcyWeisbachPipeDiameterSizingError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The required pipe diameter could not be solved.',
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
      createDarcyWeisbachPipeDiameterSizingCsv(
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
      'darcy-weisbach-pipe-diameter-sizing.csv'

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
        code="FM–18"
        icon="≈"
        title="Darcy–Weisbach Pipe Diameter Sizing"
        subtitle="Solve required internal pipe diameter from allowable pressure drop"
      />

      <ReferenceBasis>
        The diameter is solved iteratively
        from the Darcy–Weisbach equation.
        Major pipe friction and a lumped
        minor-loss coefficient are included.
        Friction factor is updated with
        Reynolds number and relative
        roughness at every diameter trial.
      </ReferenceBasis>

      <div className="native-formula">
        ΔP =
        (f L/D + ΣK) ρv²/2 ·
        v = 4Q/(πD²)
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
        calculateLabel="Solve required pipe diameter"
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
            headlineLabel="Required internal diameter"
            headlineValue={`${formatEngineeringNumber(
              result.requiredDiameterMillimeters,
            )} mm`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Diameter"
              value={formatEngineeringNumber(
                result.requiredDiameter,
              )}
              unit="m"
            />

            <ResultItem
              label="Diameter"
              value={formatEngineeringNumber(
                result.requiredDiameterInches,
              )}
              unit="in"
            />

            <ResultItem
              label="Mean Velocity"
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

            <ResultItem
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Friction Pressure Drop"
              value={formatEngineeringNumber(
                result.frictionPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Minor-Loss Pressure Drop"
              value={formatEngineeringNumber(
                result.minorPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Total Pressure Drop"
              value={formatEngineeringNumber(
                result.totalPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Total Head Loss"
              value={formatEngineeringNumber(
                result.totalHeadLoss,
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
