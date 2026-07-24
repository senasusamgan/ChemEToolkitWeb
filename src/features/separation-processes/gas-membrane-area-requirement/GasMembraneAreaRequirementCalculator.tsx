import { useState } from 'react'
import {
  GasMembraneAreaRequirementCalculationError,
  calculateGasMembraneAreaRequirement,
} from './engine'
import type { GasMembraneAreaRequirementResult } from './types'
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
  feedMolarFlowRate: '100',
  stageCut: '0.25',
  permeateSoluteFraction: '0.80',
  solutePermeance: '0.000000003',
  partialPressureDrivingForce: '300000',
}

export function GasMembraneAreaRequirementCalculator() {
  const [feedMolarFlowRate, setFeedMolarFlowRate] =
    useState(example.feedMolarFlowRate)
  const [stageCut, setStageCut] =
    useState(example.stageCut)
  const [
    permeateSoluteFraction,
    setPermeateSoluteFraction,
  ] = useState(example.permeateSoluteFraction)
  const [solutePermeance, setSolutePermeance] =
    useState(example.solutePermeance)
  const [
    partialPressureDrivingForce,
    setPartialPressureDrivingForce,
  ] = useState(example.partialPressureDrivingForce)

  const [result, setResult] =
    useState<GasMembraneAreaRequirementResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateGasMembraneAreaRequirement({
          feedMolarFlowRate:
            Number(feedMolarFlowRate),
          stageCut:
            Number(stageCut),
          permeateSoluteFraction:
            Number(permeateSoluteFraction),
          solutePermeance:
            Number(solutePermeance),
          partialPressureDrivingForce:
            Number(partialPressureDrivingForce),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          GasMembraneAreaRequirementCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedMolarFlowRate(example.feedMolarFlowRate)
    setStageCut(example.stageCut)
    setPermeateSoluteFraction(
      example.permeateSoluteFraction,
    )
    setSolutePermeance(example.solutePermeance)
    setPartialPressureDrivingForce(
      example.partialPressureDrivingForce,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedMolarFlowRate('')
    setStageCut('')
    setPermeateSoluteFraction('')
    setSolutePermeance('')
    setPartialPressureDrivingForce('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–30"
        icon="▥"
        title="Gas-Membrane Area Requirement"
        subtitle="Preliminary membrane area from permeance and average driving force"
      />

      <ReferenceBasis>
        Solute flux Ji = ΠiΔpi
      </ReferenceBasis>

      <div className="native-formula">
        A = θFyp / (ΠiΔpi)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Molar Flow" symbol="F" value={feedMolarFlowRate} unit="kmol/h" onChange={setFeedMolarFlowRate} />
        <NumericInput label="Stage Cut" symbol="θ" value={stageCut} unit="fraction" onChange={setStageCut} />
        <NumericInput label="Permeate Solute Fraction" symbol="yp" value={permeateSoluteFraction} unit="fraction" onChange={setPermeateSoluteFraction} />
        <NumericInput label="Solute Permeance" symbol="Πi" value={solutePermeance} unit="mol/(m²·s·Pa)" onChange={setSolutePermeance} />
        <NumericInput label="Average Partial-Pressure Driving Force" symbol="Δpi" value={partialPressureDrivingForce} unit="Pa" onChange={setPartialPressureDrivingForce} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate membrane area"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required membrane area"
          headlineValue={`${formatEngineeringNumber(
            result.requiredMembraneArea,
          )} m²`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Permeate Molar Flow" value={formatEngineeringNumber(result.permeateMolarFlowRate)} unit="kmol/h" />
          <ResultItem label="Retentate Molar Flow" value={formatEngineeringNumber(result.retentateMolarFlowRate)} unit="kmol/h" />
          <ResultItem label="Solute Permeate Rate" value={formatEngineeringNumber(result.solutePermeateRate)} unit="kmol/h" />
          <ResultItem label="Solute Flux" value={formatEngineeringNumber(result.soluteFlux)} unit="mol/(m²·s)" />
          <ResultItem label="Area / Feed Capacity" value={formatEngineeringNumber(result.areaPerFeedCapacity)} unit="m²/(kmol/h)" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
