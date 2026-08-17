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
  SecondFiveCalculatorError,
  calculateSecondFiveCalculator,
  getSecondFiveCalculatorDefinition,
  type SecondFiveNativeCalculatorId,
} from './engine'

interface SecondFiveLegacyNativeCalculatorProps {
  calculatorId: SecondFiveNativeCalculatorId
}

export function SecondFiveLegacyNativeCalculator({
  calculatorId,
}: SecondFiveLegacyNativeCalculatorProps) {
  const definition =
    getSecondFiveCalculatorDefinition(
      calculatorId,
    )

  const createExampleInputs =
    () =>
      Object.fromEntries(
        definition.fields.map(
          (field) => [
            field.key,
            field.initial,
          ],
        ),
      )

  const [
    inputs,
    setInputs,
  ] = useState<
    Record<string, string>
  >(
    createExampleInputs,
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
    try {
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

      setResult(
        calculateSecondFiveCalculator(
          calculatorId,
          values,
        ),
      )

      setErrorMessage('')
    } catch (error) {
      setResult(null)

      setErrorMessage(
        error instanceof
          SecondFiveCalculatorError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createExampleInputs(),
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
          {definition.icon}
        </div>

        <div>
          <p>
            {definition.category}
            {' · '}
            {definition.code}
          </p>

          <h2>
            {definition.title}
          </h2>

          <span>
            {definition.subtitle}
          </span>
        </div>
      </header>

      <ReferenceBasis>
        {definition.referenceBasis}
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
              unit={field.unit}
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
          )} ${definition.outputUnit}`}
          modelName={
            definition.code
          }
          note="Native migration preserves the verified legacy numerical relation."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              definition.interpret(
                result,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Calculation basis"
            value="Verified legacy relation"
            unit="SI / stated units"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
