import {
  useState,
} from 'react'
import {
  ActionBar,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'
import {
  PHASE_NINE_DEFINITIONS,
  type PhaseNineCalculatorId,
} from './definitions'

interface PhaseNineNativeCalculatorProps {
  calculatorId: PhaseNineCalculatorId
}

const CATEGORY_REFERENCES: Record<string, string> = {
  'Engineering Fundamentals':
    'Perry’s Chemical Engineers’ Handbook · Engineering fundamentals',
  'Fluid Mechanics':
    'Çengel & Cimbala · Fluid Mechanics',
  'Heat Transfer':
    'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
  'Mass Transfer':
    'Treybal · Mass-Transfer Operations',
  'Material & Energy Balances':
    'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
  'Numerical Methods':
    'Chapra & Canale · Numerical Methods for Engineers',
  'Process Control':
    'Seborg, Edgar, Mellichamp & Doyle · Process Dynamics and Control',
  'Reaction Engineering':
    'Fogler · Elements of Chemical Reaction Engineering',
  'Separation Processes':
    'Wankat · Separation Process Engineering',
  Thermodynamics:
    'Smith, Van Ness & Abbott · Chemical Engineering Thermodynamics',
}

export function PhaseNineNativeCalculator({
  calculatorId,
}: PhaseNineNativeCalculatorProps) {
  const definition =
    PHASE_NINE_DEFINITIONS[
      calculatorId
    ]

  const createInitialInputs =
    () =>
      Object.fromEntries(
        definition.fields.map(
          (field) => [
            field.key,
            String(
              field.initial ?? '',
            ),
          ],
        ),
      )

  const [
    inputs,
    setInputs,
  ] = useState<
    Record<string, string>
  >(
    createInitialInputs,
  )

  const [
    result,
    setResult,
  ] = useState<
    number | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function calculate() {
    const values =
      Object.fromEntries(
        Object.entries(
          inputs,
        ).map(
          ([
            key,
            value,
          ]) => [
            key,
            Number(value),
          ],
        ),
      )

    if (
      Object.values(
        values,
      ).some(
        (value) =>
          !Number.isFinite(
            value,
          ),
      )
    ) {
      setResult(null)
      setErrorMessage(
        'Enter finite numeric values for every input.',
      )
      return
    }

    try {
      const nextResult =
        definition.calculate(
          values,
        )

      if (
        typeof nextResult !==
          'number' ||
        !Number.isFinite(
          nextResult,
        )
      ) {
        throw new Error(
          'Non-finite result',
        )
      }

      setResult(
        nextResult,
      )

      setErrorMessage('')
    } catch {
      setResult(null)
      setErrorMessage(
        'The supplied values are outside the valid range of this engineering relation.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createInitialInputs(),
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInputs(
      Object.fromEntries(
        definition.fields.map(
          (field) => [
            field.key,
            '',
          ],
        ),
      ),
    )
    setResult(null)
    setErrorMessage('')
  }

  const interpretation =
    result !== null &&
    definition.interpret
      ? definition.interpret(
          result,
        )
      : 'Verified numerical relation migrated to the native workspace.'

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          {definition.mark ?? '∑'}
        </div>

        <div>
          <p>
            {definition.category}
            {definition.code
              ? ` · ${definition.code}`
              : ''}
          </p>

          <h2>
            {definition.title}
          </h2>

          <span>
            Native engineering calculator
          </span>
        </div>
      </header>

      <ReferenceBasis>
        {CATEGORY_REFERENCES[
          definition.category
        ] ??
          'ChemE Toolkit verified engineering reference basis'}
      </ReferenceBasis>

      <div className="native-formula">
        {definition.formula}
      </div>

      <div className="native-input-grid">
        {definition.fields.map(
          (field) => (
            <NumericInput
              key={field.key}
              label={field.label}
              value={
                inputs[
                  field.key
                ] ?? ''
              }
              unit={
                field.unit ?? '—'
              }
              onChange={(
                value,
              ) =>
                setInputs(
                  (
                    current,
                  ) => ({
                    ...current,
                    [field.key]:
                      value,
                  }),
                )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Calculate"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result !== null ? (
        <ResultPanel
          headlineLabel={
            definition.outputLabel
          }
          headlineValue={`${formatEngineeringNumber(
            result,
          )}${
            definition.outputUnit
              ? ` ${definition.outputUnit}`
              : ''
          }`}
          modelName={
            definition.code ??
            calculatorId
          }
          note="The numerical relation is preserved directly from the verified legacy calculator definition."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              interpretation
            }
            unit="—"
          />

          <ResultItem
            label="Migration basis"
            value="Verified calculation source preserved"
            unit="native"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
