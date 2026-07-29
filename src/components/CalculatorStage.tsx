import type { CalculatorDefinition } from '../types/calculator'
import { CalculatorSearchCombobox } from './CalculatorSearchCombobox'
import { CalculatorWorkbench } from './CalculatorWorkbench'

interface CalculatorStageProps {
  activeCalculator: CalculatorDefinition
  liveCalculators: CalculatorDefinition[]
  onSelect: (calculatorId: string) => void
}

export function CalculatorStage({
  activeCalculator,
  liveCalculators,
  onSelect,
}: CalculatorStageProps) {
  return (
    <section
      className="calculator-stage"
      aria-label={`${activeCalculator.title} workbench`}
    >
      <header className="calculator-stage-toolbar">
        <div className="calculator-stage-label">
          <span>Live calculator</span>
          <small>{activeCalculator.category}</small>
        </div>

        <div className="calculator-stage-desktop-search">
          <CalculatorSearchCombobox
            activeCalculator={activeCalculator}
            calculators={liveCalculators}
            onSelect={onSelect}
          />
        </div>

        <label className="calculator-stage-mobile-select">
          <span className="sr-only">
            Choose a calculator
          </span>

          <select
            aria-label="Choose a live calculator"
            value={activeCalculator.id}
            onChange={(event) =>
              onSelect(event.target.value)
            }
          >
            {liveCalculators.map(
              (calculator) => (
                <option
                  key={calculator.id}
                  value={calculator.id}
                >
                  {calculator.title}
                </option>
              ),
            )}
          </select>
        </label>
      </header>

      <div
        key={activeCalculator.id}
        className="calculator-stage-body"
      >
        <CalculatorWorkbench
          calculatorId={activeCalculator.id}
          title={activeCalculator.title}
        />
      </div>

      <footer className="calculator-stage-footer">
        <span>Verified engineering engine</span>
        <a href="#references">
          Reference basis ↘
        </a>
      </footer>
    </section>
  )
}
