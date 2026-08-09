import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
} from '../npsh-available-cavitation-margin/types.ts'

export interface MaximumSuctionFlowRateNpshMarginInput
  extends Omit<
    NpshAvailableCavitationMarginInput,
    'volumetricFlowRate'
  > {
  targetNpshMargin: number
}

export interface MaximumSuctionFlowRateNpshMarginResult
  extends NpshAvailableCavitationMarginResult {
  maximumVolumetricFlowRate: number

  maximumVolumetricFlowRateCubicMetersPerHour:
    number

  maximumVolumetricFlowRateLitersPerSecond:
    number

  maximumMassFlowRate: number

  targetNpshMargin: number

  zeroFlowNpshMargin: number

  marginResidual: number

  iterationCount: number

  modelName: string

  limitationDescription: string
}
