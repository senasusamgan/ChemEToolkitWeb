import { useState } from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import { CalculatorSearchCombobox } from './CalculatorSearchCombobox'
import { CalculatorWorkbench } from './CalculatorWorkbench'
import { ScientificNotebookPanel } from './ScientificNotebookPanel'
import { ScientificNotebookLibrary } from './ScientificNotebookLibrary'

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
  const [
    sessionKey,
    setSessionKey,
  ] = useState(0)

  const [
    notebookOpen,
    setNotebookOpen,
  ] = useState(false)

  const [
    notebookLibraryOpen,
    setNotebookLibraryOpen,
  ] = useState(false)

  function resetCalculatorSession() {
    setSessionKey(
      (current) =>
        current + 1,
    )
  }

  function duplicateCalculatorSession() {
    const calculatorUrl =
      new URL(
        window.location.href,
      )

    calculatorUrl.searchParams.set(
      'calculator',
      activeCalculator.id,
    )

    calculatorUrl.hash =
      'workbench'

    window.open(
      calculatorUrl.toString(),
      '_blank',
      'noopener,noreferrer',
    )
  }

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
        key={`${activeCalculator.id}:${sessionKey}`}
        className="calculator-stage-body"
      >
        <CalculatorWorkbench
          calculatorId={activeCalculator.id}
          title={activeCalculator.title}
        />
      </div>

      {notebookLibraryOpen ? (
        <ScientificNotebookLibrary
          onClose={() =>
            setNotebookLibraryOpen(
              false,
            )
          }
          onOpenCalculator={(
            calculatorId,
            openNotebook,
          ) => {
            onSelect(
              calculatorId,
            )

            setNotebookLibraryOpen(
              false,
            )

            setNotebookOpen(
              openNotebook,
            )
          }}
        />
      ) : notebookOpen ? (
        <ScientificNotebookPanel
          calculatorId={activeCalculator.id}
          calculatorTitle={activeCalculator.title}
          category={activeCalculator.category}
          onClose={() =>
            setNotebookOpen(false)
          }
        />
      ) : null}

      <footer className="calculator-stage-footer">
        <span>Verified engineering engine</span>

        <div
          className="calculator-stage-session-actions"
          aria-label="Calculator session actions"
        >
          <button
            type="button"
            onClick={resetCalculatorSession}
            title="Clear current calculator inputs and start again"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={duplicateCalculatorSession}
            title="Open this calculator in a separate tab"
          >
            Duplicate
          </button>

          <button
            type="button"
            aria-expanded={notebookOpen}
            aria-controls="scientific-notebook-panel"
            onClick={() => {
              setNotebookLibraryOpen(
                false,
              )

              setNotebookOpen(
                (current) => !current,
              )
            }}
          >
            Notebook
          </button>

          <button
            type="button"
            aria-expanded={
              notebookLibraryOpen
            }
            aria-controls="scientific-notebook-library"
            onClick={() => {
              setNotebookOpen(
                false,
              )

              setNotebookLibraryOpen(
                (current) => !current,
              )
            }}
          >
            Notebook Library
          </button>

          <a href="#references">
            Reference basis ↘
          </a>
        </div>
      </footer>
    </section>
  )
}
