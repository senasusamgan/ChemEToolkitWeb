import type { CalculatorDefinition } from '../types/calculator'
import { CalculatorSearchCombobox } from './CalculatorSearchCombobox'
import { CalculatorWorkbench } from './CalculatorWorkbench'
import { CalculationExportPanel } from './CalculationExportPanel'
import { CalculationHistoryPanel } from './CalculationHistoryPanel'
import { CalculationComparisonPanel } from './CalculationComparisonPanel'

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

        <CalculatorSearchCombobox
          activeCalculator={activeCalculator}
          calculators={liveCalculators}
          onSelect={onSelect}
        />
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

      <CalculationExportPanel
        calculator={activeCalculator}
      />

      <CalculationHistoryPanel
        calculator={activeCalculator}
        onOpenCalculator={onSelect}
      />

      <CalculationComparisonPanel
        calculator={activeCalculator}
      />

      <footer className="calculator-stage-footer">
        <span>Verified engineering engine</span>
        <a href="#references">
          Reference basis ↘
        </a>
      </footer>
    </section>
  )
}
