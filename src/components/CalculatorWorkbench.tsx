import {
  Suspense,
} from 'react'

import {
  getNativeCalculatorComponent,
} from './NativeCalculatorRegistry'

interface CalculatorWorkbenchProps {
  calculatorId: string
  title: string
}

export function CalculatorWorkbench({
  calculatorId,
  title,
}: CalculatorWorkbenchProps) {
  const NativeCalculator =
    getNativeCalculatorComponent(
      calculatorId,
    )

  if (NativeCalculator) {
    return (
      <Suspense
        fallback={
          <section
            className="native-calculator"
            aria-busy="true"
          >
            <div className="native-error">
              Loading calculator…
            </div>
          </section>
        }
      >
        <NativeCalculator
          calculatorId={calculatorId}
          title={title}
        />
      </Suspense>
    )
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
