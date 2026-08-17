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
  PHASE_TEN_THERMODYNAMICS_DEFINITIONS,
  type PhaseTenThermodynamicsCalculatorId,
} from './definitions'

interface Props {
  calculatorId: PhaseTenThermodynamicsCalculatorId
}

export function PhaseTenThermodynamicsCalculator({
  calculatorId,
}: Props) {
  const definition =
    PHASE_TEN_THERMODYNAMICS_DEFINITIONS[
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
          'number'
        || !Number.isFinite(
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
        'The supplied values are outside the valid range of this thermodynamic relation.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createInputs(),
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

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          {definition.mark ?? 'T'}
        </div>

        <div>
          <p>
            Thermodynamics
            {definition.code
              ? ` · ${definition.code}`
              : ''}
          </p>

          <h2>
            {definition.title}
          </h2>

          <span>
            Native thermodynamics calculator
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Smith, Van Ness & Abbott · Chemical Engineering Thermodynamics
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
          note="The verified legacy numerical relation is preserved in the native workspace."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              definition.interpret
                ? definition.interpret(
                    result,
                  )
                : 'Thermodynamic relation evaluated on the stated basis.'
            }
            unit="—"
          />

          <ResultItem
            label="Reference family"
            value="Smith, Van Ness & Abbott"
            unit="native"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
