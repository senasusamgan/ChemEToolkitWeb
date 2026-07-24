import { useState } from 'react'
import {
  ExtractionDistributionSelectivityCalculationError,
  calculateExtractionDistributionSelectivity,
} from './engine'
import type { ExtractionDistributionSelectivityResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const example = {
  raffinateSoluteAConcentration: '0.02',
  extractSoluteAConcentration: '0.10',
  raffinateSoluteBConcentration: '0.04',
  extractSoluteBConcentration: '0.08',
}

export function ExtractionDistributionSelectivityCalculator() {
  const [raffinateA, setRaffinateA] =
    useState(example.raffinateSoluteAConcentration)
  const [extractA, setExtractA] =
    useState(example.extractSoluteAConcentration)
  const [raffinateB, setRaffinateB] =
    useState(example.raffinateSoluteBConcentration)
  const [extractB, setExtractB] =
    useState(example.extractSoluteBConcentration)

  const [result, setResult] =
    useState<ExtractionDistributionSelectivityResult | null>(
      null,
    )
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateExtractionDistributionSelectivity({
          raffinateSoluteAConcentration:
            Number(raffinateA),
          extractSoluteAConcentration:
            Number(extractA),
          raffinateSoluteBConcentration:
            Number(raffinateB),
          extractSoluteBConcentration:
            Number(extractB),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ExtractionDistributionSelectivityCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setRaffinateA(
      example.raffinateSoluteAConcentration,
    )
    setExtractA(
      example.extractSoluteAConcentration,
    )
    setRaffinateB(
      example.raffinateSoluteBConcentration,
    )
    setExtractB(
      example.extractSoluteBConcentration,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setRaffinateA('')
    setExtractA('')
    setRaffinateB('')
    setExtractB('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–19"
        icon="⇄"
        title="Extraction Distribution & Selectivity"
        subtitle="Compare equilibrium solvent affinity for two solutes"
      />

      <ReferenceBasis>
        Distribution coefficient D = Cextract / Craffinate
      </ReferenceBasis>

      <div className="native-formula">
        DA = yA/xA · DB = yB/xB · βA/B = DA/DB
      </div>

      <div className="native-input-grid">
        <NumericInput label="Raffinate Concentration, Solute A" symbol="xA" value={raffinateA} unit="consistent" onChange={setRaffinateA} />
        <NumericInput label="Extract Concentration, Solute A" symbol="yA" value={extractA} unit="consistent" onChange={setExtractA} />
        <NumericInput label="Raffinate Concentration, Solute B" symbol="xB" value={raffinateB} unit="consistent" onChange={setRaffinateB} />
        <NumericInput label="Extract Concentration, Solute B" symbol="yB" value={extractB} unit="consistent" onChange={setExtractB} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate selectivity"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Selectivity A over B"
          headlineValue={formatEngineeringNumber(
            result.selectivityAOverB,
          )}
          modelName={result.modelName}
          note={`${result.separationPreference} ${result.limitationDescription}`}
        >
          <ResultItem label="Distribution Coefficient A" value={formatEngineeringNumber(result.distributionCoefficientA)} unit="—" />
          <ResultItem label="Distribution Coefficient B" value={formatEngineeringNumber(result.distributionCoefficientB)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
