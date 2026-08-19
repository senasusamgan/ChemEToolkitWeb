import {
  useState,
} from 'react'

import {
  ActionBar,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

import {
  calculateGeldartParticleClassification,
} from './engine'

const EXAMPLE = {
  particleDiameterMicrometres:
    '100',

  particleDensity:
    '1001.2',

  gasDensity:
    '1.2',
}

export function GeldartParticleClassificationCalculator() {
  const [
    inputs,
    setInputs,
  ] = useState(
    EXAMPLE,
  )

  const [
    result,
    setResult,
  ] = useState<
    ReturnType<
      typeof calculateGeldartParticleClassification
    >
    | null
  >(null)

  const [
    error,
    setError,
  ] = useState('')

  function updateInput(
    key:
      keyof typeof inputs,
    value:
      string,
  ) {
    setInputs(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    )
  }

  function calculate() {
    try {
      const next =
        calculateGeldartParticleClassification({
          particleDiameterMicrometres:
            Number(
              inputs.particleDiameterMicrometres,
            ),

          particleDensity:
            Number(
              inputs.particleDensity,
            ),

          gasDensity:
            Number(
              inputs.gasDensity,
            ),
        })

      setResult(
        next,
      )

      setError('')
    } catch (
      caughtError
    ) {
      setResult(null)

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to classify the particle system.',
      )
    }
  }

  function loadExample() {
    setInputs(
      EXAMPLE,
    )

    setResult(null)
    setError('')
  }

  function clearInputs() {
    setInputs({
      particleDiameterMicrometres:
        '',

      particleDensity:
        '',

      gasDensity:
        '',
    })

    setResult(null)
    setError('')
  }

  const modelName =
    result
      ? result.nearBoundary
        ? `Geldart Group ${result.group} · near a classification boundary`
        : `Geldart Group ${result.group}`
      : ''

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          ◌
        </div>

        <div>
          <p>
            Fluid Mechanics · FM–93
          </p>

          <h2>
            Geldart Particle Classification
          </h2>

          <span>
            Screening classification for gas–solid fluidization behaviour
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Geldart (1973), Types of gas fluidization,
        Powder Technology 7, 285–292 ·
        classic ambient-air density–particle-size map.
        The Group C transition is an empirical screening region,
        so near-boundary results should be treated as indicative.
      </ReferenceBasis>

      <div className="native-formula">
        A/B index =
        Δρ[g/cm³] dₚ[μm]
        {' · '}
        A/B boundary ≈ 225
        {' · '}
        D screening index =
        Δρ[g/cm³] dₚ²[μm²]
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Mean particle diameter"
          value={
            inputs.particleDiameterMicrometres
          }
          unit="μm"
          onChange={(
            value,
          ) =>
            updateInput(
              'particleDiameterMicrometres',
              value,
            )
          }
        />

        <NumericInput
          label="Particle density"
          value={
            inputs.particleDensity
          }
          unit="kg/m³"
          onChange={(
            value,
          ) =>
            updateInput(
              'particleDensity',
              value,
            )
          }
        />

        <NumericInput
          label="Gas density"
          value={
            inputs.gasDensity
          }
          unit="kg/m³"
          onChange={(
            value,
          ) =>
            updateInput(
              'gasDensity',
              value,
            )
          }
        />
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Classify particles"
      />

      {error ? (
        <div
          className="native-error"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Geldart classification"
          headlineValue={`Group ${result.group}`}
          modelName={
            modelName
          }
          note={
            result.behaviour
          }
        >
          <ResultItem
            label="Density difference"
            value={
              formatEngineeringNumber(
                result.densityDifference,
              )
            }
            unit="kg/m³"
          />

          <ResultItem
            label="A/B classification index"
            value={
              formatEngineeringNumber(
                result.groupABIndex,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Large-particle D index"
            value={
              formatEngineeringNumber(
                result.groupDIndex,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Boundary status"
            value={
              result.nearBoundary
                ? 'Near boundary'
                : 'Clear screening region'
            }
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
