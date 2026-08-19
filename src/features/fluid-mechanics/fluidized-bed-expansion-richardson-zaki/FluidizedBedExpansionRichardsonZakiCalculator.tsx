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
  calculateFluidizedBedExpansionRichardsonZaki,
} from './engine'

const EXAMPLE = {
  particleDiameter:
    '0.0003',

  fluidDensity:
    '1.2',

  dynamicViscosity:
    '0.000018',

  terminalVelocity:
    '2',

  superficialVelocity:
    '0.3',

  initialVoidage:
    '0.42',

  initialBedHeight:
    '0.6',
}

export function FluidizedBedExpansionRichardsonZakiCalculator() {
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
      typeof calculateFluidizedBedExpansionRichardsonZaki
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
        calculateFluidizedBedExpansionRichardsonZaki({
          particleDiameter:
            Number(
              inputs.particleDiameter,
            ),

          fluidDensity:
            Number(
              inputs.fluidDensity,
            ),

          dynamicViscosity:
            Number(
              inputs.dynamicViscosity,
            ),

          terminalVelocity:
            Number(
              inputs.terminalVelocity,
            ),

          superficialVelocity:
            Number(
              inputs.superficialVelocity,
            ),

          initialVoidage:
            Number(
              inputs.initialVoidage,
            ),

          initialBedHeight:
            Number(
              inputs.initialBedHeight,
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
          : 'Unable to calculate fluidized-bed expansion.',
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

      fluidDensity:
        '',

      dynamicViscosity:
        '',

      terminalVelocity:
        '',

      superficialVelocity:
        '',

      initialVoidage:
        '',

      initialBedHeight:
        '',
    })

    setResult(null)
    setError('')
  }

  const stateLabel =
    result?.state ===
      'expanded'
      ? 'Predicted bed expansion above the initial state'
      : 'Predicted voidage is below the supplied initial state'

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          ↕
        </div>

        <div>
          <p>
            Fluid Mechanics · FM–94
          </p>

          <h2>
            Fluidized-Bed Expansion
          </h2>

          <span>
            Richardson–Zaki voidage and expanded-bed-height prediction
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Richardson & Zaki (1954),
        Sedimentation and fluidisation:
        Part I · Transactions of the
        Institution of Chemical Engineers
        32, 35–53
      </ReferenceBasis>

      <div className="native-formula">
        U/Uₜ = εⁿ
        {' · '}
        ε = (U/Uₜ)^(1/n)
        {' · '}
        H/H₀ =
        (1−ε₀)/(1−ε)
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
          label="Single-particle terminal velocity"
          value={
            inputs.terminalVelocity
          }
          unit="m/s"
          onChange={(
            value,
          ) =>
            updateInput(
              'terminalVelocity',
              value,
            )
          }
        />

        <NumericInput
          label="Superficial fluid velocity"
          value={
            inputs.superficialVelocity
          }
          unit="m/s"
          onChange={(
            value,
          ) =>
            updateInput(
              'superficialVelocity',
              value,
            )
          }
        />

        <NumericInput
          label="Initial bed voidage"
          value={
            inputs.initialVoidage
          }
          unit="—"
          onChange={(
            value,
          ) =>
            updateInput(
              'initialVoidage',
              value,
            )
          }
        />

        <NumericInput
          label="Initial bed height"
          value={
            inputs.initialBedHeight
          }
          unit="m"
          onChange={(
            value,
          ) =>
            updateInput(
              'initialBedHeight',
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
        calculateLabel="Calculate bed expansion"
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
          headlineLabel="Expanded bed height"
          headlineValue={`${formatEngineeringNumber(
            result.expandedBedHeight,
          )} m`}
          modelName={
            stateLabel
          }
          note="Richardson–Zaki is a hindered-settling / particulate-fluidization correlation. Bubbling, slugging, cohesive-powder effects and distributor nonuniformity require additional hydrodynamic checks."
        >
          <ResultItem
            label="Predicted bed voidage"
            value={
              formatEngineeringNumber(
                result.expandedVoidage,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Bed expansion"
            value={
              formatEngineeringNumber(
                result.bedExpansionPercent,
              )
            }
            unit="%"
          />

          <ResultItem
            label="Bed-height ratio H/H₀"
            value={
              formatEngineeringNumber(
                result.bedExpansionRatio,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Terminal Reynolds number"
            value={
              formatEngineeringNumber(
                result.terminalReynoldsNumber,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Richardson–Zaki exponent n"
            value={
              formatEngineeringNumber(
                result.richardsonZakiExponent,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Velocity ratio U/Uₜ"
            value={
              formatEngineeringNumber(
                result.velocityRatio,
              )
            }
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
