import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
} from '../npsh-available-cavitation-margin/types.ts'

export interface MinimumSuctionPipeDiameterNpshMarginInput
  extends Omit<
    NpshAvailableCavitationMarginInput,
    'suctionPipeDiameter'
  > {
  targetNpshMargin: number
}

export interface MinimumSuctionPipeDiameterNpshMarginResult
  extends NpshAvailableCavitationMarginResult {
  requiredSuctionPipeDiameter: number

  requiredSuctionPipeDiameterMillimeters:
    number

  requiredSuctionPipeDiameterInches:
    number

  targetNpshMargin: number

  marginResidual: number

  maximumAchievableNpshMargin:
    number

  iterationCount: number

  modelName: string
  limitationDescription: string
}
