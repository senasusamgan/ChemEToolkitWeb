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
  PHASE_TWELVE_DEFINITIONS,
  type PhaseTwelveCalculatorId,
} from './definitions'

interface Props {
  calculatorId: PhaseTwelveCalculatorId
}

const REFERENCES: Record<string, string> = {
  'Engineering Fundamentals':
    'Perry’s Chemical Engineers’ Handbook',
  'Fluid Mechanics':
    'Çengel & Cimbala · Fluid Mechanics',
  'Heat Transfer':
    'Incropera et al. · Fundamentals of Heat and Mass Transfer',
  'Mass Transfer':
    'Treybal · Mass-Transfer Operations',
  'Material & Energy Balances':
    'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
  'Numerical Methods':
    'Chapra & Canale · Numerical Methods for Engineers',
  'Process Control':
    'Seborg et al. · Process Dynamics and Control',
  'Reaction Engineering':
    'Fogler · Elements of Chemical Reaction Engineering',
  'Separation Processes':
    'Wankat · Separation Process Engineering',
}

export function PhaseTwelveNativeCalculator({
  calculatorId,
}: Props) {
  const definition =
    PHASE_TWELVE_DEFINITIONS[
      calculatorId
    ]

  const createInputs =
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
  >(createInputs)

  const [
    result,
    setResult,
  ] = useState<
    number | null
  >(null)

  const [
    error,
    setError,
  ] = useState('')

  function calculate() {
    const values =
      Object.fromEntries(
        Object.entries(
          inputs,
        ).map(
          ([key, value]) => [
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
      setError(
        'Enter finite numeric values for every input.',
      )
      return
    }

    try {
      const next =
        definition.calculate(
          values,
        )

      if (
        typeof next !==
          'number'
        ||
        !Number.isFinite(
          next,
        )
      ) {
        throw new Error()
      }

      setResult(next)
      setError('')
    } catch {
      setResult(null)
      setError(
        'The supplied values are outside the valid range of this engineering relation.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createInputs(),
    )
    setResult(null)
    setError('')
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
    setError('')
  }

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
        {REFERENCES[
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

      {error ? (
        <div
          className="native-error"
          role="alert"
        >
          {error}
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
          note="Verified legacy numerical behavior preserved in the native workspace."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              definition.interpret
                ? definition.interpret(
                    result,
                  )
                : 'Verified engineering relation evaluated.'
            }
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
