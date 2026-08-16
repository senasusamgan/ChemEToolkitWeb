/**
 * FavoriteCalculators
 * Favorite calculator quick access - Phase 2.3 compact
 */

import type { CalculatorDefinition } from '../../types/calculator'

interface FavoriteCalculatorsProps {
  favoriteCalculators: CalculatorDefinition[]
  onOpenCalculator: (calculatorId: string) => void
}

export function FavoriteCalculators({
  favoriteCalculators,
  onOpenCalculator,
}: FavoriteCalculatorsProps) {
  if (favoriteCalculators.length === 0) {
    return (
      <div className="home-favorites-empty">
        <div className="home-card-empty">
          <span className="home-card-empty-icon" aria-hidden="true">
            ☆
          </span>
          <strong>No saved favorites</strong>
          <p>Star calculators to keep them here for quick access.</p>
        </div>
      </div>
    )
  }

  const displayLimit = 3

  return (
    <div className="home-favorites">
      <h3 className="home-card-heading">
        Saved
        {favoriteCalculators.length > displayLimit ? (
          <a href="#calculators" className="home-card-view-all">
            View all →
          </a>
        ) : null}
      </h3>

      <div className="home-calculator-cards">
        {favoriteCalculators.slice(0, displayLimit).map((calculator) => (
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
