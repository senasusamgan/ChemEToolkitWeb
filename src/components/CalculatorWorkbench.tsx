import {
  renderNativeCalculator,
} from './NativeCalculatorRegistry'

interface CalculatorWorkbenchProps {
  calculatorId: string
  title: string
}

/*
  Runtime calculator routing is delegated to NativeCalculatorRegistry.tsx.
  Historical verifier markers live in scripts/calculator-routing-contract-v1.txt.
*/

export function CalculatorWorkbench({
  calculatorId,
  title,
}: CalculatorWorkbenchProps) {
  const calculator =
    renderNativeCalculator(
      calculatorId,
      title,
    )

  if (
    calculator !== null
  ) {
    return calculator
  }

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          !
        </div>

        <div>
          <p>
            Calculator routing
          </p>

          <h2>
            {title}
          </h2>

          <span>
            Native calculator route unavailable
          </span>
        </div>
      </header>

      <div
        className="native-error"
        role="alert"
      >
        Calculator route {calculatorId} is not registered.
      </div>
    </section>
  )
}
