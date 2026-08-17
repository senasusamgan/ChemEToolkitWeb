import type {
  ReactNode,
} from 'react'

import { AdamsBashforthMoultonCalculator } from '../../features/numerical-methods/adams-bashforth-moulton/AdamsBashforthMoultonCalculator'
import { AdaptiveRungeKutta45Calculator } from '../../features/numerical-methods/adaptive-runge-kutta-45/AdaptiveRungeKutta45Calculator'
import { BroydenNonlinearSystemCalculator } from '../../features/numerical-methods/broyden-nonlinear-system/BroydenNonlinearSystemCalculator'
import { CholeskyDecompositionSolverCalculator } from '../../features/numerical-methods/cholesky-decomposition-solver/CholeskyDecompositionSolverCalculator'
import { ConjugateGradientSolverCalculator } from '../../features/numerical-methods/conjugate-gradient-solver/ConjugateGradientSolverCalculator'
import { CoupledODESystemRK4Calculator } from '../../features/numerical-methods/coupled-ode-system-rk4/CoupledODESystemRK4Calculator'
import { CrankNicolsonHeatEquationCalculator } from '../../features/numerical-methods/crank-nicolson-heat-equation/CrankNicolsonHeatEquationCalculator'
import { CubicHermiteInterpolationCalculator } from '../../features/numerical-methods/cubic-hermite-interpolation/CubicHermiteInterpolationCalculator'
import { CurveFittingCalculator } from '../../features/numerical-methods/curve-fitting/CurveFittingCalculator'
import { GaussNewtonNonlinearRegressionCalculator } from '../../features/numerical-methods/gauss-newton-nonlinear-regression/GaussNewtonNonlinearRegressionCalculator'
import { GradientDescentOptimizationCalculator } from '../../features/numerical-methods/gradient-descent-optimization/GradientDescentOptimizationCalculator'
import { HighOrderFiniteDifferenceCalculator } from '../../features/numerical-methods/high-order-finite-difference/HighOrderFiniteDifferenceCalculator'
import { InversePowerMethodEigenvalueCalculator } from '../../features/numerical-methods/inverse-power-method-eigenvalue/InversePowerMethodEigenvalueCalculator'
import { LUDecompositionSolverCalculator } from '../../features/numerical-methods/lu-decomposition-solver/LUDecompositionSolverCalculator'
import { LaplaceEquationFiniteDifferenceCalculator } from '../../features/numerical-methods/laplace-equation-finite-difference/LaplaceEquationFiniteDifferenceCalculator'
import { LevenbergMarquardtRegressionCalculator } from '../../features/numerical-methods/levenberg-marquardt-regression/LevenbergMarquardtRegressionCalculator'
import { MethodOfLinesPDESolverCalculator } from '../../features/numerical-methods/method-of-lines-pde-solver/MethodOfLinesPDESolverCalculator'
import { MonteCarloIntegrationCalculator } from '../../features/numerical-methods/monte-carlo-integration/MonteCarloIntegrationCalculator'
import { NaturalCubicSplineInterpolationCalculator } from '../../features/numerical-methods/natural-cubic-spline-interpolation/NaturalCubicSplineInterpolationCalculator'
import { NelderMeadOptimizationCalculator } from '../../features/numerical-methods/nelder-mead-optimization/NelderMeadOptimizationCalculator'
import { NewtonMultivariableOptimizationCalculator } from '../../features/numerical-methods/newton-multivariable-optimization/NewtonMultivariableOptimizationCalculator'
import { NewtonRaphsonNonlinearSystemCalculator } from '../../features/numerical-methods/newton-raphson-nonlinear-system/NewtonRaphsonNonlinearSystemCalculator'
import { NumericalJacobianCalculator } from '../../features/numerical-methods/numerical-jacobian/NumericalJacobianCalculator'
import { OneDimensionalWaveEquationCalculator } from '../../features/numerical-methods/one-dimensional-wave-equation/OneDimensionalWaveEquationCalculator'
import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PowerMethodEigenvalueCalculator } from '../../features/numerical-methods/power-method-eigenvalue/PowerMethodEigenvalueCalculator'
import { QRDecompositionSolverCalculator } from '../../features/numerical-methods/qr-decomposition-solver/QRDecompositionSolverCalculator'
import { RichardsonErrorEstimateCalculator } from '../../features/numerical-methods/richardson-error-estimate/RichardsonErrorEstimateCalculator'
import { RiddersRootFinderCalculator } from '../../features/numerical-methods/ridders-root-finder/RiddersRootFinderCalculator'
import { ShootingMethodBoundaryValueCalculator } from '../../features/numerical-methods/shooting-method-boundary-value/ShootingMethodBoundaryValueCalculator'
import { ThomasTridiagonalSolverCalculator } from '../../features/numerical-methods/thomas-tridiagonal-solver/ThomasTridiagonalSolverCalculator'

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
}

export default function NumericalMethodsCalculatorCategory({
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
