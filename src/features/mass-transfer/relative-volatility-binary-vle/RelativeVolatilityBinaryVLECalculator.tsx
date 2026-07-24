import { useState } from 'react'
import {
  RelativeVolatilityBinaryVLECalculationError,
  calculateRelativeVolatilityBinaryVLE,
} from './engine'
import type {
  BinaryVLECalculationMode,
  RelativeVolatilityBinaryVLEResult,
} from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'
import './relativeVolatilityBinaryVLE.css'

const EXAMPLE = {
  relativeVolatility: '2.5',
  liquidMoleFraction: '0.4',
  vaporMoleFraction: '0.625',
}

export function RelativeVolatilityBinaryVLECalculator() {
  const [mode, setMode] =
    useState<BinaryVLECalculationMode>(
      'liquidToVapor',
    )
  const [relativeVolatility, setRelativeVolatility] =
    useState(EXAMPLE.relativeVolatility)
  const [specifiedMoleFraction, setSpecifiedMoleFraction] =
    useState(EXAMPLE.liquidMoleFraction)
  const [result, setResult] =
    useState<RelativeVolatilityBinaryVLEResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateRelativeVolatilityBinaryVLE({
          mode,
          relativeVolatility:
            Number(relativeVolatility),
          specifiedMoleFraction:
            Number(specifiedMoleFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          RelativeVolatilityBinaryVLECalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function changeMode(
    nextMode: BinaryVLECalculationMode,
  ) {
    setMode(nextMode)
    setSpecifiedMoleFraction(
      nextMode === 'liquidToVapor'
        ? EXAMPLE.liquidMoleFraction
        : EXAMPLE.vaporMoleFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function loadExample() {
    setRelativeVolatility(
      EXAMPLE.relativeVolatility,
    )
    setSpecifiedMoleFraction(
      mode === 'liquidToVapor'
        ? EXAMPLE.liquidMoleFraction
        : EXAMPLE.vaporMoleFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setRelativeVolatility('')
    setSpecifiedMoleFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–42"
        icon="↗"
        title="Relative Volatility & Binary VLE"
        subtitle="Convert binary liquid and vapor equilibrium compositions"
      />
      <ReferenceBasis>
        Constant-relative-volatility binary vapor–liquid equilibrium model
      </ReferenceBasis>
      <div className="native-formula">
        y = αx / [1 + (α − 1)x]
      </div>

      <label className="native-mode-control">
        <span>Calculation Direction</span>
        <select
          value={mode}
          onChange={(event) =>
            changeMode(
              event.target.value as
                BinaryVLECalculationMode,
            )
          }
        >
          <option value="liquidToVapor">
            Liquid x → Vapor y
          </option>
          <option value="vaporToLiquid">
            Vapor y → Liquid x
          </option>
        </select>
      </label>

      <div className="native-input-grid">
        <NumericInput
          label="Relative Volatility"
          symbol="α"
          value={relativeVolatility}
          unit="—"
          onChange={setRelativeVolatility}
        />
        <NumericInput
          label={
            mode === 'liquidToVapor'
              ? 'Liquid Mole Fraction'
              : 'Vapor Mole Fraction'
          }
          symbol={
            mode === 'liquidToVapor'
              ? 'x'
              : 'y'
          }
          value={specifiedMoleFraction}
          unit="fraction"
          onChange={setSpecifiedMoleFraction}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate equilibrium composition"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">{errorMessage}</div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Vapor mole fraction"
          headlineValue={formatEngineeringNumber(
            result.vaporMoleFraction,
          )}
          modelName={result.modelName}
          note={result.interpretation}
        >
          <ResultItem
            label="Liquid Mole Fraction"
            value={formatEngineeringNumber(
              result.liquidMoleFraction,
            )}
            unit="—"
          />
          <ResultItem
            label="Vapor Mole Fraction"
            value={formatEngineeringNumber(
              result.vaporMoleFraction,
            )}
            unit="—"
          />
          <ResultItem
            label="Equilibrium Gap, y − x"
            value={formatEngineeringNumber(
              result.equilibriumGap,
            )}
            unit="—"
          />
          <ResultItem
            label="Vapor Enrichment, y/x"
            value={formatEngineeringNumber(
              result.vaporEnrichmentFactor,
            )}
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
