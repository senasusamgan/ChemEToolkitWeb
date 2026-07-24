import { useState } from 'react'
import {
  PackedColumnHydraulicsCalculationError,
  calculatePackedColumnHydraulics,
} from './engine'
import type { PackedColumnHydraulicsResult } from './types'
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
  gasVolumetricFlowRate: '0.005',
  liquidVolumetricFlowRate: '0.001',
  floodingGasVelocity: '0.1',
  designFractionOfFlooding: '0.6',
  packedHeight: '3',
  gasDensity: '1.2',
  gasViscosity: '0.000018',
  bedVoidFraction: '0.4',
  equivalentPackingDiameter: '0.005',
}

export function PackedColumnHydraulicsCalculator() {
  const [gasVolumetricFlowRate, setGasVolumetricFlowRate] =
    useState(EXAMPLE.gasVolumetricFlowRate)
  const [liquidVolumetricFlowRate, setLiquidVolumetricFlowRate] =
    useState(EXAMPLE.liquidVolumetricFlowRate)
  const [floodingGasVelocity, setFloodingGasVelocity] =
    useState(EXAMPLE.floodingGasVelocity)
  const [designFractionOfFlooding, setDesignFractionOfFlooding] =
    useState(EXAMPLE.designFractionOfFlooding)
  const [packedHeight, setPackedHeight] =
    useState(EXAMPLE.packedHeight)
  const [gasDensity, setGasDensity] =
    useState(EXAMPLE.gasDensity)
  const [gasViscosity, setGasViscosity] =
    useState(EXAMPLE.gasViscosity)
  const [bedVoidFraction, setBedVoidFraction] =
    useState(EXAMPLE.bedVoidFraction)
  const [equivalentPackingDiameter, setEquivalentPackingDiameter] =
    useState(EXAMPLE.equivalentPackingDiameter)
  const [result, setResult] =
    useState<PackedColumnHydraulicsResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculatePackedColumnHydraulics({
          gasVolumetricFlowRate:
            Number(gasVolumetricFlowRate),
          liquidVolumetricFlowRate:
            Number(liquidVolumetricFlowRate),
          floodingGasVelocity:
            Number(floodingGasVelocity),
          designFractionOfFlooding:
            Number(designFractionOfFlooding),
          packedHeight: Number(packedHeight),
          gasDensity: Number(gasDensity),
          gasViscosity: Number(gasViscosity),
          bedVoidFraction: Number(bedVoidFraction),
          equivalentPackingDiameter:
            Number(equivalentPackingDiameter),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          PackedColumnHydraulicsCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setGasVolumetricFlowRate(
      EXAMPLE.gasVolumetricFlowRate,
    )
    setLiquidVolumetricFlowRate(
      EXAMPLE.liquidVolumetricFlowRate,
    )
    setFloodingGasVelocity(
      EXAMPLE.floodingGasVelocity,
    )
    setDesignFractionOfFlooding(
      EXAMPLE.designFractionOfFlooding,
    )
    setPackedHeight(EXAMPLE.packedHeight)
    setGasDensity(EXAMPLE.gasDensity)
    setGasViscosity(EXAMPLE.gasViscosity)
    setBedVoidFraction(EXAMPLE.bedVoidFraction)
    setEquivalentPackingDiameter(
      EXAMPLE.equivalentPackingDiameter,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setGasVolumetricFlowRate('')
    setLiquidVolumetricFlowRate('')
    setFloodingGasVelocity('')
    setDesignFractionOfFlooding('')
    setPackedHeight('')
    setGasDensity('')
    setGasViscosity('')
    setBedVoidFraction('')
    setEquivalentPackingDiameter('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–41"
        icon="◫"
        title="Packed-Column Hydraulics"
        subtitle="Column diameter and dry packed-bed pressure-drop screening"
      />
      <ReferenceBasis>
        Fraction-of-flooding diameter sizing with a dry Ergun pressure-drop estimate
      </ReferenceBasis>
      <div className="native-formula">
        uG = f·uflood · A = QG/uG · ΔP/Z = Ergun viscous + inertial terms
      </div>
      <div className="native-input-grid">
        <NumericInput label="Gas Volumetric Flow" symbol="QG" value={gasVolumetricFlowRate} unit="m³/s" onChange={setGasVolumetricFlowRate} />
        <NumericInput label="Liquid Volumetric Flow" symbol="QL" value={liquidVolumetricFlowRate} unit="m³/s" onChange={setLiquidVolumetricFlowRate} />
        <NumericInput label="Flooding Gas Velocity" symbol="uflood" value={floodingGasVelocity} unit="m/s" onChange={setFloodingGasVelocity} />
        <NumericInput label="Design Fraction of Flooding" symbol="f" value={designFractionOfFlooding} unit="fraction" onChange={setDesignFractionOfFlooding} />
        <NumericInput label="Packed Height" symbol="Z" value={packedHeight} unit="m" onChange={setPackedHeight} />
        <NumericInput label="Gas Density" symbol="ρG" value={gasDensity} unit="kg/m³" onChange={setGasDensity} />
        <NumericInput label="Gas Viscosity" symbol="μG" value={gasViscosity} unit="Pa·s" onChange={setGasViscosity} />
        <NumericInput label="Bed Void Fraction" symbol="ε" value={bedVoidFraction} unit="fraction" onChange={setBedVoidFraction} />
        <NumericInput label="Equivalent Packing Diameter" symbol="dp" value={equivalentPackingDiameter} unit="m" onChange={setEquivalentPackingDiameter} />
      </div>
      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate column hydraulics"
      />
      {errorMessage ? (
        <div className="native-error" role="alert">{errorMessage}</div>
      ) : null}
      {result ? (
        <ResultPanel
          headlineLabel="Column diameter"
          headlineValue={`${formatEngineeringNumber(result.columnDiameter)} m`}
          modelName={result.modelName}
          note={`${result.designAssessment} ${result.limitationDescription}`}
        >
          <ResultItem label="Design Gas Velocity" value={formatEngineeringNumber(result.designGasVelocity)} unit="m/s" />
          <ResultItem label="Column Cross-Sectional Area" value={formatEngineeringNumber(result.columnCrossSectionalArea)} unit="m²" />
          <ResultItem label="Superficial Liquid Velocity" value={formatEngineeringNumber(result.superficialLiquidVelocity)} unit="m/s" />
          <ResultItem label="Fraction of Flooding" value={formatEngineeringNumber(result.fractionOfFlooding)} unit="fraction" />
          <ResultItem label="Gas Capacity Factor" value={formatEngineeringNumber(result.gasCapacityFactor)} unit="(kg/m·s²)½" />
          <ResultItem label="Modified Particle Reynolds Number" value={formatEngineeringNumber(result.modifiedParticleReynoldsNumber)} unit="—" />
          <ResultItem label="Dry Pressure Drop per Length" value={formatEngineeringNumber(result.dryPressureDropPerLength)} unit="Pa/m" />
          <ResultItem label="Total Dry Pressure Drop" value={formatEngineeringNumber(result.totalDryPressureDrop)} unit="Pa" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
