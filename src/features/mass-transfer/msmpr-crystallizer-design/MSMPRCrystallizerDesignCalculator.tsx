import { useState } from 'react'
import {
  MSMPRCrystallizerDesignCalculationError,
  calculateMSMPRCrystallizerDesign,
} from './engine'
import type { MSMPRCrystallizerDesignResult } from './types'
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
  residenceTime: '2',
  linearCrystalGrowthRate: '0.0005',
  nucleiPopulationDensity: '100000000',
  crystalDensity: '2500',
  crystalVolumeShapeFactor: '0.5',
  slurryVolumetricFlowRate: '0.1',
  evaluationCrystalSize: '0.002',
}

export function MSMPRCrystallizerDesignCalculator() {
  const [residenceTime, setResidenceTime] = useState(EXAMPLE.residenceTime)
  const [linearCrystalGrowthRate, setLinearCrystalGrowthRate] =
    useState(EXAMPLE.linearCrystalGrowthRate)
  const [nucleiPopulationDensity, setNucleiPopulationDensity] =
    useState(EXAMPLE.nucleiPopulationDensity)
  const [crystalDensity, setCrystalDensity] = useState(EXAMPLE.crystalDensity)
  const [crystalVolumeShapeFactor, setCrystalVolumeShapeFactor] =
    useState(EXAMPLE.crystalVolumeShapeFactor)
  const [slurryVolumetricFlowRate, setSlurryVolumetricFlowRate] =
    useState(EXAMPLE.slurryVolumetricFlowRate)
  const [evaluationCrystalSize, setEvaluationCrystalSize] =
    useState(EXAMPLE.evaluationCrystalSize)
  const [result, setResult] =
    useState<MSMPRCrystallizerDesignResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateMSMPRCrystallizerDesign({
          residenceTime: Number(residenceTime),
          linearCrystalGrowthRate:
            Number(linearCrystalGrowthRate),
          nucleiPopulationDensity:
            Number(nucleiPopulationDensity),
          crystalDensity: Number(crystalDensity),
          crystalVolumeShapeFactor:
            Number(crystalVolumeShapeFactor),
          slurryVolumetricFlowRate:
            Number(slurryVolumetricFlowRate),
          evaluationCrystalSize:
            Number(evaluationCrystalSize),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          MSMPRCrystallizerDesignCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setResidenceTime(EXAMPLE.residenceTime)
    setLinearCrystalGrowthRate(
      EXAMPLE.linearCrystalGrowthRate,
    )
    setNucleiPopulationDensity(
      EXAMPLE.nucleiPopulationDensity,
    )
    setCrystalDensity(EXAMPLE.crystalDensity)
    setCrystalVolumeShapeFactor(
      EXAMPLE.crystalVolumeShapeFactor,
    )
    setSlurryVolumetricFlowRate(
      EXAMPLE.slurryVolumetricFlowRate,
    )
    setEvaluationCrystalSize(
      EXAMPLE.evaluationCrystalSize,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setResidenceTime('')
    setLinearCrystalGrowthRate('')
    setNucleiPopulationDensity('')
    setCrystalDensity('')
    setCrystalVolumeShapeFactor('')
    setSlurryVolumetricFlowRate('')
    setEvaluationCrystalSize('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–40"
        icon="▥"
        title="MSMPR Crystallizer Design"
        subtitle="Ideal crystal-size distribution, solids loading and production"
      />
      <ReferenceBasis>
        Ideal steady-state mixed-suspension mixed-product-removal population balance
      </ReferenceBasis>
      <div className="native-formula">
        L̄ = Gτ · n(L) = n₀e⁻ᴸ⁄ᴸ̄ · μ₃ = 6n₀L̄⁴
      </div>
      <div className="native-input-grid">
        <NumericInput label="Residence Time" symbol="τ" value={residenceTime} unit="h" onChange={setResidenceTime} />
        <NumericInput label="Linear Crystal Growth Rate" symbol="G" value={linearCrystalGrowthRate} unit="m/h" onChange={setLinearCrystalGrowthRate} />
        <NumericInput label="Nuclei Population Density" symbol="n₀" value={nucleiPopulationDensity} unit="#/m⁴" onChange={setNucleiPopulationDensity} />
        <NumericInput label="Crystal Density" symbol="ρc" value={crystalDensity} unit="kg/m³" onChange={setCrystalDensity} />
        <NumericInput label="Crystal Volume Shape Factor" symbol="kv" value={crystalVolumeShapeFactor} unit="—" onChange={setCrystalVolumeShapeFactor} />
        <NumericInput label="Slurry Volumetric Flow" symbol="Q" value={slurryVolumetricFlowRate} unit="m³/h" onChange={setSlurryVolumetricFlowRate} />
        <NumericInput label="Evaluation Crystal Size" symbol="L" value={evaluationCrystalSize} unit="m" onChange={setEvaluationCrystalSize} />
      </div>
      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate MSMPR distribution"
      />
      {errorMessage ? (
        <div className="native-error" role="alert">{errorMessage}</div>
      ) : null}
      {result ? (
        <ResultPanel
          headlineLabel="Characteristic crystal size"
          headlineValue={`${formatEngineeringNumber(result.characteristicCrystalSize)} m`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Number-Mean Size" value={formatEngineeringNumber(result.numberMeanCrystalSize)} unit="m" />
          <ResultItem label="Surface-Weighted Mean Size" value={formatEngineeringNumber(result.surfaceWeightedMeanSize)} unit="m" />
          <ResultItem label="Volume-Weighted Mean Size" value={formatEngineeringNumber(result.volumeWeightedMeanSize)} unit="m" />
          <ResultItem label="Total Crystal Number Concentration" value={formatEngineeringNumber(result.totalCrystalNumberConcentration)} unit="#/m³" />
          <ResultItem label="Third Population Moment" value={formatEngineeringNumber(result.thirdPopulationMoment)} unit="m³ crystal/m³ slurry ÷ kv" />
          <ResultItem label="Solids Volume Fraction" value={formatEngineeringNumber(result.solidsVolumeFraction)} unit="fraction" />
          <ResultItem label="Crystal Mass Concentration" value={formatEngineeringNumber(result.crystalMassConcentration)} unit="kg/m³" />
          <ResultItem label="Crystal Production Rate" value={formatEngineeringNumber(result.crystalProductionRate)} unit="kg/h" />
          <ResultItem label="Population Density at Evaluation Size" value={formatEngineeringNumber(result.populationDensityAtEvaluationSize)} unit="#/m⁴" />
          <ResultItem label="Number Fraction Above Evaluation Size" value={formatEngineeringNumber(result.fractionByNumberAboveEvaluationSize)} unit="fraction" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
