/**
 * RecentCalculators
 * Recent calculator access cards - Phase 2.3 compact
 */

import type { CalculatorDefinition } from '../../types/calculator'

interface RecentCalculatorsProps {
  recentCalculators: CalculatorDefinition[]
  onOpenCalculator: (calculatorId: string) => void
}

export function RecentCalculators({
  recentCalculators,
  onOpenCalculator,
}: RecentCalculatorsProps) {
  if (recentCalculators.length === 0) {
    return (
      <div className="home-recent-empty">
        <div className="home-card-empty">
          <span className="home-card-empty-icon" aria-hidden="true">
            ↻
          </span>
          <strong>No recent calculators</strong>
          <p>Calculators you open will appear here for quick access.</p>
        </div>
      </div>
    )
  }

  const displayLimit = 3

  return (
    <div className="home-recent">
      <h3 className="home-card-heading">
        Recent
        {recentCalculators.length > displayLimit ? (
          <a href="#calculators" className="home-card-view-all">
            View all →
          </a>
        ) : null}
      </h3>

      <div className="home-calculator-cards">
        {recentCalculators.slice(0, displayLimit).map((calculator) => (
          <button
            key={calculator.id}
            type="button"
            className="home-calculator-card"
            onClick={() => onOpenCalculator(calculator.id)}
          >
            <div className="home-calculator-card-content">
              <div className="home-calculator-card-category">
                {calculator.category}
              </div>
              <div className="home-calculator-card-title">
                {calculator.title}
              </div>
            </div>
            <span className="home-calculator-card-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
