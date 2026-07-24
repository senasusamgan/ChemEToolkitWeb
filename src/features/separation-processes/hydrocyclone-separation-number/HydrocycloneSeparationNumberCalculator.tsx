import { useState } from 'react'
import {
  HydrocycloneSeparationNumberCalculationError,
  calculateHydrocycloneSeparationNumber,
} from './engine'
import type { HydrocycloneSeparationNumberResult } from './types'
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
  particleDensity: '2500',
  fluidDensity: '1000',
  particleDiameter: '0.0001',
  inletVelocity: '5',
  fluidViscosity: '0.001',
  cycloneDiameter: '0.2',
}

export function HydrocycloneSeparationNumberCalculator() {
  const [particleDensity, setParticleDensity] =
    useState(example.particleDensity)
  const [fluidDensity, setFluidDensity] =
    useState(example.fluidDensity)
  const [particleDiameter, setParticleDiameter] =
    useState(example.particleDiameter)
  const [inletVelocity, setInletVelocity] =
    useState(example.inletVelocity)
  const [fluidViscosity, setFluidViscosity] =
    useState(example.fluidViscosity)
  const [cycloneDiameter, setCycloneDiameter] =
    useState(example.cycloneDiameter)

  const [result, setResult] =
    useState<HydrocycloneSeparationNumberResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateHydrocycloneSeparationNumber({
          particleDensity:
            Number(particleDensity),
          fluidDensity:
            Number(fluidDensity),
          particleDiameter:
            Number(particleDiameter),
          inletVelocity:
            Number(inletVelocity),
          fluidViscosity:
            Number(fluidViscosity),
          cycloneDiameter:
            Number(cycloneDiameter),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          HydrocycloneSeparationNumberCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setParticleDensity(example.particleDensity)
    setFluidDensity(example.fluidDensity)
    setParticleDiameter(example.particleDiameter)
    setInletVelocity(example.inletVelocity)
    setFluidViscosity(example.fluidViscosity)
    setCycloneDiameter(example.cycloneDiameter)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setParticleDensity('')
    setFluidDensity('')
    setParticleDiameter('')
    setInletVelocity('')
    setFluidViscosity('')
    setCycloneDiameter('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–38"
        icon="◉"
        title="Hydrocyclone Separation Number"
        subtitle="Dimensionless particle inertial response in a hydrocyclone-scale flow"
      />

      <ReferenceBasis>
        Stokes-type centrifugal response relative to viscous drag
      </ReferenceBasis>

      <div className="native-formula">
        Ψ = (ρp − ρf)dp²vin/(18μDc)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Particle Density" symbol="ρp" value={particleDensity} unit="kg/m³" onChange={setParticleDensity} />
        <NumericInput label="Fluid Density" symbol="ρf" value={fluidDensity} unit="kg/m³" onChange={setFluidDensity} />
        <NumericInput label="Particle Diameter" symbol="dp" value={particleDiameter} unit="m" onChange={setParticleDiameter} />
        <NumericInput label="Inlet Velocity" symbol="vin" value={inletVelocity} unit="m/s" onChange={setInletVelocity} />
        <NumericInput label="Fluid Viscosity" symbol="μ" value={fluidViscosity} unit="Pa·s" onChange={setFluidViscosity} />
        <NumericInput label="Cyclone Diameter" symbol="Dc" value={cycloneDiameter} unit="m" onChange={setCycloneDiameter} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate separation number"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Separation number"
          headlineValue={formatEngineeringNumber(result.separationNumber)}
          modelName={result.modelName}
          note={`${result.centrifugalResponseAssessment} ${result.limitationDescription}`}
        >
          <ResultItem label="Density Difference" value={formatEngineeringNumber(result.densityDifference)} unit="kg/m³" />
          <ResultItem label="Particle Reynolds Estimate" value={formatEngineeringNumber(result.particleReynoldsEstimate)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
