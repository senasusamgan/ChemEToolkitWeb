/**
 * HomeSearch
 * Global calculator search for homepage
 */

import { useMemo, useState } from 'react'
import type { CalculatorDefinition } from '../../types/calculator'

interface HomeSearchProps {
  calculators: CalculatorDefinition[]
  onOpenCalculator: (calculatorId: string) => void
}

export function HomeSearch({ calculators, onOpenCalculator }: HomeSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const searchResults = useMemo(() => {
    const searchTerm = query.trim().toLowerCase()

    if (searchTerm.length === 0) {
      return []
    }

    return calculators
      .filter(
        (calculator) =>
          calculator.available &&
          (calculator.title.toLowerCase().includes(searchTerm) ||
            calculator.category.toLowerCase().includes(searchTerm)),
      )
      .slice(0, 8)
  }, [query, calculators])

  const showResults = isFocused && query.trim().length > 0

  return (
    <div className="home-search">
      <label htmlFor="home-search-input" className="home-search-label">
        What do you want to calculate?
      </label>

      <div className="home-search-box">
        <span className="home-search-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          id="home-search-input"
          type="search"
          className="home-search-input"
          placeholder="Search equations, properties, equipment, or calculator names…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200)
          }}
        />

        {query && (
          <button
            type="button"
            className="home-search-clear"
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            ×
          </button>
        )}
      </div>

      {showResults && (
        <div className="home-search-results" role="listbox">
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((calculator) => (
                <button
                  key={calculator.id}
                  type="button"
                  className="home-search-result"
                  role="option"
                  onClick={() => {
                    onOpenCalculator(calculator.id)
                    setQuery('')
                  }}
                >
                  <div>
                    <strong>{calculator.title}</strong>
                    <span>{calculator.category}</span>
                  </div>
                  <span className="home-search-result-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="home-search-empty">
              <span>No calculators found for "{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
