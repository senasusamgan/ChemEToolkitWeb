import {
  lazy,
} from 'react'

export const LazyEngineeringFundamentalsCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/EngineeringFundamentalsCalculatorCategory'
      ),
  )
export const LazyFluidMechanicsCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/FluidMechanicsCalculatorCategory'
      ),
  )
export const LazyHeatTransferCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/HeatTransferCalculatorCategory'
      ),
  )
export const LazyMassTransferCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/MassTransferCalculatorCategory'
      ),
  )
export const LazyMaterialAndEnergyBalancesCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/MaterialAndEnergyBalancesCalculatorCategory'
      ),
  )
export const LazyNumericalMethodsCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/NumericalMethodsCalculatorCategory'
      ),
  )
export const LazyProcessControlCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/ProcessControlCalculatorCategory'
      ),
  )
export const LazyProcessSafetyAndEconomicsCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/ProcessSafetyAndEconomicsCalculatorCategory'
      ),
  )
export const LazyReactionEngineeringCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/ReactionEngineeringCalculatorCategory'
      ),
  )
export const LazySeparationProcessesCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/SeparationProcessesCalculatorCategory'
      ),
  )
export const LazyThermodynamicsCalculatorCategory =
  lazy(
    () =>
      import(
        './native-calculator-categories/ThermodynamicsCalculatorCategory'
      ),
  )
