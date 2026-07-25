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
import { LegacyWorkbench } from './LegacyWorkbench'

interface CalculatorWorkbenchProps {
  calculatorId: string
  title: string
}

export function CalculatorWorkbench({
  calculatorId,
  title,
}: CalculatorWorkbenchProps) {
  if (calculatorId === 'binaryFlashCalculation') {
    return <BinaryFlashCalculator />
  }

  if (calculatorId === 'centrifugalSettlingTime') {
    return <CentrifugalSettlingCalculator />
  }

  if (calculatorId === 'constantPressureFiltration') {
    return <ConstantPressureFiltrationCalculator />
  }

  if (calculatorId === 'countercurrentSolidsWashing') {
    return <CountercurrentSolidsWashingCalculator />
  }

  if (calculatorId === 'crystallizationYieldMotherLiquor') {
    return <CrystallizationYieldMotherLiquorCalculator />
  }

  if (calculatorId === 'dryingRateTime') {
    return <DryingRateTimeCalculator />
  }

  if (calculatorId === 'distillationOperatingLines') {
    return <DistillationOperatingLinesCalculator />
  }

  if (calculatorId === 'mcCabeThieleMethod') {
    return <McCabeThieleMethodCalculator />
  }

  if (calculatorId === 'humidificationPsychrometrics') {
    return <HumidificationPsychrometricsCalculator />
  }

  if (calculatorId === 'ionExchangeBedSizing') {
    return <IonExchangeBedSizingCalculator />
  }

  if (calculatorId === 'finiteVolumeDialysis') {
    return <FiniteVolumeDialysisCalculator />
  }

  if (calculatorId === 'msmprCrystallizerDesign') {
    return <MSMPRCrystallizerDesignCalculator />
  }

  if (calculatorId === 'packedColumnHydraulics') {
    return <PackedColumnHydraulicsCalculator />
  }

  if (calculatorId === 'relativeVolatilityBinaryVLE') {
    return <RelativeVolatilityBinaryVLECalculator />
  }

  if (calculatorId === 'singleStageLeachingRecovery') {

    return <SingleStageLeachingRecoveryCalculator />

  }


  if (calculatorId === 'singleStageLiquidLiquidExtraction') {

    return <SingleStageLiquidLiquidExtractionCalculator />

  }


  if (calculatorId === 'ultrafiltrationConcentrationPolarization') {

    return <UltrafiltrationConcentrationPolarizationCalculator />

  }


  if (calculatorId === 'batchSettlingAreaEstimate') {


    return <BatchSettlingAreaEstimateCalculator />


  }



  if (calculatorId === 'centrifugeSigmaScaleUp') {


    return <CentrifugeSigmaScaleUpCalculator />


  }



  if (calculatorId === 'constantPressureFilterSizing') {


    return <ConstantPressureFilterSizingCalculator />


  }



  if (calculatorId === 'coolingCrystallizerYield') {


    return <CoolingCrystallizerYieldCalculator />


  }



  if (calculatorId === 'evaporativeCrystallizerBalance') {


    return <EvaporativeCrystallizerBalanceCalculator />


  }



  if (calculatorId === 'dryerThermalDuty') {


    return <DryerThermalDutyCalculator />


  }



  if (calculatorId === 'binaryDistillationBalance') {



    return <BinaryDistillationBalanceCalculator />



  }




  if (calculatorId === 'extractionDistributionSelectivity') {



    return <ExtractionDistributionSelectivityCalculator />



  }




  if (calculatorId === 'extractionSolventRequirement') {



    return <ExtractionSolventRequirementCalculator />



  }




  if (calculatorId === 'crosscurrentExtractionStages') {



    return <CrosscurrentExtractionStagesCalculator />



  }




  if (calculatorId === 'countercurrentExtractionStages') {



    return <CountercurrentExtractionStagesCalculator />



  }




  if (calculatorId === 'gillilandStageEstimate') {



    return <GillilandStageEstimateCalculator />



  }




  if (calculatorId === 'absorptionStrippingFactors') {




    return <AbsorptionStrippingFactorsCalculator />




  }





  if (calculatorId === 'adsorbentMassRequirement') {




    return <AdsorbentMassRequirementCalculator />




  }





  if (calculatorId === 'betMonolayerCapacity') {




    return <BetMonolayerCapacityCalculator />




  }





  if (calculatorId === 'kremserAbsorptionStages') {




    return <KremserAbsorptionStagesCalculator />




  }





  if (calculatorId === 'kremserStrippingStages') {




    return <KremserStrippingStagesCalculator />




  }





  if (calculatorId === 'strippingMinimumGasRate') {




    return <StrippingMinimumGasRateCalculator />




  }





  if (calculatorId === 'gasMembraneAreaRequirement') {





    return <GasMembraneAreaRequirementCalculator />





  }






  if (calculatorId === 'idealGasMembraneStageCut') {





    return <IdealGasMembraneStageCutCalculator />





  }






  if (calculatorId === 'reverseOsmosisWaterFlux') {





    return <ReverseOsmosisWaterFluxCalculator />





  }






  if (calculatorId === 'ultrafiltrationResistanceSeries') {





    return <UltrafiltrationResistanceSeriesCalculator />





  }






  if (calculatorId === 'psychrometricAirStreamMixing') {





    return <PsychrometricAirStreamMixingCalculator />





  }






  if (calculatorId === 'relativeHumidityHumidification') {





    return <RelativeHumidityHumidificationCalculator />





  }






  if (calculatorId === 'combinedDryerTime') {






    return <CombinedDryerTimeCalculator />






  }







  if (calculatorId === 'fixedBedAdsorberBreakthrough') {






    return <FixedBedAdsorberBreakthroughCalculator />






  }







  if (calculatorId === 'hydrocycloneSeparationNumber') {






    return <HydrocycloneSeparationNumberCalculator />






  }







  if (calculatorId === 'singleStageGasAbsorption') {






    return <SingleStageGasAbsorptionCalculator />






  }







  if (calculatorId === 'singleStageLeachingBalance') {






    return <SingleStageLeachingBalanceCalculator />






  }







  if (calculatorId === 'adamsBashforthMoulton') {







    return <AdamsBashforthMoultonCalculator />







  }








  if (calculatorId === 'adaptiveRungeKutta45') {







    return <AdaptiveRungeKutta45Calculator />







  }








  if (calculatorId === 'broydenNonlinearSystem') {







    return <BroydenNonlinearSystemCalculator />







  }








  if (calculatorId === 'choleskyDecompositionSolver') {







    return <CholeskyDecompositionSolverCalculator />







  }








  if (calculatorId === 'conjugateGradientSolver') {







    return <ConjugateGradientSolverCalculator />







  }








  if (calculatorId === 'coupledODESystemRK4') {







    return <CoupledODESystemRK4Calculator />







  }








  if (calculatorId === 'crankNicolsonHeatEquation') {








    return <CrankNicolsonHeatEquationCalculator />








  }









  if (calculatorId === 'cubicHermiteInterpolation') {








    return <CubicHermiteInterpolationCalculator />








  }









  if (calculatorId === 'curveFitting') {








    return <CurveFittingCalculator />








  }









  if (calculatorId === 'gaussNewtonNonlinearRegression') {








    return <GaussNewtonNonlinearRegressionCalculator />








  }









  if (calculatorId === 'gradientDescentOptimization') {








    return <GradientDescentOptimizationCalculator />








  }









  if (calculatorId === 'highOrderFiniteDifference') {








    return <HighOrderFiniteDifferenceCalculator />








  }









  if (calculatorId === 'inversePowerMethodEigenvalue') {









    return <InversePowerMethodEigenvalueCalculator />









  }










  if (calculatorId === 'laplaceEquationFiniteDifference') {









    return <LaplaceEquationFiniteDifferenceCalculator />









  }










  if (calculatorId === 'levenbergMarquardtRegression') {









    return <LevenbergMarquardtRegressionCalculator />









  }










  if (calculatorId === 'luDecompositionSolver') {









    return <LUDecompositionSolverCalculator />









  }










  if (calculatorId === 'methodOfLinesPDESolver') {









    return <MethodOfLinesPDESolverCalculator />









  }










  if (calculatorId === 'monteCarloIntegration') {









    return <MonteCarloIntegrationCalculator />









  }










  if (calculatorId === 'naturalCubicSplineInterpolation') {










    return <NaturalCubicSplineInterpolationCalculator />










  }











  if (calculatorId === 'nelderMeadOptimization') {










    return <NelderMeadOptimizationCalculator />










  }











  if (calculatorId === 'newtonMultivariableOptimization') {










    return <NewtonMultivariableOptimizationCalculator />










  }











  if (calculatorId === 'newtonRaphsonNonlinearSystem') {










    return <NewtonRaphsonNonlinearSystemCalculator />










  }











  if (calculatorId === 'numericalJacobian') {










    return <NumericalJacobianCalculator />










  }











  if (calculatorId === 'oneDimensionalWaveEquation') {










    return <OneDimensionalWaveEquationCalculator />










  }











  if (calculatorId === 'powerMethodEigenvalue') {











    return <PowerMethodEigenvalueCalculator />











  }












  if (calculatorId === 'qrDecompositionSolver') {











    return <QRDecompositionSolverCalculator />











  }












  if (calculatorId === 'richardsonErrorEstimate') {











    return <RichardsonErrorEstimateCalculator />











  }












  if (calculatorId === 'riddersRootFinder') {











    return <RiddersRootFinderCalculator />











  }












  if (calculatorId === 'shootingMethodBoundaryValue') {











    return <ShootingMethodBoundaryValueCalculator />











  }












  if (calculatorId === 'thomasTridiagonalSolver') {











    return <ThomasTridiagonalSolverCalculator />











  }












  if (calculatorId === 'blockDiagramAlgebra') {












    return <BlockDiagramAlgebraCalculator />












  }













  if (calculatorId === 'cascadeControl') {












    return <CascadeControlCalculator />












  }













  if (calculatorId === 'closedLoopFeedbackAnalysis') {












    return <ClosedLoopFeedbackAnalysisCalculator />












  }













  if (calculatorId === 'cohenCoonTuning') {












    return <CohenCoonTuningCalculator />












  }













  if (calculatorId === 'processControlStrategyComparison') {












    return <ProcessControlStrategyComparisonCalculator />












  }













  if (calculatorId === 'cubicRouthHurwitzStability') {












    return <CubicRouthHurwitzStabilityCalculator />












  }













  if (calculatorId === 'feedforwardControl') {













    return <FeedforwardControlCalculator />













  }














  if (calculatorId === 'firstOrderFrequencyResponse') {













    return <FirstOrderFrequencyResponseCalculator />













  }














  if (calculatorId === 'gainScheduling') {













    return <GainSchedulingCalculator />













  }














  if (calculatorId === 'integratingProcessResponse') {













    return <IntegratingProcessResponseCalculator />













  }














  if (calculatorId === 'interactingTankSystem') {













    return <InteractingTankSystemCalculator />













  }














  if (calculatorId === 'internalModelControlAnalysis') {













    return <InternalModelControlAnalysisCalculator />













  }
  if ([
    'inverseLaplaceTransformHelper',
    'laplaceTransformHelper',
    'liquidControlValveSizing',
    'liquidLevelDynamics',
    'modelPredictiveControl',
    'nonInteractingTankSystem',
  ].includes(calculatorId)) {
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  }















  if (calculatorId === 'openLoopResponse') {















    return <OpenLoopResponseCalculator />















  }
















  if (calculatorId === 'overrideSelectiveControl') {















    return <OverrideSelectiveControlCalculator />















  }
















  if (calculatorId === 'pdController') {















    return <PDControllerCalculator />















  }
















  if (calculatorId === 'piController') {















    return <PIControllerCalculator />















  }
















  if (calculatorId === 'pressureProcessDynamics') {















    return <PressureProcessDynamicsCalculator />















  }
















  if (calculatorId === 'proportionalController') {















    return <ProportionalControllerCalculator />















  }
















  if (calculatorId === 'mimoDecouplingControl') {
















    return (
















      <ProcessControlBatch05Calculator mode="mimoDecouplingControl" />
















    )
















  }

















  if (calculatorId === 'adaptiveControl') {
















    return (
















      <ProcessControlBatch05Calculator mode="adaptiveControl" />
















    )
















  }

















  if (calculatorId === 'ratioControl') {
















    return (
















      <ProcessControlBatch05Calculator mode="ratioControl" />
















    )
















  }

















  if (calculatorId === 'secondOrderFrequencyResponse') {
















    return (
















      <ProcessControlBatch05Calculator mode="secondOrderFrequencyResponse" />
















    )
















  }

















  if (calculatorId === 'smithPredictor') {
















    return (
















      <ProcessControlBatch05Calculator mode="smithPredictor" />
















    )
















  }

















  if (calculatorId === 'splitRangeControl') {
















    return (
















      <ProcessControlBatch05Calculator mode="splitRangeControl" />
















    )
















  }

















  if (calculatorId === 'temperatureProcessDynamics') {

















    return (

















      <ProcessControlBatch06Calculator mode="temperatureProcessDynamics" />

















    )

















  }


















  if (calculatorId === 'transferFunctionBuilder') {

















    return (

















      <ProcessControlBatch06Calculator mode="transferFunctionBuilder" />

















    )

















  }


















  if (calculatorId === 'valveCharacteristics') {

















    return (

















      <ProcessControlBatch06Calculator mode="valveCharacteristics" />

















    )

















  }


















  if (calculatorId === 'zieglerNicholsUltimateGainTuning') {

















    return (

















      <ProcessControlBatch06Calculator mode="zieglerNicholsUltimateGain" />

















    )

















  }


















  return (
    <LegacyWorkbench
      calculatorId={calculatorId}
      title={title}
    />
  )
}
