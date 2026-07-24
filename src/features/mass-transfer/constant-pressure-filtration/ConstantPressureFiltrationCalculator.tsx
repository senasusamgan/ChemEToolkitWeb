import { useState } from 'react'
import {
  ConstantPressureFiltrationCalculationError,
  calculateConstantPressureFiltration,
} from './engine'
import type { ConstantPressureFiltrationResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const EXAMPLE = {
  filtrateViscosity: '0.001',
  pressureDrop: '200000',
  filterArea: '0.5',
  specificCakeResistance: '50000000000',
  slurrySolidsPerFiltrateVolume: '20',
  filterMediumResistance: '10000000000',
  targetFiltrateVolume: '0.2',
}

export function ConstantPressureFiltrationCalculator() {
  const [filtrateViscosity, setFiltrateViscosity] = useState(EXAMPLE.filtrateViscosity)
  const [pressureDrop, setPressureDrop] = useState(EXAMPLE.pressureDrop)
  const [filterArea, setFilterArea] = useState(EXAMPLE.filterArea)
  const [specificCakeResistance, setSpecificCakeResistance] = useState(EXAMPLE.specificCakeResistance)
  const [slurrySolidsPerFiltrateVolume, setSlurrySolidsPerFiltrateVolume] = useState(EXAMPLE.slurrySolidsPerFiltrateVolume)
  const [filterMediumResistance, setFilterMediumResistance] = useState(EXAMPLE.filterMediumResistance)
  const [targetFiltrateVolume, setTargetFiltrateVolume] = useState(EXAMPLE.targetFiltrateVolume)
  const [result, setResult] = useState<ConstantPressureFiltrationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateConstantPressureFiltration({
          filtrateViscosity: Number(filtrateViscosity),
          pressureDrop: Number(pressureDrop),
          filterArea: Number(filterArea),
          specificCakeResistance: Number(specificCakeResistance),
          slurrySolidsPerFiltrateVolume: Number(slurrySolidsPerFiltrateVolume),
          filterMediumResistance: Number(filterMediumResistance),
          targetFiltrateVolume: Number(targetFiltrateVolume),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ConstantPressureFiltrationCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFiltrateViscosity(EXAMPLE.filtrateViscosity)
    setPressureDrop(EXAMPLE.pressureDrop)
    setFilterArea(EXAMPLE.filterArea)
    setSpecificCakeResistance(EXAMPLE.specificCakeResistance)
    setSlurrySolidsPerFiltrateVolume(EXAMPLE.slurrySolidsPerFiltrateVolume)
    setFilterMediumResistance(EXAMPLE.filterMediumResistance)
    setTargetFiltrateVolume(EXAMPLE.targetFiltrateVolume)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFiltrateViscosity('')
    setPressureDrop('')
    setFilterArea('')
    setSpecificCakeResistance('')
    setSlurrySolidsPerFiltrateVolume('')
    setFilterMediumResistance('')
    setTargetFiltrateVolume('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–31"
        icon="≋"
        title="Constant-Pressure Filtration"
        subtitle="Filtration time, cake resistance and changing filtrate rate"
      />
      <ReferenceBasis>Ruth filtration equation for an incompressible cake</ReferenceBasis>
      <div className="native-formula">
        t = μ/ΔP [αcV²/(2A²) + RₘV/A]
      </div>
      <div className="native-input-grid">
        <NumericInput label="Filtrate Viscosity" symbol="μ" value={filtrateViscosity} unit="Pa·s" onChange={setFiltrateViscosity} />
        <NumericInput label="Pressure Drop" symbol="ΔP" value={pressureDrop} unit="Pa" onChange={setPressureDrop} />
        <NumericInput label="Filter Area" symbol="A" value={filterArea} unit="m²" onChange={setFilterArea} />
        <NumericInput label="Specific Cake Resistance" symbol="α" value={specificCakeResistance} unit="m/kg" onChange={setSpecificCakeResistance} />
        <NumericInput label="Solids per Filtrate Volume" symbol="c" value={slurrySolidsPerFiltrateVolume} unit="kg/m³" onChange={setSlurrySolidsPerFiltrateVolume} />
        <NumericInput label="Filter-Medium Resistance" symbol="Rₘ" value={filterMediumResistance} unit="1/m" onChange={setFilterMediumResistance} />
        <NumericInput label="Target Filtrate Volume" symbol="V" value={targetFiltrateVolume} unit="m³" onChange={setTargetFiltrateVolume} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Calculate filtration" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Filtration time"
          headlineValue={`${formatEngineeringNumber(result.filtrationTime)} s`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Average Filtrate Rate" value={formatEngineeringNumber(result.averageFiltrateFlowRate)} unit="m³/s" />
          <ResultItem label="Initial Filtrate Rate" value={formatEngineeringNumber(result.initialFiltrateFlowRate)} unit="m³/s" />
          <ResultItem label="Final Filtrate Rate" value={formatEngineeringNumber(result.finalFiltrateFlowRate)} unit="m³/s" />
          <ResultItem label="Deposited Cake Mass" value={formatEngineeringNumber(result.depositedCakeMass)} unit="kg" />
          <ResultItem label="Final Cake Resistance" value={formatEngineeringNumber(result.finalCakeResistance)} unit="1/m" />
          <ResultItem label="Final Total Resistance" value={formatEngineeringNumber(result.finalTotalResistance)} unit="1/m" />
          <ResultItem label="t/V Plot Slope" value={formatEngineeringNumber(result.filtrationPlotSlope)} unit="s/m⁶" />
          <ResultItem label="t/V Plot Intercept" value={formatEngineeringNumber(result.filtrationPlotIntercept)} unit="s/m³" />
          <ResultItem label="Cake Resistance Share" value={formatEngineeringNumber(100 * result.cakeResistanceFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
