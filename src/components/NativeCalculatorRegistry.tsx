import type {
  ReactNode,
} from 'react'

import { PhaseThirteenNativeCalculator } from '../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PhaseTwelveNativeCalculator } from '../features/native-migrations/phase-twelve/PhaseTwelveNativeCalculator'
import { PhaseElevenNativeCalculator } from '../features/native-migrations/phase-eleven/PhaseElevenNativeCalculator'
import { PhaseTenThermodynamicsCalculator } from '../features/native-migrations/phase-ten-thermodynamics/PhaseTenThermodynamicsCalculator'
import { PhaseNineNativeCalculator } from '../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PriorityTenNativeCalculator } from '../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'
import { SecondFiveNativeCalculator } from '../features/native-migrations/second-five-native/SecondFiveNativeCalculator'
import { TopFiveNativeCalculator } from '../features/native-migrations/top-five-native/TopFiveNativeCalculator'
import { BinaryFlashCalculator } from '../features/mass-transfer/binary-flash/BinaryFlashCalculator'
import { CentrifugalSettlingCalculator } from '../features/mass-transfer/centrifugal-settling/CentrifugalSettlingCalculator'
import { ConstantPressureFiltrationCalculator } from '../features/mass-transfer/constant-pressure-filtration/ConstantPressureFiltrationCalculator'
import { CountercurrentSolidsWashingCalculator } from '../features/mass-transfer/countercurrent-solids-washing/CountercurrentSolidsWashingCalculator'
import { CrystallizationYieldMotherLiquorCalculator } from '../features/mass-transfer/crystallization-yield-mother-liquor/CrystallizationYieldMotherLiquorCalculator'
import { DistillationOperatingLinesCalculator } from '../features/mass-transfer/distillation-operating-lines/DistillationOperatingLinesCalculator'
import { DryingRateTimeCalculator } from '../features/mass-transfer/drying-rate-time/DryingRateTimeCalculator'
import { FiniteVolumeDialysisCalculator } from '../features/mass-transfer/finite-volume-dialysis/FiniteVolumeDialysisCalculator'
import { HumidificationPsychrometricsCalculator } from '../features/mass-transfer/humidification-psychrometrics/HumidificationPsychrometricsCalculator'
import { IonExchangeBedSizingCalculator } from '../features/mass-transfer/ion-exchange-bed-sizing/IonExchangeBedSizingCalculator'
import { McCabeThieleMethodCalculator } from '../features/mass-transfer/mccabe-thiele-method/McCabeThieleMethodCalculator'
import { MSMPRCrystallizerDesignCalculator } from '../features/mass-transfer/msmpr-crystallizer-design/MSMPRCrystallizerDesignCalculator'
import { PackedColumnHydraulicsCalculator } from '../features/mass-transfer/packed-column-hydraulics/PackedColumnHydraulicsCalculator'
import { RelativeVolatilityBinaryVLECalculator } from '../features/mass-transfer/relative-volatility-binary-vle/RelativeVolatilityBinaryVLECalculator'
import { SingleStageLeachingRecoveryCalculator } from '../features/mass-transfer/single-stage-leaching-recovery/SingleStageLeachingRecoveryCalculator'
import { SingleStageLiquidLiquidExtractionCalculator } from '../features/mass-transfer/single-stage-liquid-liquid-extraction/SingleStageLiquidLiquidExtractionCalculator'
import { UltrafiltrationConcentrationPolarizationCalculator } from '../features/mass-transfer/ultrafiltration-concentration-polarization/UltrafiltrationConcentrationPolarizationCalculator'
import { BatchSettlingAreaEstimateCalculator } from '../features/separation-processes/batch-settling-area-estimate/BatchSettlingAreaEstimateCalculator'
import { CentrifugeSigmaScaleUpCalculator } from '../features/separation-processes/centrifuge-sigma-scale-up/CentrifugeSigmaScaleUpCalculator'
import { ConstantPressureFilterSizingCalculator } from '../features/separation-processes/constant-pressure-filter-sizing/ConstantPressureFilterSizingCalculator'
import { CoolingCrystallizerYieldCalculator } from '../features/separation-processes/cooling-crystallizer-yield/CoolingCrystallizerYieldCalculator'
import { EvaporativeCrystallizerBalanceCalculator } from '../features/separation-processes/evaporative-crystallizer-balance/EvaporativeCrystallizerBalanceCalculator'
import { DryerThermalDutyCalculator } from '../features/separation-processes/dryer-thermal-duty/DryerThermalDutyCalculator'
import { BinaryDistillationBalanceCalculator } from '../features/separation-processes/binary-distillation-balance/BinaryDistillationBalanceCalculator'
import { ExtractionDistributionSelectivityCalculator } from '../features/separation-processes/extraction-distribution-selectivity/ExtractionDistributionSelectivityCalculator'
import { ExtractionSolventRequirementCalculator } from '../features/separation-processes/extraction-solvent-requirement/ExtractionSolventRequirementCalculator'
import { CrosscurrentExtractionStagesCalculator } from '../features/separation-processes/crosscurrent-extraction-stages/CrosscurrentExtractionStagesCalculator'
import { CountercurrentExtractionStagesCalculator } from '../features/separation-processes/countercurrent-extraction-stages/CountercurrentExtractionStagesCalculator'
import { GillilandStageEstimateCalculator } from '../features/separation-processes/gilliland-stage-estimate/GillilandStageEstimateCalculator'
import { FenskeUnderwoodGillilandCalculator } from '../features/separation-processes/fenske-underwood-gilliland-shortcut/FenskeUnderwoodGillilandCalculator'
import { SoudersBrownColumnDiameterCalculator } from '../features/separation-processes/souders-brown-column-diameter/SoudersBrownColumnDiameterCalculator'
import { TrayHydraulicsWeepingCalculator } from '../features/separation-processes/tray-hydraulics-weeping-check/TrayHydraulicsWeepingCalculator'
import { TrayDowncomerBackupCalculator } from '../features/separation-processes/tray-downcomer-backup-residence/TrayDowncomerBackupCalculator'
import { PackedColumnHtuNtuCalculator } from '../features/separation-processes/packed-column-htu-ntu-height/PackedColumnHtuNtuCalculator'
import { PackedColumnPressureDropCalculator } from '../features/separation-processes/packed-column-pressure-drop-flooding/PackedColumnPressureDropCalculator'
import { PackedColumnLiquidHoldupCalculator } from '../features/separation-processes/packed-column-liquid-holdup-residence/PackedColumnLiquidHoldupCalculator'
import { PackedColumnLiquidDistributorCalculator } from '../features/separation-processes/packed-column-liquid-distributor-irrigation/PackedColumnLiquidDistributorCalculator'
import { PackedColumnGasLoadCalculator } from '../features/separation-processes/packed-column-gas-load-f-factor/PackedColumnGasLoadCalculator'
import { PackedColumnRedistributorCalculator } from '../features/separation-processes/packed-column-redistributor-spacing/PackedColumnRedistributorCalculator'
import { KremserAbsorptionCalculator } from '../features/separation-processes/kremser-absorption-factor-stages/KremserAbsorptionCalculator'
import { AbsorberMinimumSolventRateCalculator } from '../features/separation-processes/absorber-minimum-solvent-rate/AbsorberMinimumSolventRateCalculator'
import { AbsorptionStrippingFactorsCalculator } from '../features/separation-processes/absorption-stripping-factors/AbsorptionStrippingFactorsCalculator'
import { AdsorbentMassRequirementCalculator } from '../features/separation-processes/adsorbent-mass-requirement/AdsorbentMassRequirementCalculator'
import { BetMonolayerCapacityCalculator } from '../features/separation-processes/bet-monolayer-capacity/BetMonolayerCapacityCalculator'
import { KremserAbsorptionStagesCalculator } from '../features/separation-processes/kremser-absorption-stages/KremserAbsorptionStagesCalculator'
import { KremserStrippingStagesCalculator } from '../features/separation-processes/kremser-stripping-stages/KremserStrippingStagesCalculator'
import { StrippingMinimumGasRateCalculator } from '../features/separation-processes/stripping-minimum-gas-rate/StrippingMinimumGasRateCalculator'
import { GasMembraneAreaRequirementCalculator } from '../features/separation-processes/gas-membrane-area-requirement/GasMembraneAreaRequirementCalculator'
import { IdealGasMembraneStageCutCalculator } from '../features/separation-processes/ideal-gas-membrane-stage-cut/IdealGasMembraneStageCutCalculator'
import { ReverseOsmosisWaterFluxCalculator } from '../features/separation-processes/reverse-osmosis-water-flux/ReverseOsmosisWaterFluxCalculator'
import { UltrafiltrationResistanceSeriesCalculator } from '../features/separation-processes/ultrafiltration-resistance-series/UltrafiltrationResistanceSeriesCalculator'
import { PsychrometricAirStreamMixingCalculator } from '../features/separation-processes/psychrometric-air-stream-mixing/PsychrometricAirStreamMixingCalculator'
import { RelativeHumidityHumidificationCalculator } from '../features/separation-processes/relative-humidity-humidification/RelativeHumidityHumidificationCalculator'
import { CombinedDryerTimeCalculator } from '../features/separation-processes/combined-dryer-time/CombinedDryerTimeCalculator'
import { FixedBedAdsorberBreakthroughCalculator } from '../features/separation-processes/fixed-bed-adsorber-breakthrough/FixedBedAdsorberBreakthroughCalculator'
import { HydrocycloneSeparationNumberCalculator } from '../features/separation-processes/hydrocyclone-separation-number/HydrocycloneSeparationNumberCalculator'
import { SingleStageGasAbsorptionCalculator } from '../features/separation-processes/single-stage-gas-absorption/SingleStageGasAbsorptionCalculator'
import { SingleStageLeachingBalanceCalculator } from '../features/separation-processes/single-stage-leaching-balance/SingleStageLeachingBalanceCalculator'
import { AdamsBashforthMoultonCalculator } from '../features/numerical-methods/adams-bashforth-moulton/AdamsBashforthMoultonCalculator'
import { AdaptiveRungeKutta45Calculator } from '../features/numerical-methods/adaptive-runge-kutta-45/AdaptiveRungeKutta45Calculator'
import { BroydenNonlinearSystemCalculator } from '../features/numerical-methods/broyden-nonlinear-system/BroydenNonlinearSystemCalculator'
import { CholeskyDecompositionSolverCalculator } from '../features/numerical-methods/cholesky-decomposition-solver/CholeskyDecompositionSolverCalculator'
import { ConjugateGradientSolverCalculator } from '../features/numerical-methods/conjugate-gradient-solver/ConjugateGradientSolverCalculator'
import { CoupledODESystemRK4Calculator } from '../features/numerical-methods/coupled-ode-system-rk4/CoupledODESystemRK4Calculator'
import { CrankNicolsonHeatEquationCalculator } from '../features/numerical-methods/crank-nicolson-heat-equation/CrankNicolsonHeatEquationCalculator'
import { CubicHermiteInterpolationCalculator } from '../features/numerical-methods/cubic-hermite-interpolation/CubicHermiteInterpolationCalculator'
import { CurveFittingCalculator } from '../features/numerical-methods/curve-fitting/CurveFittingCalculator'
import { GaussNewtonNonlinearRegressionCalculator } from '../features/numerical-methods/gauss-newton-nonlinear-regression/GaussNewtonNonlinearRegressionCalculator'
import { GradientDescentOptimizationCalculator } from '../features/numerical-methods/gradient-descent-optimization/GradientDescentOptimizationCalculator'
import { HighOrderFiniteDifferenceCalculator } from '../features/numerical-methods/high-order-finite-difference/HighOrderFiniteDifferenceCalculator'
import { InversePowerMethodEigenvalueCalculator } from '../features/numerical-methods/inverse-power-method-eigenvalue/InversePowerMethodEigenvalueCalculator'
import { LaplaceEquationFiniteDifferenceCalculator } from '../features/numerical-methods/laplace-equation-finite-difference/LaplaceEquationFiniteDifferenceCalculator'
import { LevenbergMarquardtRegressionCalculator } from '../features/numerical-methods/levenberg-marquardt-regression/LevenbergMarquardtRegressionCalculator'
import { LUDecompositionSolverCalculator } from '../features/numerical-methods/lu-decomposition-solver/LUDecompositionSolverCalculator'
import { MethodOfLinesPDESolverCalculator } from '../features/numerical-methods/method-of-lines-pde-solver/MethodOfLinesPDESolverCalculator'
import { MonteCarloIntegrationCalculator } from '../features/numerical-methods/monte-carlo-integration/MonteCarloIntegrationCalculator'
import { NaturalCubicSplineInterpolationCalculator } from '../features/numerical-methods/natural-cubic-spline-interpolation/NaturalCubicSplineInterpolationCalculator'
import { NelderMeadOptimizationCalculator } from '../features/numerical-methods/nelder-mead-optimization/NelderMeadOptimizationCalculator'
import { NewtonMultivariableOptimizationCalculator } from '../features/numerical-methods/newton-multivariable-optimization/NewtonMultivariableOptimizationCalculator'
import { NewtonRaphsonNonlinearSystemCalculator } from '../features/numerical-methods/newton-raphson-nonlinear-system/NewtonRaphsonNonlinearSystemCalculator'
import { NumericalJacobianCalculator } from '../features/numerical-methods/numerical-jacobian/NumericalJacobianCalculator'
import { OneDimensionalWaveEquationCalculator } from '../features/numerical-methods/one-dimensional-wave-equation/OneDimensionalWaveEquationCalculator'
import { PowerMethodEigenvalueCalculator } from '../features/numerical-methods/power-method-eigenvalue/PowerMethodEigenvalueCalculator'
import { QRDecompositionSolverCalculator } from '../features/numerical-methods/qr-decomposition-solver/QRDecompositionSolverCalculator'
import { RichardsonErrorEstimateCalculator } from '../features/numerical-methods/richardson-error-estimate/RichardsonErrorEstimateCalculator'
import { RiddersRootFinderCalculator } from '../features/numerical-methods/ridders-root-finder/RiddersRootFinderCalculator'
import { ShootingMethodBoundaryValueCalculator } from '../features/numerical-methods/shooting-method-boundary-value/ShootingMethodBoundaryValueCalculator'
import { ThomasTridiagonalSolverCalculator } from '../features/numerical-methods/thomas-tridiagonal-solver/ThomasTridiagonalSolverCalculator'
import { BlockDiagramAlgebraCalculator } from '../features/process-control/block-diagram-algebra/BlockDiagramAlgebraCalculator'
import { CascadeControlCalculator } from '../features/process-control/cascade-control/CascadeControlCalculator'
import { ClosedLoopFeedbackAnalysisCalculator } from '../features/process-control/closed-loop-feedback-analysis/ClosedLoopFeedbackAnalysisCalculator'
import { CohenCoonTuningCalculator } from '../features/process-control/cohen-coon-tuning/CohenCoonTuningCalculator'
import { ProcessControlStrategyComparisonCalculator } from '../features/process-control/process-control-strategy-comparison/ProcessControlStrategyComparisonCalculator'
import { CubicRouthHurwitzStabilityCalculator } from '../features/process-control/cubic-routh-hurwitz-stability/CubicRouthHurwitzStabilityCalculator'
import { FeedforwardControlCalculator } from '../features/process-control/feedforward-control/FeedforwardControlCalculator'
import { FirstOrderFrequencyResponseCalculator } from '../features/process-control/first-order-frequency-response/FirstOrderFrequencyResponseCalculator'
import { GainSchedulingCalculator } from '../features/process-control/gain-scheduling/GainSchedulingCalculator'
import { IntegratingProcessResponseCalculator } from '../features/process-control/integrating-process-response/IntegratingProcessResponseCalculator'
import { InteractingTankSystemCalculator } from '../features/process-control/interacting-tank-system/InteractingTankSystemCalculator'
import { InternalModelControlAnalysisCalculator } from '../features/process-control/internal-model-control-analysis/InternalModelControlAnalysisCalculator'
import { ProcessControlBatch03Calculator } from '../features/process-control/batch03/ProcessControlBatch03Calculator'
import { OpenLoopResponseCalculator } from '../features/process-control/open-loop-response/OpenLoopResponseCalculator'
import { OverrideSelectiveControlCalculator } from '../features/process-control/override-selective-control/OverrideSelectiveControlCalculator'
import { PDControllerCalculator } from '../features/process-control/pd-controller/PDControllerCalculator'
import { PIControllerCalculator } from '../features/process-control/pi-controller/PIControllerCalculator'
import { PressureProcessDynamicsCalculator } from '../features/process-control/pressure-process-dynamics/PressureProcessDynamicsCalculator'
import { ProportionalControllerCalculator } from '../features/process-control/proportional-controller/ProportionalControllerCalculator'
import { ProcessControlBatch05Calculator } from '../features/process-control/batch05/ProcessControlBatch05Calculator'
import { ProcessControlBatch06Calculator } from '../features/process-control/batch06/ProcessControlBatch06Calculator'
import { ProcessSafetyEconomicsBatch01Calculator } from '../features/process-safety-economics/batch01/ProcessSafetyEconomicsBatch01Calculator'
import { ProcessSafetyEconomicsBatch02Calculator } from '../features/process-safety-economics/batch02/ProcessSafetyEconomicsBatch02Calculator'
import { ProcessSafetyEconomicsBatch03Calculator } from '../features/process-safety-economics/batch03/ProcessSafetyEconomicsBatch03Calculator'
import { ProcessSafetyEconomicsBatch04Calculator } from '../features/process-safety-economics/batch04/ProcessSafetyEconomicsBatch04Calculator'
import { ProcessSafetyEconomicsBatch05Calculator } from '../features/process-safety-economics/batch05/ProcessSafetyEconomicsBatch05Calculator'
import { ProcessSafetyEconomicsBatch06Calculator } from '../features/process-safety-economics/batch06/ProcessSafetyEconomicsBatch06Calculator'
import { ProcessSafetyEconomicsBatch07Calculator } from '../features/process-safety-economics/batch07/ProcessSafetyEconomicsBatch07Calculator'
import { ReactionEngineeringBatch01Calculator } from '../features/reaction-engineering/batch01/ReactionEngineeringBatch01Calculator'
import { ReactionEngineeringBatch02Calculator } from '../features/reaction-engineering/batch02/ReactionEngineeringBatch02Calculator'
import { ReactionEngineeringBatch03Calculator } from '../features/reaction-engineering/batch03/ReactionEngineeringBatch03Calculator'
import { ReactionEngineeringBatch04Calculator } from '../features/reaction-engineering/batch04/ReactionEngineeringBatch04Calculator'
import { ReactionEngineeringBatch05Calculator } from '../features/reaction-engineering/batch05/ReactionEngineeringBatch05Calculator'
import { ReactionEngineeringBatch06Calculator } from '../features/reaction-engineering/batch06/ReactionEngineeringBatch06Calculator'
import { ReactionEngineeringBatch07Calculator } from '../features/reaction-engineering/batch07/ReactionEngineeringBatch07Calculator'
import { ReactionEngineeringBatch08Calculator } from '../features/reaction-engineering/batch08/ReactionEngineeringBatch08Calculator'
import { ReactionEngineeringBatch09Calculator } from '../features/reaction-engineering/batch09/ReactionEngineeringBatch09Calculator'
import { LinearInterpolationCalculator } from '../features/engineering-fundamentals/linear-interpolation/LinearInterpolationCalculator'
import { WeightedAveragePropertyCalculator } from '../features/engineering-fundamentals/weighted-average-property/WeightedAveragePropertyCalculator'
import { FluidBedDryerMassBalanceCalculator } from '../features/material-energy-balances/fluid-bed-dryer-mass-balance/FluidBedDryerMassBalanceCalculator'
import { FluidBedDryerEnergyBalanceCalculator } from '../features/material-energy-balances/fluid-bed-dryer-energy-balance/FluidBedDryerEnergyBalanceCalculator'
import { FluidBedDryerAdiabaticInletTemperatureCalculator } from '../features/material-energy-balances/fluid-bed-dryer-adiabatic-inlet-temperature/FluidBedDryerAdiabaticInletTemperatureCalculator'
import { FluidBedDryerAdiabaticDryAirRequirementCalculator } from '../features/material-energy-balances/fluid-bed-dryer-adiabatic-dry-air-requirement/FluidBedDryerAdiabaticDryAirRequirementCalculator'
import { EvaporatorSteamRequirementEconomyCalculator } from '../features/material-energy-balances/evaporator-steam-requirement-economy/EvaporatorSteamRequirementEconomyCalculator'
import { MultipleEffectEvaporatorSteamEconomyCalculator } from '../features/material-energy-balances/multiple-effect-evaporator-steam-economy/MultipleEffectEvaporatorSteamEconomyCalculator'
import { EvaporatorTargetSteamEconomyEffectCountCalculator } from '../features/material-energy-balances/evaporator-target-steam-economy-effect-count/EvaporatorTargetSteamEconomyEffectCountCalculator'
import { EvaporatorRequiredVaporReuseEfficiencyCalculator } from '../features/material-energy-balances/evaporator-required-vapor-reuse-efficiency/EvaporatorRequiredVaporReuseEfficiencyCalculator'
import { DarcyWeisbachPipeDiameterSizingCalculator } from '../features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/DarcyWeisbachPipeDiameterSizingCalculator'
import { PipeFlowRateFromPressureDropCalculator } from '../features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/PipeFlowRateFromPressureDropCalculator'
import { MaximumPipeLengthFromPressureDropCalculator } from '../features/fluid-mechanics/maximum-pipe-length-pressure-drop/MaximumPipeLengthFromPressureDropCalculator'
import { MaximumMinorLossCoefficientCalculator } from '../features/fluid-mechanics/maximum-minor-loss-coefficient/MaximumMinorLossCoefficientCalculator'
import { NpshAvailableCavitationMarginCalculator } from '../features/fluid-mechanics/npsh-available-cavitation-margin/NpshAvailableCavitationMarginCalculator'
import { MinimumSuctionPipeDiameterNpshMarginCalculator } from '../features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/MinimumSuctionPipeDiameterNpshMarginCalculator'
import { RequiredStaticLiquidLevelNpshMarginCalculator } from '../features/fluid-mechanics/required-static-liquid-level-npsh-margin/RequiredStaticLiquidLevelNpshMarginCalculator'
import { MaximumSuctionFlowRateNpshMarginCalculator } from '../features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/MaximumSuctionFlowRateNpshMarginCalculator'
import { MaximumSuctionLineLengthNpshMarginCalculator } from '../features/fluid-mechanics/maximum-suction-line-length-npsh-margin/MaximumSuctionLineLengthNpshMarginCalculator'
import { PitotTubeVelocityFlowCalculator } from '../features/fluid-mechanics/pitot-tube-velocity-flow/PitotTubeVelocityFlowCalculator'
import { FlowNozzleDifferentialPressureCalculator } from '../features/fluid-mechanics/flow-nozzle-differential-pressure/FlowNozzleDifferentialPressureCalculator'
import { VariableAreaRotameterFlowCalculator } from '../features/fluid-mechanics/variable-area-rotameter-flow/VariableAreaRotameterFlowCalculator'
import { VortexSheddingFlowMeterCalculator } from '../features/fluid-mechanics/vortex-shedding-flow-meter/VortexSheddingFlowMeterCalculator'
import { UltrasonicTransitTimeFlowMeterCalculator } from '../features/fluid-mechanics/ultrasonic-transit-time-flow-meter/UltrasonicTransitTimeFlowMeterCalculator'
import { ElectromagneticFlowMeterCalculator } from '../features/fluid-mechanics/electromagnetic-flow-meter/ElectromagneticFlowMeterCalculator'
import { PositiveDisplacementFlowMeterCalculator } from '../features/fluid-mechanics/positive-displacement-flow-meter/PositiveDisplacementFlowMeterCalculator'
import { TurbineFlowMeterCalculator } from '../features/fluid-mechanics/turbine-flow-meter/TurbineFlowMeterCalculator'
import { SharpCrestedRectangularWeirCalculator } from '../features/fluid-mechanics/sharp-crested-rectangular-weir/SharpCrestedRectangularWeirCalculator'
import { VNotchTriangularWeirCalculator } from '../features/fluid-mechanics/v-notch-triangular-weir/VNotchTriangularWeirCalculator'
import { TrapezoidalChannelManningFlowCalculator } from '../features/fluid-mechanics/trapezoidal-channel-manning-flow/TrapezoidalChannelManningFlowCalculator'
import { TrapezoidalChannelNormalDepthCalculator } from '../features/fluid-mechanics/trapezoidal-channel-normal-depth/TrapezoidalChannelNormalDepthCalculator'
import { RectangularHydraulicJumpCalculator } from '../features/fluid-mechanics/rectangular-hydraulic-jump/RectangularHydraulicJumpCalculator'
import { TrapezoidalChannelCriticalDepthCalculator } from '../features/fluid-mechanics/trapezoidal-channel-critical-depth/TrapezoidalChannelCriticalDepthCalculator'
import { RectangularChannelAlternateDepthCalculator } from '../features/fluid-mechanics/rectangular-channel-alternate-depth/RectangularChannelAlternateDepthCalculator'
import { TrapezoidalChannelCriticalSlopeCalculator } from '../features/fluid-mechanics/trapezoidal-channel-critical-slope/TrapezoidalChannelCriticalSlopeCalculator'
import { TrapezoidalHydraulicJumpCalculator } from '../features/fluid-mechanics/trapezoidal-hydraulic-jump/TrapezoidalHydraulicJumpCalculator'
import { BroadCrestedWeirFlowCalculator } from '../features/fluid-mechanics/broad-crested-weir-flow/BroadCrestedWeirFlowCalculator'
import { TrapezoidalChannelAlternateDepthCalculator } from '../features/fluid-mechanics/trapezoidal-channel-alternate-depth/TrapezoidalChannelAlternateDepthCalculator'
import { TrapezoidalChannelChezyFlowCalculator } from '../features/fluid-mechanics/trapezoidal-channel-chezy-flow/TrapezoidalChannelChezyFlowCalculator'
import { MostEconomicalTrapezoidalChannelCalculator } from '../features/fluid-mechanics/most-economical-trapezoidal-channel/MostEconomicalTrapezoidalChannelCalculator'
import { TrapezoidalChannelDirectStepCalculator } from '../features/fluid-mechanics/trapezoidal-channel-direct-step/TrapezoidalChannelDirectStepCalculator'
import { TrapezoidalChannelGvfSlopeCalculator } from '../features/fluid-mechanics/trapezoidal-channel-gvf-slope/TrapezoidalChannelGvfSlopeCalculator'
import { TrapezoidalChannelGvfProfileRk4Calculator } from '../features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/TrapezoidalChannelGvfProfileRk4Calculator'
import { TrapezoidalMaximumDischargeSpecificEnergyCalculator } from '../features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/TrapezoidalMaximumDischargeSpecificEnergyCalculator'
import { TrapezoidalCriticalControlWidthCalculator } from '../features/fluid-mechanics/trapezoidal-critical-control-width/TrapezoidalCriticalControlWidthCalculator'
import { TrapezoidalMaximumBedRiseBeforeChokingCalculator } from '../features/fluid-mechanics/trapezoidal-max-bed-rise-choking/TrapezoidalMaximumBedRiseBeforeChokingCalculator'
import { TrapezoidalChannelBedRiseCrestDepthCalculator } from '../features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/TrapezoidalChannelBedRiseCrestDepthCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseCalculator } from '../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/TrapezoidalMinimumUpstreamDepthBedRiseCalculator'
import { TrapezoidalMinimumContractionWidthCalculator } from '../features/fluid-mechanics/trapezoidal-min-contraction-width/TrapezoidalMinimumContractionWidthCalculator'
import { TrapezoidalContractionThroatAnalysisCalculator } from '../features/fluid-mechanics/trapezoidal-contraction-throat-analysis/TrapezoidalContractionThroatAnalysisCalculator'
import { TrapezoidalContractionTransitionLossCalculator } from '../features/fluid-mechanics/trapezoidal-contraction-transition-loss/TrapezoidalContractionTransitionLossCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientCalculator } from '../features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/TrapezoidalMaximumTransitionLossCoefficientCalculator'
import { TrapezoidalMaximumDischargeTransitionLossCalculator } from '../features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/TrapezoidalMaximumDischargeTransitionLossCalculator'
import { TrapezoidalMinimumUpstreamDepthContractionLossCalculator } from '../features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/TrapezoidalMinimumUpstreamDepthContractionLossCalculator'
import { TrapezoidalMaximumBedRiseContractionLossCalculator } from '../features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/TrapezoidalMaximumBedRiseContractionLossCalculator'
import { TrapezoidalMinimumWidthBedRiseTransitionLossCalculator } from '../features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/TrapezoidalMinimumWidthBedRiseTransitionLossCalculator'
import { TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator } from '../features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator } from '../features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator } from '../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator'
import { TrapezoidalChannelStandardStepCalculator } from '../features/fluid-mechanics/trapezoidal-channel-standard-step/TrapezoidalChannelStandardStepCalculator'
import { TrapezoidalChannelStandardStepProfileCalculator } from '../features/fluid-mechanics/trapezoidal-channel-standard-step-profile/TrapezoidalChannelStandardStepProfileCalculator'
import { TrapezoidalChannelAdaptiveStandardStepProfileCalculator } from '../features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/TrapezoidalChannelAdaptiveStandardStepProfileCalculator'
import { TrapezoidalChannelUpstreamStandardStepProfileCalculator } from '../features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/TrapezoidalChannelUpstreamStandardStepProfileCalculator'
import { TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { PartiallyFullCircularChannelManningFlowCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-manning-flow/PartiallyFullCircularChannelManningFlowCalculator'
import { PartiallyFullCircularChannelNormalDepthCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-normal-depth/PartiallyFullCircularChannelNormalDepthCalculator'
import { PartiallyFullCircularChannelCriticalDepthCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-critical-depth/PartiallyFullCircularChannelCriticalDepthCalculator'
import { PartiallyFullCircularChannelAlternateDepthsCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-alternate-depths/PartiallyFullCircularChannelAlternateDepthsCalculator'
import { PartiallyFullCircularChannelCriticalSlopeCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-critical-slope/PartiallyFullCircularChannelCriticalSlopeCalculator'
import { PartiallyFullCircularChannelHydraulicJumpCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/PartiallyFullCircularChannelHydraulicJumpCalculator'
import { PartiallyFullCircularChannelDirectStepCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-direct-step/PartiallyFullCircularChannelDirectStepCalculator'
import { PartiallyFullCircularChannelGvfSlopeCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-gvf-slope/PartiallyFullCircularChannelGvfSlopeCalculator'
import { PartiallyFullCircularChannelGvfProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-gvf-profile/PartiallyFullCircularChannelGvfProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveGvfProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/PartiallyFullCircularChannelAdaptiveGvfProfileCalculator'
import { PartiallyFullCircularChannelStandardStepCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-standard-step/PartiallyFullCircularChannelStandardStepCalculator'
import { PartiallyFullCircularChannelStandardStepProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/PartiallyFullCircularChannelStandardStepProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator'
import { PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-upstream-standard-step-profile/PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-minimum-diameter-specific-energy/PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-minimum-required-specific-energy/PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator'
import { PartiallyFullCircularChannelCapacityChokingMarginCalculator } from '../features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/PartiallyFullCircularChannelCapacityChokingMarginCalculator'

type NativeCalculatorRenderer = (
  title: string,
) => ReactNode

const NATIVE_CALCULATOR_RENDERERS: Record<
  string,
  NativeCalculatorRenderer
> = {
  "dragForce": () => {
    const calculatorId = "dragForce" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "minorLosses": () => {
    const calculatorId = "minorLosses" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "orificeMeter": () => {
    const calculatorId = "orificeMeter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "particleSettling": () => {
    const calculatorId = "particleSettling" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reynoldsNumber": () => {
    const calculatorId = "reynoldsNumber" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "tankDrainTime": () => {
    const calculatorId = "tankDrainTime" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "uTubeManometer": () => {
    const calculatorId = "uTubeManometer" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "venturiMeter": () => {
    const calculatorId = "venturiMeter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reactiveMaterialBalance": () => {
    const calculatorId = "reactiveMaterialBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "recyclePurgeInertBalance": () => {
    const calculatorId = "recyclePurgeInertBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "solidsWashingBalance": () => {
    const calculatorId = "solidsWashingBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "soluteDilutionCalculator": () => {
    const calculatorId = "soluteDilutionCalculator" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "streamSplitterBalance": () => {
    const calculatorId = "streamSplitterBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "twoStreamMixerBalance": () => {
    const calculatorId = "twoStreamMixerBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "adaptiveSimpsonIntegration": () => {
    const calculatorId = "adaptiveSimpsonIntegration" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "odeSolver": () => {
    const calculatorId = "odeSolver" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "gaussLegendreQuadrature": () => {
    const calculatorId = "gaussLegendreQuadrature" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "goldenSectionOptimization": () => {
    const calculatorId = "goldenSectionOptimization" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "linearSystems": () => {
    const calculatorId = "linearSystems" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "numericalDifferentiation": () => {
    const calculatorId = "numericalDifferentiation" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "numericalIntegration": () => {
    const calculatorId = "numericalIntegration" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "numericalInterpolation": () => {
    const calculatorId = "numericalInterpolation" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "rootFinding": () => {
    const calculatorId = "rootFinding" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "rombergIntegration": () => {
    const calculatorId = "rombergIntegration" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "firstOrderPlusDeadTimeProcess": () => {
    const calculatorId = "firstOrderPlusDeadTimeProcess" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "firstOrderProcessResponse": () => {
    const calculatorId = "firstOrderProcessResponse" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "imcControllerTuning": () => {
    const calculatorId = "imcControllerTuning" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "pidController": () => {
    const calculatorId = "pidController" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "secondOrderProcessResponse": () => {
    const calculatorId = "secondOrderProcessResponse" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "zieglerNicholsReactionCurveTuning": () => {
    const calculatorId = "zieglerNicholsReactionCurveTuning" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "arrheniusRateConstant": () => {
    const calculatorId = "arrheniusRateConstant" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "constantVolumeStoichiometry": () => {
    const calculatorId = "constantVolumeStoichiometry" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "conversionYieldSelectivity": () => {
    const calculatorId = "conversionYieldSelectivity" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "cstrsInSeries": () => {
    const calculatorId = "cstrsInSeries" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "pfrSections": () => {
    const calculatorId = "pfrSections" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reactionRateCalculator": () => {
    const calculatorId = "reactionRateCalculator" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reactorComparison": () => {
    const calculatorId = "reactorComparison" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reactorDesign": () => {
    const calculatorId = "reactorDesign" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "spaceTimeSpaceVelocity": () => {
    const calculatorId = "spaceTimeSpaceVelocity" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "binaryIsothermalFlash": () => {
    const calculatorId = "binaryIsothermalFlash" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "binaryMinimumReflux": () => {
    const calculatorId = "binaryMinimumReflux" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "binaryRelativeVolatilityVLE": () => {
    const calculatorId = "binaryRelativeVolatilityVLE" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "cycloneCutDiameter": () => {
    const calculatorId = "cycloneCutDiameter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "fenskeMinimumStages": () => {
    const calculatorId = "fenskeMinimumStages" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "absorptionMinimumSolventRate": () => {
    const calculatorId = "absorptionMinimumSolventRate" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "murphreeTrayEfficiency": () => {
    const calculatorId = "murphreeTrayEfficiency" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "packedColumnHTUNTU": () => {
    const calculatorId = "packedColumnHTUNTU" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "psychrometricAirEnthalpy": () => {
    const calculatorId = "psychrometricAirEnthalpy" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "averageMolecularWeight": () => {
    const calculatorId = "averageMolecularWeight" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "binaryCompositionBasisConversion": () => {
    const calculatorId = "binaryCompositionBasisConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "chemicalFormulaMolecularWeight": () => {
    const calculatorId = "chemicalFormulaMolecularWeight" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "densitySpecificGravity": () => {
    const calculatorId = "densitySpecificGravity" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "engineeringPrefixConverter": () => {
    const calculatorId = "engineeringPrefixConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "massFlowMolarFlowConversion": () => {
    const calculatorId = "massFlowMolarFlowConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "massFractionCalculator": () => {
    const calculatorId = "massFractionCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "massMoleConversion": () => {
    const calculatorId = "massMoleConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "mixtureDensityCalculator": () => {
    const calculatorId = "mixtureDensityCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "moleFractionCalculator": () => {
    const calculatorId = "moleFractionCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "concentrationScaleConverter": () => {
    const calculatorId = "concentrationScaleConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "significantFiguresRounding": () => {
    const calculatorId = "significantFiguresRounding" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "solutionConcentration": () => {
    const calculatorId = "solutionConcentration" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "standardGasFlowConverter": () => {
    const calculatorId = "standardGasFlowConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "unitConverter": () => {
    const calculatorId = "unitConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "volumetricMassFlowConversion": () => {
    const calculatorId = "volumetricMassFlowConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "biotNumber": () => {
    const calculatorId = "biotNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "combinedConvectionRadiation": () => {
    const calculatorId = "combinedConvectionRadiation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "compositeWallConduction": () => {
    const calculatorId = "compositeWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "criticalRadiusOfInsulation": () => {
    const calculatorId = "criticalRadiusOfInsulation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "cylindricalWallConduction": () => {
    const calculatorId = "cylindricalWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "forcedConvectionCorrelation": () => {
    const calculatorId = "forcedConvectionCorrelation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "foulingAnalysis": () => {
    const calculatorId = "foulingAnalysis" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "fourierNumber": () => {
    const calculatorId = "fourierNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "grashofNumber": () => {
    const calculatorId = "grashofNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "naturalConvectionCorrelation": () => {
    const calculatorId = "naturalConvectionCorrelation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "nusseltNumber": () => {
    const calculatorId = "nusseltNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "planeWallConduction": () => {
    const calculatorId = "planeWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "prandtlNumber": () => {
    const calculatorId = "prandtlNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "rayleighNumber": () => {
    const calculatorId = "rayleighNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "shellAndTubeHeatExchanger": () => {
    const calculatorId = "shellAndTubeHeatExchanger" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "sphericalWallConduction": () => {
    const calculatorId = "sphericalWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "thermalRadiation": () => {
    const calculatorId = "thermalRadiation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "thermalResistanceNetwork": () => {
    const calculatorId = "thermalResistanceNetwork" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "lumpedCapacitance": () => {
    const calculatorId = "lumpedCapacitance" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "adsorptionIsotherms": () => {
    const calculatorId = "adsorptionIsotherms" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "batchAdsorptionDesign": () => {
    const calculatorId = "batchAdsorptionDesign" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "betIsotherm": () => {
    const calculatorId = "betIsotherm" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "chiltonColburnAnalogy": () => {
    const calculatorId = "chiltonColburnAnalogy" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "convectiveMassTransferCorrelations": () => {
    const calculatorId = "convectiveMassTransferCorrelations" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "countercurrentLiquidLiquidExtraction": () => {
    const calculatorId = "countercurrentLiquidLiquidExtraction" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "crosscurrentLiquidLiquidExtraction": () => {
    const calculatorId = "crosscurrentLiquidLiquidExtraction" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "diffusionThroughMembrane": () => {
    const calculatorId = "diffusionThroughMembrane" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "distributionCoefficientSelectivity": () => {
    const calculatorId = "distributionCoefficientSelectivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "effectiveDiffusivity": () => {
    const calculatorId = "effectiveDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "equimolarCounterDiffusion": () => {
    const calculatorId = "equimolarCounterDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "ficksFirstLaw": () => {
    const calculatorId = "ficksFirstLaw" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "ficksSecondLaw": () => {
    const calculatorId = "ficksSecondLaw" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "fixedBedAdsorptionBDST": () => {
    const calculatorId = "fixedBedAdsorptionBDST" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "gasAbsorptionStrippingFundamentals": () => {
    const calculatorId = "gasAbsorptionStrippingFundamentals" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "gasPhaseDiffusivity": () => {
    const calculatorId = "gasPhaseDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "interphaseEquilibriumDrivingForces": () => {
    const calculatorId = "interphaseEquilibriumDrivingForces" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "kremserMethod": () => {
    const calculatorId = "kremserMethod" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "liquidPhaseDiffusivity": () => {
    const calculatorId = "liquidPhaseDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "massTransferCoefficient": () => {
    const calculatorId = "massTransferCoefficient" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "dimensionlessMassTransfer": () => {
    const calculatorId = "dimensionlessMassTransfer" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "membraneGasSeparation": () => {
    const calculatorId = "membraneGasSeparation" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "overallMassTransferCoefficient": () => {
    const calculatorId = "overallMassTransferCoefficient" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "packedColumnHTUNTUDesign": () => {
    const calculatorId = "packedColumnHTUNTUDesign" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reverseOsmosisPerformance": () => {
    const calculatorId = "reverseOsmosisPerformance" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "stagnantFilmDiffusion": () => {
    const calculatorId = "stagnantFilmDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "steadyStateDiffusion": () => {
    const calculatorId = "steadyStateDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "twoFilmTheory": () => {
    const calculatorId = "twoFilmTheory" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "adiabaticIdealGasProcess": () => {
    const calculatorId = "adiabaticIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "antoineVaporPressure": () => {
    const calculatorId = "antoineVaporPressure" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "clausiusClapeyronEstimator": () => {
    const calculatorId = "clausiusClapeyronEstimator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "closedSystemFirstLaw": () => {
    const calculatorId = "closedSystemFirstLaw" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "compressorIsentropicEfficiency": () => {
    const calculatorId = "compressorIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "daltonPartialPressure": () => {
    const calculatorId = "daltonPartialPressure" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "enthalpyChangeCalculator": () => {
    const calculatorId = "enthalpyChangeCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "idealGas": () => {
    const calculatorId = "idealGas" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "idealGasEntropyChange": () => {
    const calculatorId = "idealGasEntropyChange" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "idealGasMixtureProperties": () => {
    const calculatorId = "idealGasMixtureProperties" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "incompressibleEntropyChange": () => {
    const calculatorId = "incompressibleEntropyChange" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "internalEnergyChangeCalculator": () => {
    const calculatorId = "internalEnergyChangeCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "isobaricIdealGasProcess": () => {
    const calculatorId = "isobaricIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "isochoricIdealGasProcess": () => {
    const calculatorId = "isochoricIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "isothermalIdealGasProcess": () => {
    const calculatorId = "isothermalIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "nozzleDiffuserEnergyBalance": () => {
    const calculatorId = "nozzleDiffuserEnergyBalance" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "polytropicIdealGasProcess": () => {
    const calculatorId = "polytropicIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "pumpIsentropicEfficiency": () => {
    const calculatorId = "pumpIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reducedPropertiesCalculator": () => {
    const calculatorId = "reducedPropertiesCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "saturatedMixtureProperty": () => {
    const calculatorId = "saturatedMixtureProperty" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "steadyFlowEnergyEquation": () => {
    const calculatorId = "steadyFlowEnergyEquation" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "thermalEfficiencyCOP": () => {
    const calculatorId = "thermalEfficiencyCOP" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "throttlingProcess": () => {
    const calculatorId = "throttlingProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "turbineIsentropicEfficiency": () => {
    const calculatorId = "turbineIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "vaporQualityFromEnthalpy": () => {
    const calculatorId = "vaporQualityFromEnthalpy" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "crystallizerBalance": () => {
    const calculatorId = "crystallizerBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "pressureDrop": () => {
    const calculatorId = "pressureDrop" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "filterCakeBalance": () => {
    const calculatorId = "filterCakeBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "finHeatTransfer": () => {
    const calculatorId = "finHeatTransfer" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "froudeNumber": () => {
    const calculatorId = "froudeNumber" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "gasAbsorberBalance": () => {
    const calculatorId = "gasAbsorberBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "heatExchangerLMTD": () => {
    const calculatorId = "heatExchangerLMTD" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "heatExchangerAreaSizing": () => {
    const calculatorId = "heatExchangerAreaSizing" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "heatExchangerEffectivenessNTU": () => {
    const calculatorId = "heatExchangerEffectivenessNTU" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "humidifierWaterBalance": () => {
    const calculatorId = "humidifierWaterBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "hydrostaticPressure": () => {
    const calculatorId = "hydrostaticPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "limitingReactantExcess": () => {
    const calculatorId = "limitingReactantExcess" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "liquidLiquidExtractionBalance": () => {
    const calculatorId = "liquidLiquidExtractionBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "membraneSeparatorBalance": () => {
    const calculatorId = "membraneSeparatorBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "openChannelFlow": () => {
    const calculatorId = "openChannelFlow" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "overallHeatTransferCoefficient": () => {
    const calculatorId = "overallHeatTransferCoefficient" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "frictionFactor": () => {
    const calculatorId = "frictionFactor" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "pumpPower": () => {
    const calculatorId = "pumpPower" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "raoultBubblePointPressure": () => {
    const calculatorId = "raoultBubblePointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "raoultDewPointPressure": () => {
    const calculatorId = "raoultDewPointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "bernoulliEquation": () => {
    const calculatorId = "bernoulliEquation" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "binarySeparatorBalance": () => {
    const calculatorId = "binarySeparatorBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "boilingHeatTransfer": () => {
    const calculatorId = "boilingHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "bypassMixingBalance": () => {
    const calculatorId = "bypassMixingBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "combustionAirRequirement": () => {
    const calculatorId = "combustionAirRequirement" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "condensationHeatTransfer": () => {
    const calculatorId = "condensationHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "condenserBalance": () => {
    const calculatorId = "condenserBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "convectionHeatTransfer": () => {
    const calculatorId = "convectionHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "reactionPerformanceBalance": () => {
    const calculatorId = "reactionPerformanceBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "criticalDepth": () => {
    const calculatorId = "criticalDepth" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "evaporatorBalance": () => {
    const calculatorId = "evaporatorBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "massBalance": () => {
    const calculatorId = "massBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "phaseChangeEnergyBalance": () => {
    const calculatorId = "phaseChangeEnergyBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "sensibleHeatBalance": () => {
    const calculatorId = "sensibleHeatBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "flowRate": () => {
    const calculatorId = "flowRate" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "heatExchangerEnergyBalance": () => {
    const calculatorId = "heatExchangerEnergyBalance" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "activationEnergyTwoPoint": () => {
    const calculatorId = "activationEnergyTwoPoint" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "adiabaticMixingTemperature": () => {
    const calculatorId = "adiabaticMixingTemperature" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "doublePipeHeatExchanger": () => {
    const calculatorId = "doublePipeHeatExchanger" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "dryerBalance": () => {
    const calculatorId = "dryerBalance" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
  "fluidBedDryerAdiabaticDryAirRequirement": () => {
    return <FluidBedDryerAdiabaticDryAirRequirementCalculator />
  },
  "evaporatorSteamRequirementEconomy": () => {
    return <EvaporatorSteamRequirementEconomyCalculator />
  },
  "multipleEffectEvaporatorSteamEconomy": () => {
    return <MultipleEffectEvaporatorSteamEconomyCalculator />
  },
  "evaporatorTargetSteamEconomyEffectCount": () => {
    return <EvaporatorTargetSteamEconomyEffectCountCalculator />
  },
  "evaporatorRequiredVaporReuseEfficiency": () => {
    return <EvaporatorRequiredVaporReuseEfficiencyCalculator />
  },
  "darcyWeisbachPipeDiameterSizing": () => {
    return <DarcyWeisbachPipeDiameterSizingCalculator />
  },
  "pipeFlowRateFromPressureDrop": () => {
    return <PipeFlowRateFromPressureDropCalculator />
  },
  "maximumPipeLengthFromPressureDrop": () => {
    return <MaximumPipeLengthFromPressureDropCalculator />
  },
  "maximumMinorLossCoefficient": () => {
    return <MaximumMinorLossCoefficientCalculator />
  },
  "npshAvailableCavitationMargin": () => {
    return <NpshAvailableCavitationMarginCalculator />
  },
  "minimumSuctionPipeDiameterNpshMargin": () => {
    return <MinimumSuctionPipeDiameterNpshMarginCalculator />
  },
  "requiredStaticLiquidLevelNpshMargin": () => {
    return <RequiredStaticLiquidLevelNpshMarginCalculator />
  },
  "maximumSuctionFlowRateNpshMargin": () => {
    return <MaximumSuctionFlowRateNpshMarginCalculator />
  },
  "maximumSuctionLineLengthNpshMargin": () => {
    return <MaximumSuctionLineLengthNpshMarginCalculator />
  },
  "pitotTubeVelocityFlow": () => {
    return <PitotTubeVelocityFlowCalculator />
  },
  "flowNozzleDifferentialPressure": () => {
    return <FlowNozzleDifferentialPressureCalculator />
  },
  "variableAreaRotameterFlow": () => {
    return <VariableAreaRotameterFlowCalculator />
  },
  "vortexSheddingFlowMeter": () => {
    return <VortexSheddingFlowMeterCalculator />
  },
  "ultrasonicTransitTimeFlowMeter": () => {
    return <UltrasonicTransitTimeFlowMeterCalculator />
  },
  "electromagneticFlowMeter": () => {
    return <ElectromagneticFlowMeterCalculator />
  },
  "positiveDisplacementFlowMeter": () => {
    return <PositiveDisplacementFlowMeterCalculator />
  },
  "turbineFlowMeter": () => {
    return <TurbineFlowMeterCalculator />
  },
  "sharpCrestedRectangularWeir": () => {
    return <SharpCrestedRectangularWeirCalculator />
  },
  "vNotchTriangularWeir": () => {
    return <VNotchTriangularWeirCalculator />
  },
  "trapezoidalChannelManningFlow": () => {
    return <TrapezoidalChannelManningFlowCalculator />
  },
  "trapezoidalChannelNormalDepth": () => {
    return <TrapezoidalChannelNormalDepthCalculator />
  },
  "rectangularHydraulicJump": () => {
    return <RectangularHydraulicJumpCalculator />
  },
  "trapezoidalChannelCriticalDepth": () => {
    return <TrapezoidalChannelCriticalDepthCalculator />
  },
  "rectangularChannelAlternateDepth": () => {
    return <RectangularChannelAlternateDepthCalculator />
  },
  "trapezoidalChannelCriticalSlope": () => {
    return <TrapezoidalChannelCriticalSlopeCalculator />
  },
  "trapezoidalHydraulicJump": () => {
    return <TrapezoidalHydraulicJumpCalculator />
  },
  "broadCrestedWeirFlow": () => {
    return <BroadCrestedWeirFlowCalculator />
  },
  "trapezoidalChannelAlternateDepth": () => {
    return <TrapezoidalChannelAlternateDepthCalculator />
  },
  "trapezoidalChannelChezyFlow": () => {
    return <TrapezoidalChannelChezyFlowCalculator />
  },
  "mostEconomicalTrapezoidalChannelDesign": () => {
    return <MostEconomicalTrapezoidalChannelCalculator />
  },
  "trapezoidalChannelDirectStep": () => {
    return <TrapezoidalChannelDirectStepCalculator />
  },
  "trapezoidalChannelGvfSlope": () => {
    return <TrapezoidalChannelGvfSlopeCalculator />
  },
  "trapezoidalChannelGvfProfileRk4": () => {
    return <TrapezoidalChannelGvfProfileRk4Calculator />
  },
  "trapezoidalMaximumDischargeSpecificEnergy": () => {
    return <TrapezoidalMaximumDischargeSpecificEnergyCalculator />
  },
  "trapezoidalCriticalControlWidth": () => {
    return <TrapezoidalCriticalControlWidthCalculator />
  },
  "trapezoidalMaximumBedRiseBeforeChoking": () => {
    return <TrapezoidalMaximumBedRiseBeforeChokingCalculator />
  },
  "trapezoidalChannelBedRiseCrestDepth": () => {
    return <TrapezoidalChannelBedRiseCrestDepthCalculator />
  },
  "trapezoidalMinimumUpstreamDepthBedRise": () => {
    return <TrapezoidalMinimumUpstreamDepthBedRiseCalculator />
  },
  "trapezoidalMinimumContractionWidth": () => {
    return <TrapezoidalMinimumContractionWidthCalculator />
  },
  "trapezoidalContractionThroatAnalysis": () => {
    return <TrapezoidalContractionThroatAnalysisCalculator />
  },
  "trapezoidalContractionTransitionLoss": () => {
    return <TrapezoidalContractionTransitionLossCalculator />
  },
  "trapezoidalMaximumTransitionLossCoefficient": () => {
    return <TrapezoidalMaximumTransitionLossCoefficientCalculator />
  },
  "trapezoidalMaximumDischargeTransitionLoss": () => {
    return <TrapezoidalMaximumDischargeTransitionLossCalculator />
  },
  "trapezoidalMinimumUpstreamDepthContractionLoss": () => {
    return <TrapezoidalMinimumUpstreamDepthContractionLossCalculator />
  },
  "trapezoidalMaximumBedRiseContractionLoss": () => {
    return <TrapezoidalMaximumBedRiseContractionLossCalculator />
  },
  "trapezoidalMinimumWidthBedRiseTransitionLoss": () => {
    return <TrapezoidalMinimumWidthBedRiseTransitionLossCalculator />
  },
  "trapezoidalMaximumDischargeBedRiseTransitionLoss": () => {
    return <TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator />
  },
  "trapezoidalMaximumTransitionLossCoefficientBedRise": () => {
    return <TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator />
  },
  "trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss": () => {
    return <TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator />
  },
  "trapezoidalChannelStandardStep": () => {
    return <TrapezoidalChannelStandardStepCalculator />
  },
  "trapezoidalChannelStandardStepProfile": () => {
    return <TrapezoidalChannelStandardStepProfileCalculator />
  },
  "trapezoidalChannelAdaptiveStandardStepProfile": () => {
    return <TrapezoidalChannelAdaptiveStandardStepProfileCalculator />
  },
  "trapezoidalChannelUpstreamStandardStepProfile": () => {
    return <TrapezoidalChannelUpstreamStandardStepProfileCalculator />
  },
  "trapezoidalChannelAdaptiveUpstreamStandardStepProfile": () => {
    return <TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator />
  },
  "partiallyFullCircularChannelManningFlow": () => {
    return <PartiallyFullCircularChannelManningFlowCalculator />
  },
  "partiallyFullCircularChannelNormalDepth": () => {
    return <PartiallyFullCircularChannelNormalDepthCalculator />
  },
  "partiallyFullCircularChannelCriticalDepth": () => {
    return <PartiallyFullCircularChannelCriticalDepthCalculator />
  },
  "partiallyFullCircularChannelAlternateDepths": () => {
    return <PartiallyFullCircularChannelAlternateDepthsCalculator />
  },
  "partiallyFullCircularChannelCriticalSlope": () => {
    return <PartiallyFullCircularChannelCriticalSlopeCalculator />
  },
  "partiallyFullCircularChannelHydraulicJump": () => {
    return <PartiallyFullCircularChannelHydraulicJumpCalculator />
  },
  "partiallyFullCircularChannelDirectStep": () => {
    return <PartiallyFullCircularChannelDirectStepCalculator />
  },
  "partiallyFullCircularChannelGvfSlope": () => {
    return <PartiallyFullCircularChannelGvfSlopeCalculator />
  },
  "partiallyFullCircularChannelGvfProfile": () => {
    return <PartiallyFullCircularChannelGvfProfileCalculator />
  },
  "partiallyFullCircularChannelAdaptiveGvfProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveGvfProfileCalculator />
  },
  "partiallyFullCircularChannelStandardStep": () => {
    return <PartiallyFullCircularChannelStandardStepCalculator />
  },
  "partiallyFullCircularChannelStandardStepProfile": () => {
    return <PartiallyFullCircularChannelStandardStepProfileCalculator />
  },
  "partiallyFullCircularChannelAdaptiveStandardStepProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator />
  },
  "partiallyFullCircularChannelUpstreamStandardStepProfile": () => {
    return <PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator />
  },
  "partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator />
  },
  "partiallyFullCircularChannelMaximumDischargeSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator />
  },
  "partiallyFullCircularChannelMinimumDiameterSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator />
  },
  "partiallyFullCircularChannelMinimumRequiredSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator />
  },
  "partiallyFullCircularChannelCapacityChokingMargin": () => {
    return <PartiallyFullCircularChannelCapacityChokingMarginCalculator />
  },
  "fluidBedDryerAdiabaticInletTemperature": () => {
    return <FluidBedDryerAdiabaticInletTemperatureCalculator />
  },
  "fluidBedDryerEnergyBalance": () => {
    return <FluidBedDryerEnergyBalanceCalculator />
  },
  "fluidBedDryerMassBalance": () => {
    return <FluidBedDryerMassBalanceCalculator />
  },
  "linearInterpolationCalculator": () => {
    return <LinearInterpolationCalculator />
  },
  "weightedAverageProperty": () => {
    return <WeightedAveragePropertyCalculator />
  },
  "binaryFlashCalculation": () => {
    return <BinaryFlashCalculator />
  },
  "centrifugalSettlingTime": () => {
    return <CentrifugalSettlingCalculator />
  },
  "constantPressureFiltration": () => {
    return <ConstantPressureFiltrationCalculator />
  },
  "countercurrentSolidsWashing": () => {
    return <CountercurrentSolidsWashingCalculator />
  },
  "crystallizationYieldMotherLiquor": () => {
    return <CrystallizationYieldMotherLiquorCalculator />
  },
  "dryingRateTime": () => {
    return <DryingRateTimeCalculator />
  },
  "distillationOperatingLines": () => {
    return <DistillationOperatingLinesCalculator />
  },
  "mcCabeThieleMethod": () => {
    return <McCabeThieleMethodCalculator />
  },
  "humidificationPsychrometrics": () => {
    return <HumidificationPsychrometricsCalculator />
  },
  "ionExchangeBedSizing": () => {
    return <IonExchangeBedSizingCalculator />
  },
  "finiteVolumeDialysis": () => {
    return <FiniteVolumeDialysisCalculator />
  },
  "msmprCrystallizerDesign": () => {
    return <MSMPRCrystallizerDesignCalculator />
  },
  "packedColumnHydraulics": () => {
    return <PackedColumnHydraulicsCalculator />
  },
  "relativeVolatilityBinaryVLE": () => {
    return <RelativeVolatilityBinaryVLECalculator />
  },
  "singleStageLeachingRecovery": () => {
    return <SingleStageLeachingRecoveryCalculator />
  },
  "singleStageLiquidLiquidExtraction": () => {
    return <SingleStageLiquidLiquidExtractionCalculator />
  },
  "ultrafiltrationConcentrationPolarization": () => {
    return <UltrafiltrationConcentrationPolarizationCalculator />
  },
  "batchSettlingAreaEstimate": () => {
    return <BatchSettlingAreaEstimateCalculator />
  },
  "centrifugeSigmaScaleUp": () => {
    return <CentrifugeSigmaScaleUpCalculator />
  },
  "constantPressureFilterSizing": () => {
    return <ConstantPressureFilterSizingCalculator />
  },
  "coolingCrystallizerYield": () => {
    return <CoolingCrystallizerYieldCalculator />
  },
  "evaporativeCrystallizerBalance": () => {
    return <EvaporativeCrystallizerBalanceCalculator />
  },
  "dryerThermalDuty": () => {
    return <DryerThermalDutyCalculator />
  },
  "binaryDistillationBalance": () => {
    return <BinaryDistillationBalanceCalculator />
  },
  "extractionDistributionSelectivity": () => {
    return <ExtractionDistributionSelectivityCalculator />
  },
  "extractionSolventRequirement": () => {
    return <ExtractionSolventRequirementCalculator />
  },
  "crosscurrentExtractionStages": () => {
    return <CrosscurrentExtractionStagesCalculator />
  },
  "countercurrentExtractionStages": () => {
    return <CountercurrentExtractionStagesCalculator />
  },
  "gillilandStageEstimate": () => {
    return <GillilandStageEstimateCalculator />
  },
  "fenskeUnderwoodGillilandShortcut": () => {
    return <FenskeUnderwoodGillilandCalculator />
  },
  "soudersBrownColumnDiameter": () => {
    return <SoudersBrownColumnDiameterCalculator />
  },
  "trayHydraulicsWeepingCheck": () => {
    return <TrayHydraulicsWeepingCalculator />
  },
  "trayDowncomerBackupResidence": () => {
    return <TrayDowncomerBackupCalculator />
  },
  "packedColumnHtuNtuHeight": () => {
    return <PackedColumnHtuNtuCalculator />
  },
  "packedColumnPressureDropFlooding": () => {
    return <PackedColumnPressureDropCalculator />
  },
  "packedColumnLiquidHoldupResidence": () => {
    return <PackedColumnLiquidHoldupCalculator />
  },
  "packedColumnLiquidDistributorIrrigation": () => {
    return <PackedColumnLiquidDistributorCalculator />
  },
  "packedColumnGasLoadFFactor": () => {
    return <PackedColumnGasLoadCalculator />
  },
  "packedColumnRedistributorSpacing": () => {
    return <PackedColumnRedistributorCalculator />
  },
  "kremserAbsorptionFactorStages": () => {
    return <KremserAbsorptionCalculator />
  },
  "absorberMinimumSolventRate": () => {
    return <AbsorberMinimumSolventRateCalculator />
  },
  "absorptionStrippingFactors": () => {
    return <AbsorptionStrippingFactorsCalculator />
  },
  "adsorbentMassRequirement": () => {
    return <AdsorbentMassRequirementCalculator />
  },
  "betMonolayerCapacity": () => {
    return <BetMonolayerCapacityCalculator />
  },
  "kremserAbsorptionStages": () => {
    return <KremserAbsorptionStagesCalculator />
  },
  "kremserStrippingStages": () => {
    return <KremserStrippingStagesCalculator />
  },
  "strippingMinimumGasRate": () => {
    return <StrippingMinimumGasRateCalculator />
  },
  "gasMembraneAreaRequirement": () => {
    return <GasMembraneAreaRequirementCalculator />
  },
  "idealGasMembraneStageCut": () => {
    return <IdealGasMembraneStageCutCalculator />
  },
  "reverseOsmosisWaterFlux": () => {
    return <ReverseOsmosisWaterFluxCalculator />
  },
  "ultrafiltrationResistanceSeries": () => {
    return <UltrafiltrationResistanceSeriesCalculator />
  },
  "psychrometricAirStreamMixing": () => {
    return <PsychrometricAirStreamMixingCalculator />
  },
  "relativeHumidityHumidification": () => {
    return <RelativeHumidityHumidificationCalculator />
  },
  "combinedDryerTime": () => {
    return <CombinedDryerTimeCalculator />
  },
  "fixedBedAdsorberBreakthrough": () => {
    return <FixedBedAdsorberBreakthroughCalculator />
  },
  "hydrocycloneSeparationNumber": () => {
    return <HydrocycloneSeparationNumberCalculator />
  },
  "singleStageGasAbsorption": () => {
    return <SingleStageGasAbsorptionCalculator />
  },
  "singleStageLeachingBalance": () => {
    return <SingleStageLeachingBalanceCalculator />
  },
  "adamsBashforthMoulton": () => {
    return <AdamsBashforthMoultonCalculator />
  },
  "adaptiveRungeKutta45": () => {
    return <AdaptiveRungeKutta45Calculator />
  },
  "broydenNonlinearSystem": () => {
    return <BroydenNonlinearSystemCalculator />
  },
  "choleskyDecompositionSolver": () => {
    return <CholeskyDecompositionSolverCalculator />
  },
  "conjugateGradientSolver": () => {
    return <ConjugateGradientSolverCalculator />
  },
  "coupledODESystemRK4": () => {
    return <CoupledODESystemRK4Calculator />
  },
  "crankNicolsonHeatEquation": () => {
    return <CrankNicolsonHeatEquationCalculator />
  },
  "cubicHermiteInterpolation": () => {
    return <CubicHermiteInterpolationCalculator />
  },
  "curveFitting": () => {
    return <CurveFittingCalculator />
  },
  "gaussNewtonNonlinearRegression": () => {
    return <GaussNewtonNonlinearRegressionCalculator />
  },
  "gradientDescentOptimization": () => {
    return <GradientDescentOptimizationCalculator />
  },
  "highOrderFiniteDifference": () => {
    return <HighOrderFiniteDifferenceCalculator />
  },
  "inversePowerMethodEigenvalue": () => {
    return <InversePowerMethodEigenvalueCalculator />
  },
  "laplaceEquationFiniteDifference": () => {
    return <LaplaceEquationFiniteDifferenceCalculator />
  },
  "levenbergMarquardtRegression": () => {
    return <LevenbergMarquardtRegressionCalculator />
  },
  "luDecompositionSolver": () => {
    return <LUDecompositionSolverCalculator />
  },
  "methodOfLinesPDESolver": () => {
    return <MethodOfLinesPDESolverCalculator />
  },
  "monteCarloIntegration": () => {
    return <MonteCarloIntegrationCalculator />
  },
  "naturalCubicSplineInterpolation": () => {
    return <NaturalCubicSplineInterpolationCalculator />
  },
  "nelderMeadOptimization": () => {
    return <NelderMeadOptimizationCalculator />
  },
  "newtonMultivariableOptimization": () => {
    return <NewtonMultivariableOptimizationCalculator />
  },
  "newtonRaphsonNonlinearSystem": () => {
    return <NewtonRaphsonNonlinearSystemCalculator />
  },
  "numericalJacobian": () => {
    return <NumericalJacobianCalculator />
  },
  "oneDimensionalWaveEquation": () => {
    return <OneDimensionalWaveEquationCalculator />
  },
  "powerMethodEigenvalue": () => {
    return <PowerMethodEigenvalueCalculator />
  },
  "qrDecompositionSolver": () => {
    return <QRDecompositionSolverCalculator />
  },
  "richardsonErrorEstimate": () => {
    return <RichardsonErrorEstimateCalculator />
  },
  "riddersRootFinder": () => {
    return <RiddersRootFinderCalculator />
  },
  "shootingMethodBoundaryValue": () => {
    return <ShootingMethodBoundaryValueCalculator />
  },
  "thomasTridiagonalSolver": () => {
    return <ThomasTridiagonalSolverCalculator />
  },
  "blockDiagramAlgebra": () => {
    return <BlockDiagramAlgebraCalculator />
  },
  "cascadeControl": () => {
    return <CascadeControlCalculator />
  },
  "closedLoopFeedbackAnalysis": () => {
    return <ClosedLoopFeedbackAnalysisCalculator />
  },
  "cohenCoonTuning": () => {
    return <CohenCoonTuningCalculator />
  },
  "processControlStrategyComparison": () => {
    return <ProcessControlStrategyComparisonCalculator />
  },
  "cubicRouthHurwitzStability": () => {
    return <CubicRouthHurwitzStabilityCalculator />
  },
  "feedforwardControl": () => {
    return <FeedforwardControlCalculator />
  },
  "firstOrderFrequencyResponse": () => {
    return <FirstOrderFrequencyResponseCalculator />
  },
  "gainScheduling": () => {
    return <GainSchedulingCalculator />
  },
  "integratingProcessResponse": () => {
    return <IntegratingProcessResponseCalculator />
  },
  "interactingTankSystem": () => {
    return <InteractingTankSystemCalculator />
  },
  "internalModelControlAnalysis": () => {
    return <InternalModelControlAnalysisCalculator />
  },
  "inverseLaplaceTransformHelper": () => {
    const calculatorId = "inverseLaplaceTransformHelper" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "laplaceTransformHelper": () => {
    const calculatorId = "laplaceTransformHelper" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "liquidControlValveSizing": () => {
    const calculatorId = "liquidControlValveSizing" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "liquidLevelDynamics": () => {
    const calculatorId = "liquidLevelDynamics" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "modelPredictiveControl": () => {
    const calculatorId = "modelPredictiveControl" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "nonInteractingTankSystem": () => {
    const calculatorId = "nonInteractingTankSystem" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
  "openLoopResponse": () => {
    return <OpenLoopResponseCalculator />
  },
  "overrideSelectiveControl": () => {
    return <OverrideSelectiveControlCalculator />
  },
  "pdController": () => {
    return <PDControllerCalculator />
  },
  "piController": () => {
    return <PIControllerCalculator />
  },
  "pressureProcessDynamics": () => {
    return <PressureProcessDynamicsCalculator />
  },
  "proportionalController": () => {
    return <ProportionalControllerCalculator />
  },
  "mimoDecouplingControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="mimoDecouplingControl" />
    )
  },
  "adaptiveControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="adaptiveControl" />
    )
  },
  "ratioControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="ratioControl" />
    )
  },
  "secondOrderFrequencyResponse": () => {
    return (
      <ProcessControlBatch05Calculator mode="secondOrderFrequencyResponse" />
    )
  },
  "smithPredictor": () => {
    return (
      <ProcessControlBatch05Calculator mode="smithPredictor" />
    )
  },
  "splitRangeControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="splitRangeControl" />
    )
  },
  "temperatureProcessDynamics": () => {
    return (
      <ProcessControlBatch06Calculator mode="temperatureProcessDynamics" />
    )
  },
  "transferFunctionBuilder": () => {
    return (
      <ProcessControlBatch06Calculator mode="transferFunctionBuilder" />
    )
  },
  "valveCharacteristics": () => {
    return (
      <ProcessControlBatch06Calculator mode="valveCharacteristics" />
    )
  },
  "zieglerNicholsUltimateGainTuning": () => {
    return (
      <ProcessControlBatch06Calculator mode="zieglerNicholsUltimateGain" />
    )
  },
  "equipmentCostScaling": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="equipmentCostScaling" />
    )
  },
  "costIndexEscalation": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="costIndexEscalation" />
    )
  },
  "emergencyVentilationDilution": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="emergencyVentilationDilution" />
    )
  },
  "annualizedLossExpectancy": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="annualizedLossExpectancy" />
    )
  },
  "liquidLeakRateScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="liquidLeakRateScreening" />
    )
  },
  "paybackAndROIAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch01Calculator mode="paybackAndROIAnalysis" />
    )
  },
  "langFactorCapitalEstimate": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="langFactorCapitalEstimate" />
    )
  },
  "totalCapitalInvestmentEstimate": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="totalCapitalInvestmentEstimate" />
    )
  },
  "annualOperatingCostEstimate": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="annualOperatingCostEstimate" />
    )
  },
  "straightLineDepreciation": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="straightLineDepreciation" />
    )
  },
  "netPresentValueAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="netPresentValueAnalysis" />
    )
  },
  "internalRateOfReturnAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch02Calculator mode="internalRateOfReturnAnalysis" />
    )
  },
  "breakEvenProductionAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="breakEvenProductionAnalysis" />
    )
  },
  "equivalentAnnualWorth": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="equivalentAnnualWorth" />
    )
  },
  "economicSensitivityAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="economicSensitivityAnalysis" />
    )
  },
  "flammabilityMixtureLimits": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="flammabilityMixtureLimits" />
    )
  },
  "gasReliefValveSizing": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="gasReliefValveSizing" />
    )
  },
  "liquidReliefValveSizing": () => {
    return (
      <ProcessSafetyEconomicsBatch03Calculator mode="liquidReliefValveSizing" />
    )
  },
  "chemicalProcessRiskMatrix": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="chemicalProcessRiskMatrix" />
    )
  },
  "hazopGuideWordAssistant": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="hazopGuideWordAssistant" />
    )
  },
  "inherentlySaferDesignChecklist": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="inherentlySaferDesignChecklist" />
    )
  },
  "layerOfProtectionAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="layerOfProtectionAnalysis" />
    )
  },
  "safetyIntegrityLevelTarget": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="safetyIntegrityLevelTarget" />
    )
  },
  "poolFireRadiationScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch04Calculator mode="poolFireRadiationScreening" />
    )
  },
  "bleveFireballScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="bleveFireballScreening" />
    )
  },
  "tntEquivalentExplosionScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="tntEquivalentExplosionScreening" />
    )
  },
  "gasLeakRateScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="gasLeakRateScreening" />
    )
  },
  "gaussianPlumeDispersion": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="gaussianPlumeDispersion" />
    )
  },
  "toxicExposureDoseScreening": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="toxicExposureDoseScreening" />
    )
  },
  "eventTreeAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch05Calculator mode="eventTreeAnalysis" />
    )
  },
  "faultTreeProbability": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="faultTreeProbability" />
    )
  },
  "sifAveragePFD": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="sifAveragePFD" />
    )
  },
  "proofTestIntervalCalculator": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="proofTestIntervalCalculator" />
    )
  },
  "riskReductionCostEffectiveness": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="riskReductionCostEffectiveness" />
    )
  },
  "expectedMonetaryValueDecision": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="expectedMonetaryValueDecision" />
    )
  },
  "lifecycleCostAnalysis": () => {
    return (
      <ProcessSafetyEconomicsBatch06Calculator mode="lifecycleCostAnalysis" />
    )
  },
  "individualRiskScreening": () => {
    return <ProcessSafetyEconomicsBatch07Calculator mode="individualRiskScreening" />
  },
  "societalRiskFNScreening": () => {
    return <ProcessSafetyEconomicsBatch07Calculator mode="societalRiskFNScreening" />
  },
  "alarpGrossDisproportionScreening": () => {
    return <ProcessSafetyEconomicsBatch07Calculator mode="alarpGrossDisproportionScreening" />
  },
  "safetyProjectPortfolioRanking": () => {
    return <ProcessSafetyEconomicsBatch07Calculator mode="safetyProjectPortfolioRanking" />
  },
  "adiabaticBatchReactor": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticBatchReactor" />
    )
  },
  "adiabaticCSTR": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticCSTR" />
    )
  },
  "adiabaticPFR": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticPFR" />
    )
  },
  "autocatalyticBatchReactor": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="autocatalyticBatchReactor" />
    )
  },
  "axialDispersionRTD": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="axialDispersionRTD" />
    )
  },
  "bypassFractionEstimator": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="bypassFractionEstimator" />
    )
  },
  "bypassDeadVolumeReactor": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="bypassDeadVolumeReactor" />
    )
  },
  "catalystDeactivationKinetics": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystDeactivationKinetics" />
    )
  },
  "catalystRegenerationCycle": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystRegenerationCycle" />
    )
  },
  "catalystTimeOnStream": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystTimeOnStream" />
    )
  },
  "catalystWeightFromRateData": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystWeightFromRateData" />
    )
  },
  "conversionFromRTD": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="conversionFromRTD" />
    )
  },
  "cstrPFRSequence": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="cstrPFRSequence" />
    )
  },
  "deactivatingPackedBedReactor": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="deactivatingPackedBedReactor" />
    )
  },
  "deadVolumeEstimator": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="deadVolumeEstimator" />
    )
  },
  "eCurveGenerator": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="eCurveGenerator" />
    )
  },
  "economicReactorSelection": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="economicReactorSelection" />
    )
  },
  "enzymeBatchReactor": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="enzymeBatchReactor" />
    )
  },
  "equilibriumConversion": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="equilibriumConversion" />
    )
  },
  "fCurveGenerator": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="fCurveGenerator" />
    )
  },
  "heatExchangeBatchReactor": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangeBatchReactor" />
    )
  },
  "heatExchangeCSTR": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangeCSTR" />
    )
  },
  "heatExchangePFR": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangePFR" />
    )
  },
  "immobilizedEnzymeReactor": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="immobilizedEnzymeReactor" />
    )
  },
  "levenspielPlotSizing": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="levenspielPlotSizing" />
    )
  },
  "membraneReactor": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="membraneReactor" />
    )
  },
  "michaelisMentenReactor": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="michaelisMentenReactor" />
    )
  },
  "monodBioreactorDesign": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="monodBioreactorDesign" />
    )
  },
  "multipleReactionsCSTR": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="multipleReactionsCSTR" />
    )
  },
  "multipleReactionsPFR": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="multipleReactionsPFR" />
    )
  },
  "nonIsothermalCSTRSteadyStates": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="nonIsothermalCSTRSteadyStates" />
    )
  },
  "packedBedPressureDrop": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="packedBedPressureDrop" />
    )
  },
  "packedBedReactorDesign": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="packedBedReactorDesign" />
    )
  },
  "parallelReactions": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="parallelReactions" />
    )
  },
  "pbrPressureDropEffects": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="pbrPressureDropEffects" />
    )
  },
  "rateConstantCalculation": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="rateConstantCalculation" />
    )
  },
  "rateConstantTemperatureShift": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="rateConstantTemperatureShift" />
    )
  },
  "rateLawBuilder": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="rateLawBuilder" />
    )
  },
  "reactionOrderDetermination": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactionOrderDetermination" />
    )
  },
  "reactiveDistillationBasics": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactiveDistillationBasics" />
    )
  },
  "reactorOptimization": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactorOptimization" />
    )
  },
  "recyclePFR": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="recyclePFR" />
    )
  },
  "reversibleReactions": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="reversibleReactions" />
    )
  },
  "rtdModelComparison": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="rtdModelComparison" />
    )
  },
  "rtdMoments": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="rtdMoments" />
    )
  },
  "segregationModelConversion": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="segregationModelConversion" />
    )
  },
  "semibatchReactor": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="semibatchReactor" />
    )
  },
  "seriesReactions": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="seriesReactions" />
    )
  },
  "seriesParallelReactions": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="seriesParallelReactions" />
    )
  },
  "stepResponseRTDAnalysis": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="stepResponseRTDAnalysis" />
    )
  },
  "tanksInSeriesRTD": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="tanksInSeriesRTD" />
    )
  },
  "arrheniusThreePointFit": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="arrheniusThreePointFit" />
    )
  },
}

export const NATIVE_CALCULATOR_IDS =
  Object.freeze(
    Object.keys(
      NATIVE_CALCULATOR_RENDERERS,
    ),
  )

export function renderNativeCalculator(
  calculatorId: string,
  title: string,
): ReactNode | null {
  const renderer =
    NATIVE_CALCULATOR_RENDERERS[
      calculatorId
    ]

  if (!renderer) {
    return null
  }

  return renderer(
    title,
  )
}
