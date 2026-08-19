export const FLUIDIZED_BED_EXPANSION_RICHARDSON_ZAKI_ENGINE_VERSION =
  '1.0.0'

export type FluidizedBedExpansionState =
  | 'expanded'
  | 'below-initial-state'

export interface FluidizedBedExpansionInputs {
  particleDiameter: number
  fluidDensity: number
  dynamicViscosity: number
  terminalVelocity: number
  superficialVelocity: number
  initialVoidage: number
  initialBedHeight: number
}

export interface FluidizedBedExpansionResult {
  terminalReynoldsNumber: number
  richardsonZakiExponent: number
  velocityRatio: number
  expandedVoidage: number
  expandedBedHeight: number
  bedExpansionRatio: number
  bedExpansionPercent: number
  state: FluidizedBedExpansionState
}

export function calculateRichardsonZakiExponent(
  terminalReynoldsNumber: number,
): number {
  if (
    !Number.isFinite(
      terminalReynoldsNumber,
    )
    || terminalReynoldsNumber <= 0
  ) {
    throw new Error(
      'Terminal Reynolds number must be finite and greater than zero.',
    )
  }

  if (
    terminalReynoldsNumber < 0.2
  ) {
    return 4.65
  }

  if (
    terminalReynoldsNumber < 1
  ) {
    return (
      4.4
      * terminalReynoldsNumber
        ** -0.03
    )
  }

  if (
    terminalReynoldsNumber < 500
  ) {
    return (
      4.4
      * terminalReynoldsNumber
        ** -0.1
    )
  }

  return 2.4
}

export function calculateFluidizedBedExpansionRichardsonZaki(
  inputs:
    FluidizedBedExpansionInputs,
): FluidizedBedExpansionResult {
  const {
    particleDiameter,
    fluidDensity,
    dynamicViscosity,
    terminalVelocity,
    superficialVelocity,
    initialVoidage,
    initialBedHeight,
  } = inputs

  for (
    const value
    of [
      particleDiameter,
      fluidDensity,
      dynamicViscosity,
      terminalVelocity,
      superficialVelocity,
      initialBedHeight,
    ]
  ) {
    if (
      !Number.isFinite(value)
      || value <= 0
    ) {
      throw new Error(
        'Physical properties, velocities and dimensions must be finite and greater than zero.',
      )
    }
  }

  if (
    !Number.isFinite(
      initialVoidage,
    )
    || initialVoidage <= 0
    || initialVoidage >= 1
  ) {
    throw new Error(
      'Initial bed voidage must lie strictly between zero and one.',
    )
  }

  if (
    superficialVelocity >=
    terminalVelocity
  ) {
    throw new Error(
      'Superficial velocity must remain below the single-particle terminal velocity for this dense-bed Richardson–Zaki calculation.',
    )
  }

  const terminalReynoldsNumber =
    (
      fluidDensity
      * terminalVelocity
      * particleDiameter
    )
    / dynamicViscosity

  const richardsonZakiExponent =
    calculateRichardsonZakiExponent(
      terminalReynoldsNumber,
    )

  const velocityRatio =
    superficialVelocity
    / terminalVelocity

  const expandedVoidage =
    velocityRatio
    ** (
      1
      / richardsonZakiExponent
    )

  if (
    !Number.isFinite(
      expandedVoidage,
    )
    || expandedVoidage <= 0
    || expandedVoidage >= 1
  ) {
    throw new Error(
      'Richardson–Zaki prediction produced a nonphysical bed voidage.',
    )
  }

  const bedExpansionRatio =
    (
      1
      - initialVoidage
    )
    / (
      1
      - expandedVoidage
    )

  const expandedBedHeight =
    initialBedHeight
    * bedExpansionRatio

  const bedExpansionPercent =
    (
      bedExpansionRatio
      - 1
    )
    * 100

  return {
    terminalReynoldsNumber,
    richardsonZakiExponent,
    velocityRatio,
    expandedVoidage,
    expandedBedHeight,
    bedExpansionRatio,
    bedExpansionPercent,
    state:
      expandedVoidage >
      initialVoidage
        ? 'expanded'
        : 'below-initial-state',
  }
}
