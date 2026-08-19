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
  calculateMinimumFluidizationVelocity,
} from './engine'

const EXAMPLE = {
  particleDiameter:
    '0.0005',

  particleDensity:
    '1200',

  fluidDensity:
    '1.2',

  dynamicViscosity:
    '0.000018',

  gravity:
    '9.80665',
}

export function MinimumFluidizationVelocityCalculator() {
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
      typeof calculateMinimumFluidizationVelocity
    >
    | null
  >(null)

  const [
    error,
    setError,
  ] = useState('')

  function calculate() {
    try {
      const values = {
        particleDiameter:
          Number(
            inputs.particleDiameter,
          ),

        particleDensity:
          Number(
            inputs.particleDensity,
          ),

        fluidDensity:
          Number(
            inputs.fluidDensity,
          ),

        dynamicViscosity:
          Number(
            inputs.dynamicViscosity,
          ),

        gravity:
          Number(
            inputs.gravity,
          ),
      }

      const next =
        calculateMinimumFluidizationVelocity(
          values,
        )

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
          : 'Unable to calculate minimum fluidization velocity.',
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
      particleDiameter:
        '',

      particleDensity:
        '',

      fluidDensity:
        '',

      dynamicViscosity:
        '',

      gravity:
        '',
    })

    setResult(null)
    setError('')
  }

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

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          ⇧
        </div>

        <div>
          <p>
            Fluid Mechanics · FM–91
          </p>

          <h2>
            Minimum Fluidization Velocity
          </h2>

          <span>
            Wen–Yu fluidized-bed screening correlation
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Wen &amp; Yu (1966) ·
        A generalized method for predicting
        the minimum fluidization velocity ·
        AIChE Journal 12(3), 610–612 ·
        DOI 10.1002/aic.690120343
      </ReferenceBasis>

      <div className="native-formula">
        Ar = g dₚ³ ρf(ρₚ − ρf) / μ²
        {' · '}
        Reₘf = √(33.7² + 0.0408 Ar) − 33.7
        {' · '}
        Uₘf = Reₘf μ / (ρf dₚ)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Particle diameter"
          value={
            inputs.particleDiameter
          }
          unit="m"
          onChange={(
            value,
          ) =>
            updateInput(
              'particleDiameter',
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
          label="Fluid density"
          value={
            inputs.fluidDensity
          }
          unit="kg/m³"
          onChange={(
            value,
          ) =>
            updateInput(
              'fluidDensity',
              value,
            )
          }
        />

        <NumericInput
          label="Dynamic viscosity"
          value={
            inputs.dynamicViscosity
          }
          unit="Pa·s"
          onChange={(
            value,
          ) =>
            updateInput(
              'dynamicViscosity',
              value,
            )
          }
        />

        <NumericInput
          label="Gravity"
          value={
            inputs.gravity
          }
          unit="m/s²"
          onChange={(
            value,
          ) =>
            updateInput(
              'gravity',
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
        calculateLabel="Calculate Umf"
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
          headlineLabel="Minimum fluidization velocity"
          headlineValue={`${formatEngineeringNumber(
            result.minimumFluidizationVelocity,
          )} m/s`}
          modelName="Wen–Yu minimum fluidization correlation"
          note="Screening estimate for incipient fluidization. Validate against particle shape, size distribution, bed geometry and operating-condition data before design use."
        >
          <ResultItem
            label="Minimum-fluidization Reynolds number"
            value={
              formatEngineeringNumber(
                result.minimumFluidizationReynoldsNumber,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Archimedes number"
            value={
              formatEngineeringNumber(
                result.archimedesNumber,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Velocity"
            value={
              formatEngineeringNumber(
                result.minimumFluidizationVelocity
                * 100,
              )
            }
            unit="cm/s"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
