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
  calculateFluidizedBedPressureDrop,
} from './engine'

const EXAMPLE = {
  particleDiameter:
    '0.0005',

  particleSphericity:
    '0.9',

  bedVoidage:
    '0.45',

  bedHeight:
    '0.6',

  particleDensity:
    '1200',

  fluidDensity:
    '1.2',

  dynamicViscosity:
    '0.000018',

  superficialVelocity:
    '0.08',

  gravity:
    '9.80665',
}

export function FluidizedBedPressureDropCalculator() {
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
      typeof calculateFluidizedBedPressureDrop
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
        calculateFluidizedBedPressureDrop({
          particleDiameter:
            Number(
              inputs.particleDiameter,
            ),

          particleSphericity:
            Number(
              inputs.particleSphericity,
            ),

          bedVoidage:
            Number(
              inputs.bedVoidage,
            ),

          bedHeight:
            Number(
              inputs.bedHeight,
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

          superficialVelocity:
            Number(
              inputs.superficialVelocity,
            ),

          gravity:
            Number(
              inputs.gravity,
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
          : 'Unable to calculate fluidized-bed pressure drop.',
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

      particleSphericity:
        '',

      bedVoidage:
        '',

      bedHeight:
        '',

      particleDensity:
        '',

      fluidDensity:
        '',

      dynamicViscosity:
        '',

      superficialVelocity:
        '',

      gravity:
        '',
    })

    setResult(null)
    setError('')
  }

  const stateLabel =
    result?.state ===
      'at-or-above-threshold'
      ? 'Fluidization threshold reached or exceeded'
      : 'Below incipient-fluidization threshold'

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          ⇅
        </div>

        <div>
          <p>
            Fluid Mechanics · FM–92
          </p>

          <h2>
            Fluidized-Bed Pressure Drop
          </h2>

          <span>
            Ergun pressure demand with an incipient-fluidization check
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Ergun (1952) fixed-bed pressure drop
        {' + '}
        incipient-fluidization bed-weight force balance ·
        Chemical Engineering Progress 48(2), 89–94
      </ReferenceBasis>

      <div className="native-formula">
        ΔP/L =
        150 μU(1−ε)²/(φ²dₚ²ε³)
        {' + '}
        1.75ρfU²(1−ε)/(φdₚε³)
        {' · '}
        (ΔP/L)mf =
        (ρₚ−ρf)(1−ε)g
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
          label="Particle sphericity"
          value={
            inputs.particleSphericity
          }
          unit="—"
          onChange={(
            value,
          ) =>
            updateInput(
              'particleSphericity',
              value,
            )
          }
        />

        <NumericInput
          label="Bed voidage"
          value={
            inputs.bedVoidage
          }
          unit="—"
          onChange={(
            value,
          ) =>
            updateInput(
              'bedVoidage',
              value,
            )
          }
        />

        <NumericInput
          label="Bed height"
          value={
            inputs.bedHeight
          }
          unit="m"
          onChange={(
            value,
          ) =>
            updateInput(
              'bedHeight',
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
          label="Superficial velocity"
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
        calculateLabel="Check pressure drop"
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
          headlineLabel="Ergun bed pressure drop"
          headlineValue={`${formatEngineeringNumber(
            result.pressureDrop
            / 1000,
          )} kPa`}
          modelName={
            stateLabel
          }
          note="The Ergun equation represents fixed-bed resistance. When the calculated pressure demand reaches or exceeds the effective bed-weight threshold, the fixed-bed assumption is no longer self-consistent and fluidization should be expected."
        >
          <ResultItem
            label="Pressure gradient"
            value={
              formatEngineeringNumber(
                result.totalPressureGradient
                / 1000,
              )
            }
            unit="kPa/m"
          />

          <ResultItem
            label="Bed-weight threshold"
            value={
              formatEngineeringNumber(
                result.bedWeightPressureDrop
                / 1000,
              )
            }
            unit="kPa"
          />

          <ResultItem
            label="ΔP / bed-weight threshold"
            value={
              formatEngineeringNumber(
                result.fluidizationRatio,
              )
            }
            unit="—"
          />

          <ResultItem
            label="Viscous contribution"
            value={
              formatEngineeringNumber(
                result.viscousPressureGradient
                / 1000,
              )
            }
            unit="kPa/m"
          />

          <ResultItem
            label="Inertial contribution"
            value={
              formatEngineeringNumber(
                result.inertialPressureGradient
                / 1000,
              )
            }
            unit="kPa/m"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
