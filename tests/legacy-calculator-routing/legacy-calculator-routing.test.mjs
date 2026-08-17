import test from 'node:test'
import assert from 'node:assert/strict'
import {
  readFileSync,
  readdirSync,
} from 'node:fs'
import {
  join,
} from 'node:path'

const LEGACY_CALCULATOR_IDS = [
  "averageMolecularWeight",
  "binaryCompositionBasisConversion",
  "chemicalFormulaMolecularWeight",
  "densitySpecificGravity",
  "engineeringPrefixConverter",
  "massFlowMolarFlowConversion",
  "massFractionCalculator",
  "massMoleConversion",
  "mixtureDensityCalculator",
  "moleFractionCalculator",
  "concentrationScaleConverter",
  "significantFiguresRounding",
  "solutionConcentration",
  "standardGasFlowConverter",
  "unitConverter",
  "volumetricMassFlowConversion",
  "bernoulliEquation",
  "criticalDepth",
  "pressureDrop",
  "dragForce",
  "froudeNumber",
  "hydrostaticPressure",
  "minorLosses",
  "openChannelFlow",
  "orificeMeter",
  "particleSettling",
  "frictionFactor",
  "pumpPower",
  "reynoldsNumber",
  "tankDrainTime",
  "uTubeManometer",
  "venturiMeter",
  "flowRate",
  "biotNumber",
  "boilingHeatTransfer",
  "combinedConvectionRadiation",
  "compositeWallConduction",
  "condensationHeatTransfer",
  "convectionHeatTransfer",
  "criticalRadiusOfInsulation",
  "cylindricalWallConduction",
  "doublePipeHeatExchanger",
  "finHeatTransfer",
  "forcedConvectionCorrelation",
  "foulingAnalysis",
  "fourierNumber",
  "grashofNumber",
  "heatExchangerLMTD",
  "heatExchangerAreaSizing",
  "heatExchangerEffectivenessNTU",
  "naturalConvectionCorrelation",
  "nusseltNumber",
  "overallHeatTransferCoefficient",
  "planeWallConduction",
  "prandtlNumber",
  "rayleighNumber",
  "shellAndTubeHeatExchanger",
  "sphericalWallConduction",
  "thermalRadiation",
  "thermalResistanceNetwork",
  "lumpedCapacitance",
  "adsorptionIsotherms",
  "batchAdsorptionDesign",
  "betIsotherm",
  "chiltonColburnAnalogy",
  "convectiveMassTransferCorrelations",
  "countercurrentLiquidLiquidExtraction",
  "crosscurrentLiquidLiquidExtraction",
  "diffusionThroughMembrane",
  "distributionCoefficientSelectivity",
  "effectiveDiffusivity",
  "equimolarCounterDiffusion",
  "ficksFirstLaw",
  "ficksSecondLaw",
  "fixedBedAdsorptionBDST",
  "gasAbsorptionStrippingFundamentals",
  "gasPhaseDiffusivity",
  "interphaseEquilibriumDrivingForces",
  "kremserMethod",
  "liquidPhaseDiffusivity",
  "massTransferCoefficient",
  "dimensionlessMassTransfer",
  "membraneGasSeparation",
  "overallMassTransferCoefficient",
  "packedColumnHTUNTUDesign",
  "reverseOsmosisPerformance",
  "stagnantFilmDiffusion",
  "steadyStateDiffusion",
  "twoFilmTheory",
  "adiabaticMixingTemperature",
  "binarySeparatorBalance",
  "bypassMixingBalance",
  "combustionAirRequirement",
  "condenserBalance",
  "reactionPerformanceBalance",
  "crystallizerBalance",
  "dryerBalance",
  "evaporatorBalance",
  "filterCakeBalance",
  "gasAbsorberBalance",
  "heatExchangerEnergyBalance",
  "humidifierWaterBalance",
  "limitingReactantExcess",
  "liquidLiquidExtractionBalance",
  "massBalance",
  "membraneSeparatorBalance",
  "phaseChangeEnergyBalance",
  "reactiveMaterialBalance",
  "recyclePurgeInertBalance",
  "sensibleHeatBalance",
  "solidsWashingBalance",
  "soluteDilutionCalculator",
  "streamSplitterBalance",
  "twoStreamMixerBalance",
  "adaptiveSimpsonIntegration",
  "odeSolver",
  "gaussLegendreQuadrature",
  "goldenSectionOptimization",
  "linearSystems",
  "numericalDifferentiation",
  "numericalIntegration",
  "numericalInterpolation",
  "rootFinding",
  "rombergIntegration",
  "firstOrderPlusDeadTimeProcess",
  "firstOrderProcessResponse",
  "imcControllerTuning",
  "pidController",
  "secondOrderProcessResponse",
  "zieglerNicholsReactionCurveTuning",
  "activationEnergyTwoPoint",
  "arrheniusRateConstant",
  "constantVolumeStoichiometry",
  "conversionYieldSelectivity",
  "cstrsInSeries",
  "pfrSections",
  "reactionRateCalculator",
  "reactorComparison",
  "reactorDesign",
  "spaceTimeSpaceVelocity",
  "binaryIsothermalFlash",
  "binaryMinimumReflux",
  "binaryRelativeVolatilityVLE",
  "cycloneCutDiameter",
  "fenskeMinimumStages",
  "absorptionMinimumSolventRate",
  "murphreeTrayEfficiency",
  "packedColumnHTUNTU",
  "psychrometricAirEnthalpy",
  "raoultBubblePointPressure",
  "raoultDewPointPressure",
  "adiabaticIdealGasProcess",
  "antoineVaporPressure",
  "clausiusClapeyronEstimator",
  "closedSystemFirstLaw",
  "compressorIsentropicEfficiency",
  "daltonPartialPressure",
  "enthalpyChangeCalculator",
  "idealGas",
  "idealGasEntropyChange",
  "idealGasMixtureProperties",
  "incompressibleEntropyChange",
  "internalEnergyChangeCalculator",
  "isobaricIdealGasProcess",
  "isochoricIdealGasProcess",
  "isothermalIdealGasProcess",
  "nozzleDiffuserEnergyBalance",
  "polytropicIdealGasProcess",
  "pumpIsentropicEfficiency",
  "reducedPropertiesCalculator",
  "saturatedMixtureProperty",
  "steadyFlowEnergyEquation",
  "thermalEfficiencyCOP",
  "throttlingProcess",
  "turbineIsentropicEfficiency",
  "vaporQualityFromEnthalpy"
]

const legacyIndex =
  readFileSync(
    'public/legacy/index.html',
    'utf8',
  )

const legacyAssetDirectory =
  'public/legacy/assets'

const legacyBundleSource =
  readdirSync(
    legacyAssetDirectory,
  )
    .filter(
      (fileName) =>
        fileName.endsWith('.js'),
    )
    .map(
      (fileName) =>
        readFileSync(
          join(
            legacyAssetDirectory,
            fileName,
          ),
          'utf8',
        ),
    )
    .join('\n')

const legacyWorkbench =
  readFileSync(
    'src/components/LegacyWorkbench.tsx',
    'utf8',
  )

test(
  'legacy calculator bridge is configured',
  () => {
    assert.match(
      legacyWorkbench,
      /\/legacy\/index\.html\?embed=1&calculator=/,
    )

    assert.match(
      legacyWorkbench,
      /encodeURIComponent/,
    )

    assert.match(
      legacyIndex,
      /assets\//,
    )
  },
)

for (
  const calculatorId
  of LEGACY_CALCULATOR_IDS
) {
  test(
    `legacy calculator ${calculatorId} exists in the shipped legacy bundle`,
    () => {
      assert.ok(
        legacyBundleSource.includes(
          calculatorId,
        ) ||
        legacyIndex.includes(
          calculatorId,
        ),
        `Legacy bundle is missing calculator ID: ${calculatorId}`,
      )
    },
  )
}

test(
  'legacy coverage inventory contains the expected calculators',
  () => {
    assert.equal(
      new Set(
        LEGACY_CALCULATOR_IDS,
      ).size,
      LEGACY_CALCULATOR_IDS.length,
    )

    assert.ok(
      LEGACY_CALCULATOR_IDS.length > 0,
    )
  },
)
