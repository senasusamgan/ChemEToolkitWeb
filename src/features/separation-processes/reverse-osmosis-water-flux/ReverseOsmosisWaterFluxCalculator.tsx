import { useState } from 'react'
import {
  ReverseOsmosisWaterFluxCalculationError,
  calculateReverseOsmosisWaterFlux,
} from './engine'
import type { ReverseOsmosisWaterFluxResult } from './types'
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
  waterPermeability: '1.5',
  appliedPressureDifference: '60',
  feedOsmoticPressure: '25',
  permeateOsmoticPressure: '1',
  membraneArea: '100',
}

export function ReverseOsmosisWaterFluxCalculator() {
  const [waterPermeability, setWaterPermeability] =
    useState(example.waterPermeability)
  const [
    appliedPressureDifference,
    setAppliedPressureDifference,
  ] = useState(example.appliedPressureDifference)
  const [
    feedOsmoticPressure,
    setFeedOsmoticPressure,
  ] = useState(example.feedOsmoticPressure)
  const [
    permeateOsmoticPressure,
    setPermeateOsmoticPressure,
  ] = useState(example.permeateOsmoticPressure)
  const [membraneArea, setMembraneArea] =
    useState(example.membraneArea)

  const [result, setResult] =
    useState<ReverseOsmosisWaterFluxResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateReverseOsmosisWaterFlux({
          waterPermeability:
            Number(waterPermeability),
          appliedPressureDifference:
            Number(appliedPressureDifference),
          feedOsmoticPressure:
            Number(feedOsmoticPressure),
          permeateOsmoticPressure:
            Number(permeateOsmoticPressure),
          membraneArea:
            Number(membraneArea),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReverseOsmosisWaterFluxCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setWaterPermeability(example.waterPermeability)
    setAppliedPressureDifference(
      example.appliedPressureDifference,
    )
    setFeedOsmoticPressure(
      example.feedOsmoticPressure,
    )
    setPermeateOsmoticPressure(
      example.permeateOsmoticPressure,
    )
    setMembraneArea(example.membraneArea)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setWaterPermeability('')
    setAppliedPressureDifference('')
    setFeedOsmoticPressure('')
    setPermeateOsmoticPressure('')
    setMembraneArea('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–32"
        icon="≈"
        title="Reverse-Osmosis Water Flux"
        subtitle="Water flux and permeate production from net driving pressure"
      />

      <ReferenceBasis>
        Solution-diffusion relation Jw = A(ΔP − Δπ)
      </ReferenceBasis>

      <div className="native-formula">
        Jw = A[(Pf − Pp) − (πf − πp)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Water Permeability" symbol="A" value={waterPermeability} unit="L/(m²·h·bar)" onChange={setWaterPermeability} />
        <NumericInput label="Applied Pressure Difference" symbol="ΔP" value={appliedPressureDifference} unit="bar" onChange={setAppliedPressureDifference} />
        <NumericInput label="Feed Osmotic Pressure" symbol="πf" value={feedOsmoticPressure} unit="bar" onChange={setFeedOsmoticPressure} />
        <NumericInput label="Permeate Osmotic Pressure" symbol="πp" value={permeateOsmoticPressure} unit="bar" onChange={setPermeateOsmoticPressure} />
        <NumericInput label="Membrane Area" symbol="Am" value={membraneArea} unit="m²" onChange={setMembraneArea} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate RO flux"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Water flux"
          headlineValue={`${formatEngineeringNumber(
            result.waterFlux,
          )} L/(m²·h)`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Osmotic Pressure Difference" value={formatEngineeringNumber(result.osmoticPressureDifference)} unit="bar" />
          <ResultItem label="Net Driving Pressure" value={formatEngineeringNumber(result.netDrivingPressure)} unit="bar" />
          <ResultItem label="Permeate Flow" value={formatEngineeringNumber(result.permeateFlowRate)} unit="L/h" />
          <ResultItem label="Permeate Flow" value={formatEngineeringNumber(result.permeateFlowCubicMetresPerHour)} unit="m³/h" />
          <ResultItem label="Specific Productivity" value={formatEngineeringNumber(result.specificProductivity)} unit="m³/(m²·h)" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
