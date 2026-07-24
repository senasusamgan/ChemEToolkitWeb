import { useState } from 'react'
import {
  CentrifugalSettlingCalculationError,
  calculateCentrifugalSettling,
} from './engine'
import type { CentrifugalSettlingResult } from './types'
import './centrifugalSettling.css'

const EXAMPLE = {
  particleDiameter: '0.000004',
  particleDensity: '2500',
  fluidDensity: '1000',
  fluidViscosity: '0.001',
  rotationalSpeedRPM: '3000',
  initialRadius: '0.05',
  finalRadius: '0.15',
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-12) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 10,
  }).format(value)
}

export function CentrifugalSettlingCalculator() {
  const [particleDiameter, setParticleDiameter] = useState(
    EXAMPLE.particleDiameter,
  )
  const [particleDensity, setParticleDensity] = useState(
    EXAMPLE.particleDensity,
  )
  const [fluidDensity, setFluidDensity] = useState(
    EXAMPLE.fluidDensity,
  )
  const [fluidViscosity, setFluidViscosity] = useState(
    EXAMPLE.fluidViscosity,
  )
  const [rotationalSpeedRPM, setRotationalSpeedRPM] =
    useState(EXAMPLE.rotationalSpeedRPM)
  const [initialRadius, setInitialRadius] = useState(
    EXAMPLE.initialRadius,
  )
  const [finalRadius, setFinalRadius] = useState(
    EXAMPLE.finalRadius,
  )

  const [result, setResult] =
    useState<CentrifugalSettlingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      const nextResult = calculateCentrifugalSettling({
        particleDiameter: Number(particleDiameter),
        particleDensity: Number(particleDensity),
        fluidDensity: Number(fluidDensity),
        fluidViscosity: Number(fluidViscosity),
        rotationalSpeedRPM: Number(rotationalSpeedRPM),
        initialRadius: Number(initialRadius),
        finalRadius: Number(finalRadius),
      })

      setResult(nextResult)
      setErrorMessage('')
    } catch (error) {
      setResult(null)

      if (
        error instanceof
        CentrifugalSettlingCalculationError
      ) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'The calculation could not be completed.',
        )
      }
    }
  }

  function loadExample() {
    setParticleDiameter(EXAMPLE.particleDiameter)
    setParticleDensity(EXAMPLE.particleDensity)
    setFluidDensity(EXAMPLE.fluidDensity)
    setFluidViscosity(EXAMPLE.fluidViscosity)
    setRotationalSpeedRPM(EXAMPLE.rotationalSpeedRPM)
    setInitialRadius(EXAMPLE.initialRadius)
    setFinalRadius(EXAMPLE.finalRadius)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setParticleDiameter('')
    setParticleDensity('')
    setFluidDensity('')
    setFluidViscosity('')
    setRotationalSpeedRPM('')
    setInitialRadius('')
    setFinalRadius('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div className="native-icon">↻</div>
        <div>
          <p>Mass Transfer · MT–30</p>
          <h2>Centrifugal Settling Time</h2>
          <span>
            Radial migration time, settling velocity and
            Stokes-regime validity
          </span>
        </div>
      </header>

      <aside className="native-reference">
        <strong>Reference basis</strong>
        <span>
          Integrated Stokes settling in a centrifugal field
        </span>
        <a href="#references">View bibliography ↘</a>
      </aside>

      <div className="native-formula">
        dr/dt = kr · t = ln(r₂/r₁)/k ·
        k = dₚ²Δρω²/(18μ)
      </div>

      <div className="native-input-grid">
        <InputField
          label="Particle Diameter"
          value={particleDiameter}
          unit="m"
          onChange={setParticleDiameter}
        />
        <InputField
          label="Particle Density"
          value={particleDensity}
          unit="kg/m³"
          onChange={setParticleDensity}
        />
        <InputField
          label="Fluid Density"
          value={fluidDensity}
          unit="kg/m³"
          onChange={setFluidDensity}
        />
        <InputField
          label="Fluid Viscosity"
          value={fluidViscosity}
          unit="Pa·s"
          onChange={setFluidViscosity}
        />
        <InputField
          label="Rotational Speed"
          value={rotationalSpeedRPM}
          unit="rpm"
          onChange={setRotationalSpeedRPM}
        />
        <InputField
          label="Initial Radius"
          value={initialRadius}
          unit="m"
          onChange={setInitialRadius}
        />
        <InputField
          label="Final Radius"
          value={finalRadius}
          unit="m"
          onChange={setFinalRadius}
        />
      </div>

      <div className="native-actions">
        <button type="button" onClick={loadExample}>
          Load example
        </button>
        <button type="button" onClick={clearInputs}>
          Clear
        </button>
        <button
          type="button"
          className="native-primary-action"
          onClick={calculate}
        >
          ▦ Calculate settling time
        </button>
      </div>

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className="native-result-panel" aria-live="polite">
          <div className="native-result-heading">
            <div>
              <p>Migration time</p>
              <strong>
                {formatNumber(result.migrationTime)} s
              </strong>
            </div>
            <span>{result.modelName}</span>
          </div>

          <div className="native-result-grid">
            <ResultItem
              label="Angular Velocity"
              value={formatNumber(result.angularVelocity)}
              unit="rad/s"
            />
            <ResultItem
              label="Radial Response Coefficient"
              value={formatNumber(
                result.radialResponseCoefficient,
              )}
              unit="1/s"
            />
            <ResultItem
              label="Inner Radial Velocity"
              value={formatNumber(
                result.innerRadialVelocity,
              )}
              unit="m/s"
            />
            <ResultItem
              label="Outer Radial Velocity"
              value={formatNumber(
                result.outerRadialVelocity,
              )}
              unit="m/s"
            />
            <ResultItem
              label="Migration Distance"
              value={formatNumber(result.migrationDistance)}
              unit="m"
            />
            <ResultItem
              label="Outer Centrifugal Acceleration"
              value={formatNumber(
                result.outerCentrifugalAcceleration,
              )}
              unit="m/s²"
            />
            <ResultItem
              label="Outer Relative Centrifugal Force"
              value={formatNumber(
                result.outerRelativeCentrifugalForce,
              )}
              unit="×g"
            />
            <ResultItem
              label="Outer Particle Reynolds Number"
              value={formatNumber(
                result.outerParticleReynoldsNumber,
              )}
              unit="—"
            />
            <ResultItem
              label="Density Difference"
              value={formatNumber(result.densityDifference)}
              unit="kg/m³"
            />
          </div>

          <p className="native-limitation">
            {result.limitationDescription}
          </p>
        </div>
      ) : null}
    </section>
  )
}

interface InputFieldProps {
  label: string
  value: string
  unit: string
  onChange: (value: string) => void
}

function InputField({
  label,
  value,
  unit,
  onChange,
}: InputFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <span className="native-input-shell">
        <input
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>{unit}</b>
      </span>
    </label>
  )
}

interface ResultItemProps {
  label: string
  value: string
  unit: string
}

function ResultItem({
  label,
  value,
  unit,
}: ResultItemProps) {
  return (
    <article>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{unit}</span>
    </article>
  )
}
