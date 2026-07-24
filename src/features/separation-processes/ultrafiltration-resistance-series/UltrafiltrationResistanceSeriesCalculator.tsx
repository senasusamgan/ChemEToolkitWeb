import { useState } from 'react'
import {
  UltrafiltrationResistanceSeriesCalculationError,
  calculateUltrafiltrationResistanceSeries,
} from './engine'
import type { UltrafiltrationResistanceSeriesResult } from './types'
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
  transmembranePressure: '200000',
  filtrateViscosity: '0.001',
  membraneResistance: '1000000000000',
  foulingResistance: '500000000000',
  cakeResistance: '1500000000000',
  membraneArea: '20',
}

export function UltrafiltrationResistanceSeriesCalculator() {
  const [
    transmembranePressure,
    setTransmembranePressure,
  ] = useState(example.transmembranePressure)
  const [filtrateViscosity, setFiltrateViscosity] =
    useState(example.filtrateViscosity)
  const [membraneResistance, setMembraneResistance] =
    useState(example.membraneResistance)
  const [foulingResistance, setFoulingResistance] =
    useState(example.foulingResistance)
  const [cakeResistance, setCakeResistance] =
    useState(example.cakeResistance)
  const [membraneArea, setMembraneArea] =
    useState(example.membraneArea)

  const [result, setResult] =
    useState<UltrafiltrationResistanceSeriesResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateUltrafiltrationResistanceSeries({
          transmembranePressure:
            Number(transmembranePressure),
          filtrateViscosity:
            Number(filtrateViscosity),
          membraneResistance:
            Number(membraneResistance),
          foulingResistance:
            Number(foulingResistance),
          cakeResistance:
            Number(cakeResistance),
          membraneArea:
            Number(membraneArea),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          UltrafiltrationResistanceSeriesCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setTransmembranePressure(
      example.transmembranePressure,
    )
    setFiltrateViscosity(example.filtrateViscosity)
    setMembraneResistance(example.membraneResistance)
    setFoulingResistance(example.foulingResistance)
    setCakeResistance(example.cakeResistance)
    setMembraneArea(example.membraneArea)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setTransmembranePressure('')
    setFiltrateViscosity('')
    setMembraneResistance('')
    setFoulingResistance('')
    setCakeResistance('')
    setMembraneArea('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–33"
        icon="≋"
        title="Ultrafiltration Resistance Series"
        subtitle="Permeate flux from membrane, fouling and cake resistances"
      />

      <ReferenceBasis>
        Darcy resistance-in-series relation
      </ReferenceBasis>

      <div className="native-formula">
        J = ΔPTM / [μ(Rm + Rf + Rc)]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Transmembrane Pressure" symbol="ΔPTM" value={transmembranePressure} unit="Pa" onChange={setTransmembranePressure} />
        <NumericInput label="Filtrate Viscosity" symbol="μ" value={filtrateViscosity} unit="Pa·s" onChange={setFiltrateViscosity} />
        <NumericInput label="Membrane Resistance" symbol="Rm" value={membraneResistance} unit="1/m" onChange={setMembraneResistance} />
        <NumericInput label="Fouling Resistance" symbol="Rf" value={foulingResistance} unit="1/m" onChange={setFoulingResistance} />
        <NumericInput label="Cake Resistance" symbol="Rc" value={cakeResistance} unit="1/m" onChange={setCakeResistance} />
        <NumericInput label="Membrane Area" symbol="A" value={membraneArea} unit="m²" onChange={setMembraneArea} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate UF flux"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Permeate flux"
          headlineValue={`${formatEngineeringNumber(
            result.permeateFluxLitresPerSquareMetreHour,
          )} L/(m²·h)`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Total Resistance" value={formatEngineeringNumber(result.totalResistance)} unit="1/m" />
          <ResultItem label="Permeate Flux" value={formatEngineeringNumber(result.permeateFlux)} unit="m/s" />
          <ResultItem label="Permeate Flow" value={formatEngineeringNumber(result.permeateFlowRate)} unit="m³/h" />
          <ResultItem label="Membrane Resistance Share" value={formatEngineeringNumber(100 * result.membraneResistanceFraction)} unit="%" />
          <ResultItem label="Fouling Resistance Share" value={formatEngineeringNumber(100 * result.foulingResistanceFraction)} unit="%" />
          <ResultItem label="Cake Resistance Share" value={formatEngineeringNumber(100 * result.cakeResistanceFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
