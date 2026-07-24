import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/calculator-search.css'

interface CalculatorSearchComboboxProps {
  activeCalculator: CalculatorDefinition
  calculators: CalculatorDefinition[]
  onSelect: (calculatorId: string) => void
}

const RECENT_STORAGE_KEY =
  'cheme-toolkit.recent-calculators.v1'
const MAXIMUM_RECENT_CALCULATORS = 5

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function CalculatorSearchCombobox({
  activeCalculator,
  calculators,
  onSelect,
}: CalculatorSearchComboboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(
    activeCalculator.title,
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentIds, setRecentIds] =
    useState<string[]>([])

  const calculatorsById = useMemo(
    () =>
      new Map(
        calculators.map((calculator) => [
          calculator.id,
          calculator,
        ]),
      ),
    [calculators],
  )

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(
        RECENT_STORAGE_KEY,
      )

      if (!saved) {
        return
      }

      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        setRecentIds(
          parsed.filter(
            (value): value is string =>
              typeof value === 'string',
          ),
        )
      }
    } catch {
      setRecentIds([])
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQuery(activeCalculator.title)
    }
  }, [activeCalculator.title, isOpen])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (
        target instanceof Node &&
        !rootRef.current?.contains(target)
      ) {
        setIsOpen(false)
        setQuery(activeCalculator.title)
      }
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    )

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )
    }
  }, [activeCalculator.title])

  const normalizedQuery = normalize(query)

  const filteredCalculators = useMemo(() => {
    if (!normalizedQuery) {
      return calculators
    }

    return calculators.filter((calculator) => {
      const searchableText = normalize(
        `${calculator.title} ${calculator.category}`,
      )

      return searchableText.includes(normalizedQuery)
    })
  }, [calculators, normalizedQuery])

  const recentCalculators = useMemo(() => {
    if (normalizedQuery) {
      return []
    }

    return recentIds
      .map((calculatorId) =>
        calculatorsById.get(calculatorId),
      )
      .filter(
        (
          calculator,
        ): calculator is CalculatorDefinition =>
          calculator !== undefined,
      )
      .slice(0, MAXIMUM_RECENT_CALCULATORS)
  }, [
    calculatorsById,
    normalizedQuery,
    recentIds,
  ])

  const recentCalculatorIds = useMemo(
    () =>
      new Set(
        recentCalculators.map(
          (calculator) => calculator.id,
        ),
      ),
    [recentCalculators],
  )

  const categoryGroups = useMemo(() => {
    const groups = new Map<
      string,
      CalculatorDefinition[]
    >()

    for (const calculator of filteredCalculators) {
      if (recentCalculatorIds.has(calculator.id)) {
        continue
      }

      const existing =
        groups.get(calculator.category) ?? []

      existing.push(calculator)
      groups.set(calculator.category, existing)
    }

    return [...groups.entries()]
  }, [filteredCalculators, recentCalculatorIds])

  const visibleCalculators = useMemo(
    () => [
      ...recentCalculators,
      ...categoryGroups.flatMap(
        ([, groupCalculators]) =>
          groupCalculators,
      ),
    ],
    [categoryGroups, recentCalculators],
  )

  useEffect(() => {
    if (visibleCalculators.length === 0) {
      setActiveIndex(0)
      return
    }

    setActiveIndex((currentIndex) =>
      currentIndex >= visibleCalculators.length
        ? 0
        : currentIndex,
    )
  }, [visibleCalculators.length])

  function rememberCalculator(
    calculatorId: string,
  ) {
    setRecentIds((currentIds) => {
      const nextIds = [
        calculatorId,
        ...currentIds.filter(
          (currentId) =>
            currentId !== calculatorId,
        ),
      ].slice(0, MAXIMUM_RECENT_CALCULATORS)

      try {
        window.localStorage.setItem(
          RECENT_STORAGE_KEY,
          JSON.stringify(nextIds),
        )
      } catch {
        // The selector still works when storage is unavailable.
      }

      return nextIds
    })
  }

  function selectCalculator(
    calculator: CalculatorDefinition,
  ) {
    rememberCalculator(calculator.id)
    setQuery(calculator.title)
    setIsOpen(false)
    onSelect(calculator.id)
  }

  function openSearch() {
    setIsOpen(true)
    setQuery('')
    setActiveIndex(0)

    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  function closeSearch() {
    setIsOpen(false)
    setQuery(activeCalculator.title)
  }

  function handleInputFocus() {
    if (!isOpen) {
      openSearch()
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeSearch()
      inputRef.current?.blur()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (!isOpen) {
        openSearch()
        return
      }

      if (visibleCalculators.length > 0) {
        setActiveIndex(
          (currentIndex) =>
            (
              currentIndex + 1
            ) % visibleCalculators.length,
        )
      }

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        openSearch()
        return
      }

      if (visibleCalculators.length > 0) {
        setActiveIndex(
          (currentIndex) =>
            (
              currentIndex -
              1 +
              visibleCalculators.length
            ) % visibleCalculators.length,
        )
      }

      return
    }

    if (
      event.key === 'Enter' &&
      isOpen &&
      visibleCalculators[activeIndex]
    ) {
      event.preventDefault()
      selectCalculator(
        visibleCalculators[activeIndex],
      )
    }
  }

  function optionId(calculatorId: string) {
    return `calculator-option-${calculatorId}`
  }

  function renderOption(
    calculator: CalculatorDefinition,
    index: number,
  ) {
    const isActive = index === activeIndex
    const isSelected =
      calculator.id === activeCalculator.id

    return (
      <button
        type="button"
        id={optionId(calculator.id)}
        className="calculator-search-option"
        data-active={isActive}
        data-selected={isSelected}
        role="option"
        aria-selected={isSelected}
        key={calculator.id}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={(event) =>
          event.preventDefault()
        }
        onClick={() =>
          selectCalculator(calculator)
        }
      >
        <span className="calculator-search-option-copy">
          <strong>{calculator.title}</strong>
          <small>{calculator.category}</small>
        </span>

        {isSelected ? (
          <span
            className="calculator-search-check"
            aria-hidden="true"
          >
            ✓
          </span>
        ) : (
          <span
            className="calculator-search-arrow"
            aria-hidden="true"
          >
            →
          </span>
        )}
      </button>
    )
  }

  let runningIndex = 0

  return (
    <div
      className="calculator-search"
      ref={rootRef}
    >
      <div
        className="calculator-search-control"
        data-open={isOpen}
      >
        <span
          className="calculator-search-icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search live calculators"
          aria-expanded={isOpen}
          aria-controls="calculator-search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen &&
            visibleCalculators[activeIndex]
              ? optionId(
                  visibleCalculators[activeIndex].id,
                )
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder="Search calculators or disciplines"
          onFocus={handleInputFocus}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            setActiveIndex(0)
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className="calculator-search-toggle"
          aria-label={
            isOpen
              ? 'Close calculator search'
              : 'Open calculator search'
          }
          aria-expanded={isOpen}
          onClick={() =>
            isOpen
              ? closeSearch()
              : openSearch()
          }
        >
          <span aria-hidden="true">
            {isOpen ? '⌃' : '⌄'}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          id="calculator-search-listbox"
          className="calculator-search-menu"
          role="listbox"
          aria-label="Live calculators"
        >
          <div className="calculator-search-summary">
            <span>
              {filteredCalculators.length}{' '}
              matching calculator
              {filteredCalculators.length === 1
                ? ''
                : 's'}
            </span>
            <small>
              ↑ ↓ navigate · Enter select · Esc close
            </small>
          </div>

          {visibleCalculators.length === 0 ? (
            <div className="calculator-search-empty">
              <strong>No calculator found</strong>
              <span>
                Try a calculator title or discipline,
                such as “heat” or “mass transfer”.
              </span>
            </div>
          ) : null}

          {recentCalculators.length > 0 ? (
            <section className="calculator-search-group">
              <h3>Recent</h3>
              {recentCalculators.map(
                (calculator) => {
                  const index = runningIndex
                  runningIndex += 1

                  return renderOption(
                    calculator,
                    index,
                  )
                },
              )}
            </section>
          ) : null}

          {categoryGroups.map(
            ([category, groupCalculators]) => (
              <section
                className="calculator-search-group"
                key={category}
              >
                <h3>{category}</h3>

                {groupCalculators.map(
                  (calculator) => {
                    const index = runningIndex
                    runningIndex += 1

                    return renderOption(
                      calculator,
                      index,
                    )
                  },
                )}
              </section>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}
