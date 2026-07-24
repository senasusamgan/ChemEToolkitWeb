import { useState } from 'react'
import {
  ConstantPressureFilterSizingCalculationError,
  calculateConstantPressureFilterSizing,
} from './engine'
import type { ConstantPressureFilterSizingResult } from './types'
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
  filtrateViscosity: '0.001',
  specificCakeResistance: '100000000000',
  drySolidsPerFiltrateVolume: '50',
  filterArea: '10',
  pressureDrop: '200000',
  filterMediumResistance: '5000000000',
  targetFiltrateVolume: '5',
}

export function ConstantPressureFilterSizingCalculator() {
  const [filtrateViscosity, setFiltrateViscosity] =
    useState(example.filtrateViscosity)
  const [
    specificCakeResistance,
    setSpecificCakeResistance,
  ] = useState(example.specificCakeResistance)
  const [
    drySolidsPerFiltrateVolume,
    setDrySolidsPerFiltrateVolume,
  ] = useState(example.drySolidsPerFiltrateVolume)
  const [filterArea, setFilterArea] =
    useState(example.filterArea)
  const [pressureDrop, setPressureDrop] =
    useState(example.pressureDrop)
  const [
    filterMediumResistance,
    setFilterMediumResistance,
  ] = useState(example.filterMediumResistance)
  const [
    targetFiltrateVolume,
    setTargetFiltrateVolume,
  ] = useState(example.targetFiltrateVolume)

  const [result, setResult] =
    useState<ConstantPressureFilterSizingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateConstantPressureFilterSizing({
          filtrateViscosity:
            Number(filtrateViscosity),
          specificCakeResistance:
            Number(specificCakeResistance),
          drySolidsPerFiltrateVolume:
            Number(drySolidsPerFiltrateVolume),
          filterArea:
            Number(filterArea),
          pressureDrop:
            Number(pressureDrop),
          filterMediumResistance:
            Number(filterMediumResistance),
          targetFiltrateVolume:
            Number(targetFiltrateVolume),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ConstantPressureFilterSizingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFiltrateViscosity(example.filtrateViscosity)
    setSpecificCakeResistance(
      example.specificCakeResistance,
    )
    setDrySolidsPerFiltrateVolume(
      example.drySolidsPerFiltrateVolume,
    )
    setFilterArea(example.filterArea)
    setPressureDrop(example.pressureDrop)
    setFilterMediumResistance(
      example.filterMediumResistance,
    )
    setTargetFiltrateVolume(
      example.targetFiltrateVolume,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFiltrateViscosity('')
    setSpecificCakeResistance('')
    setDrySolidsPerFiltrateVolume('')
    setFilterArea('')
    setPressureDrop('')
    setFilterMediumResistance('')
    setTargetFiltrateVolume('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–14"
        icon="▤"
        title="Constant-Pressure Filter Sizing"
        subtitle="Cake and medium contributions to filtration time"
      />

      <ReferenceBasis>
        Ruth constant-pressure cake-filtration relation
      </ReferenceBasis>

      <div className="native-formula">
        t = μαCV²/(2A²ΔP) + μRmV/(AΔP)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Filtrate Viscosity" symbol="μ" value={filtrateViscosity} unit="Pa·s" onChange={setFiltrateViscosity} />
        <NumericInput label="Specific Cake Resistance" symbol="α" value={specificCakeResistance} unit="m/kg" onChange={setSpecificCakeResistance} />
        <NumericInput label="Dry Solids per Filtrate Volume" symbol="C" value={drySolidsPerFiltrateVolume} unit="kg/m³" onChange={setDrySolidsPerFiltrateVolume} />
        <NumericInput label="Filter Area" symbol="A" value={filterArea} unit="m²" onChange={setFilterArea} />
        <NumericInput label="Pressure Drop" symbol="ΔP" value={pressureDrop} unit="Pa" onChange={setPressureDrop} />
        <NumericInput label="Filter-Medium Resistance" symbol="Rm" value={filterMediumResistance} unit="1/m" onChange={setFilterMediumResistance} />
        <NumericInput label="Target Filtrate Volume" symbol="V" value={targetFiltrateVolume} unit="m³" onChange={setTargetFiltrateVolume} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate filtration time"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Total filtration time"
          headlineValue={`${formatEngineeringNumber(
            result.totalFiltrationTime,
          )} s`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Cake Time" value={formatEngineeringNumber(result.cakeTime)} unit="s" />
          <ResultItem label="Medium Time" value={formatEngineeringNumber(result.mediumTime)} unit="s" />
          <ResultItem label="Average Filtrate Rate" value={formatEngineeringNumber(result.averageFiltrateRate)} unit="m³/s" />
          <ResultItem label="Final Instantaneous Rate" value={formatEngineeringNumber(result.finalInstantaneousRate)} unit="m³/s" />
          <ResultItem label="Cake Resistance at Target" value={formatEngineeringNumber(result.cakeResistanceAtTarget)} unit="1/m" />
          <ResultItem label="Total Resistance at Target" value={formatEngineeringNumber(result.totalResistanceAtTarget)} unit="1/m" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
