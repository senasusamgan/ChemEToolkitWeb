import type {
  NpshAvailableCavitationMarginInput,
  NpshAvailableCavitationMarginResult,
} from '../npsh-available-cavitation-margin/types.ts'

export interface MaximumSuctionLineLengthNpshMarginInput
  extends Omit<
    NpshAvailableCavitationMarginInput,
    'suctionPipeLength'
  > {
  targetNpshMargin: number
}

export interface MaximumSuctionLineLengthNpshMarginResult
  extends NpshAvailableCavitationMarginResult {
  maximumSuctionPipeLength: number

  targetNpshMargin: number

  zeroLengthNpshMargin: number

  distributedHeadLossPerUnitLength:
    number

  marginLossPerUnitLength:
    number

  marginResidual: number

  modelName: string

  limitationDescription: string
}
