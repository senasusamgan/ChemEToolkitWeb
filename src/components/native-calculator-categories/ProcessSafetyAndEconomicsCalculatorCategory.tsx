import type {
  ReactNode,
} from 'react'

import { ProcessSafetyEconomicsBatch01Calculator } from '../../features/process-safety-economics/batch01/ProcessSafetyEconomicsBatch01Calculator'
import { ProcessSafetyEconomicsBatch02Calculator } from '../../features/process-safety-economics/batch02/ProcessSafetyEconomicsBatch02Calculator'
import { ProcessSafetyEconomicsBatch03Calculator } from '../../features/process-safety-economics/batch03/ProcessSafetyEconomicsBatch03Calculator'
import { ProcessSafetyEconomicsBatch04Calculator } from '../../features/process-safety-economics/batch04/ProcessSafetyEconomicsBatch04Calculator'
import { ProcessSafetyEconomicsBatch05Calculator } from '../../features/process-safety-economics/batch05/ProcessSafetyEconomicsBatch05Calculator'
import { ProcessSafetyEconomicsBatch06Calculator } from '../../features/process-safety-economics/batch06/ProcessSafetyEconomicsBatch06Calculator'
import { ProcessSafetyEconomicsBatch07Calculator } from '../../features/process-safety-economics/batch07/ProcessSafetyEconomicsBatch07Calculator'

interface CategoryCalculatorProps {
  calculatorId: string
  title: string
}

type CategoryRenderer = (
  title: string,
) => ReactNode

const RENDERERS: Record<
  string,
  CategoryRenderer
> = {
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
}

export default function ProcessSafetyAndEconomicsCalculatorCategory({
  calculatorId,
  title,
}: CategoryCalculatorProps) {
  const renderer =
    RENDERERS[
      calculatorId
    ]

  if (!renderer) {
    return null
  }

  return renderer(
    title,
  )
}
