import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
} from '../npsh-available-cavitation-margin/types.ts'

export interface RequiredStaticLiquidLevelNpshMarginInput
  extends Omit<
    NpshAvailableCavitationMarginInput,
    'staticLiquidLevelAbovePump'
  > {
  targetNpshMargin: number
}

export type RequiredSuctionConfiguration =
  | 'suction-lift'
  | 'pump-at-liquid-level'
  | 'flooded-suction'

export interface RequiredStaticLiquidLevelNpshMarginResult
  extends NpshAvailableCavitationMarginResult {
  targetNpshMargin: number

  zeroLevelNpshMargin: number

  requiredStaticLiquidLevelAbovePump:
    number

  minimumFloodedSuctionHead:
    number

  maximumSuctionLift:
    number

  requiredSuctionConfiguration:
    RequiredSuctionConfiguration

  marginResidual: number

  modelName: string
  limitationDescription: string
}
