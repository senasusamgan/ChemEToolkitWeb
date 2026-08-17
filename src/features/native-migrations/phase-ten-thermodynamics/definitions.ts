export type PhaseTenThermodynamicsCalculatorId =
  | "adiabaticIdealGasProcess"
  | "antoineVaporPressure"
  | "clausiusClapeyronEstimator"
  | "closedSystemFirstLaw"
  | "compressorIsentropicEfficiency"
  | "daltonPartialPressure"
  | "enthalpyChangeCalculator"
  | "idealGas"
  | "idealGasEntropyChange"
  | "idealGasMixtureProperties"
  | "incompressibleEntropyChange"
  | "internalEnergyChangeCalculator"
  | "isobaricIdealGasProcess"
  | "isochoricIdealGasProcess"
  | "isothermalIdealGasProcess"
  | "nozzleDiffuserEnergyBalance"
  | "polytropicIdealGasProcess"
  | "pumpIsentropicEfficiency"
  | "reducedPropertiesCalculator"
  | "saturatedMixtureProperty"
  | "steadyFlowEnergyEquation"
  | "thermalEfficiencyCOP"
  | "throttlingProcess"
  | "turbineIsentropicEfficiency"
  | "vaporQualityFromEnthalpy"

export interface PhaseTenFieldDefinition {
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}

export interface PhaseTenThermodynamicsDefinition {
  id: PhaseTenThermodynamicsCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseTenFieldDefinition[]
  formula: string
  outputLabel: string
  outputUnit?: string
  calculate: (
    values: Record<string, number>,
  ) => number
  interpret?: (
    result: number,
  ) => string
  [key: string]: unknown
}

export const PHASE_TEN_THERMODYNAMICS_IDS = [
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
  "vaporQualityFromEnthalpy",
] as const satisfies readonly PhaseTenThermodynamicsCalculatorId[]

export const PHASE_TEN_THERMODYNAMICS_DEFINITIONS = {
  "adiabaticIdealGasProcess": {id:`adiabaticIdealGasProcess`,code:`TD–16`,category:`Thermodynamics`,mark:`ϑ`,title:`Adiabatic Ideal-Gas Process`,fields:[{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`300`},{key:`initialPressure`,label:`Initial pressure`,unit:`bar`,initial:`1`},{key:`finalPressure`,label:`Final pressure`,unit:`bar`,initial:`5`},{key:`heatCapacityRatio`,label:`Heat-capacity ratio γ`,unit:`—`,initial:`1.4`}],formula:`T₂ = T₁(P₂/P₁)^((γ−1)/γ)`,outputLabel:`Final temperature`,outputUnit:`K`,calculate:({initialTemperature:e,initialPressure:t,finalPressure:n,heatCapacityRatio:r})=>e*(n/t)**((r-1)/r),interpret:()=>`Reversible adiabatic (isentropic) ideal-gas relation`},
  "antoineVaporPressure": {id:`antoineVaporPressure`,code:`TD–02`,category:`Thermodynamics`,mark:`P°`,title:`Antoine Vapor Pressure`,fields:[{key:`constantA`,label:`Constant A`,unit:`—`,initial:`8.07131`},{key:`constantB`,label:`Constant B`,unit:`—`,initial:`1730.63`},{key:`constantC`,label:`Constant C`,unit:`—`,initial:`233.426`},{key:`temperature`,label:`Temperature`,unit:`°C`,initial:`80`}],formula:`log₁₀ P° = A − B / (C + T)`,outputLabel:`Saturation pressure`,outputUnit:`mmHg`,calculate:({constantA:e,constantB:t,constantC:n,temperature:r})=>10**(e-t/(n+r)),interpret:e=>`${(e*.133322).toFixed(2)} kPa saturation pressure`},
  "clausiusClapeyronEstimator": {id:`clausiusClapeyronEstimator`,code:`TD–03`,category:`Thermodynamics`,mark:`lnP`,title:`Clausius–Clapeyron Estimator`,fields:[{key:`referencePressure`,label:`Reference pressure`,unit:`kPa`,initial:`101.325`},{key:`enthalpyVaporization`,label:`Enthalpy of vaporization`,unit:`kJ/mol`,initial:`40.65`},{key:`referenceTemperature`,label:`Reference temperature`,unit:`K`,initial:`373.15`},{key:`targetTemperature`,label:`Target temperature`,unit:`K`,initial:`353.15`}],formula:`ln(P₂/P₁) = −ΔHᵥₐₚ/R (1/T₂ − 1/T₁)`,outputLabel:`Estimated vapor pressure`,outputUnit:`kPa`,calculate:({referencePressure:e,enthalpyVaporization:t,referenceTemperature:n,targetTemperature:r})=>e*Math.exp(-(t*1e3/8.314462618)*(1/r-1/n)),interpret:()=>`Constant latent-heat approximation between the two temperatures`},
  "closedSystemFirstLaw": {id:`closedSystemFirstLaw`,code:`TD–04`,category:`Thermodynamics`,mark:`ϑ`,title:`Closed-System First Law`,fields:[{key:`heat`,label:`Heat added to system`,unit:`kJ`,initial:`250`},{key:`work`,label:`Work done by system`,unit:`kJ`,initial:`80`}],formula:`ΔU = Q − W`,outputLabel:`Internal-energy change`,outputUnit:`kJ`,calculate:({heat:e,work:t})=>e-t,interpret:e=>e>=0?`Net energy stored by the system`:`Net internal-energy decrease`},
  "compressorIsentropicEfficiency": {id:`compressorIsentropicEfficiency`,code:`TD–07`,category:`Thermodynamics`,mark:`η`,title:`Compressor Isentropic Efficiency`,fields:[{key:`inletTemperature`,label:`Inlet T`,unit:`K`,initial:`300`},{key:`isentropicOutlet`,label:`Isentropic T₂`,unit:`K`,initial:`420`},{key:`actualOutlet`,label:`Actual T₂`,unit:`K`,initial:`455`}],formula:`ηc = (T₂s − T₁)/(T₂ − T₁)`,outputLabel:`Isentropic efficiency`,outputUnit:`%`,calculate:({inletTemperature:e,isentropicOutlet:t,actualOutlet:n})=>(t-e)/(n-e)*100,interpret:()=>`Ideal-to-actual compressor work ratio for constant heat capacity`},
  "daltonPartialPressure": {id:`daltonPartialPressure`,code:`TD–05`,category:`Thermodynamics`,mark:`ϑ`,title:`Dalton Partial Pressure`,fields:[{key:`moleFraction`,label:`Gas mole fraction`,unit:`fraction`,initial:`0.21`},{key:`totalPressure`,label:`Total pressure`,unit:`kPa`,initial:`101.325`}],formula:`pi = yi P`,outputLabel:`Partial pressure`,outputUnit:`kPa`,calculate:({moleFraction:e,totalPressure:t})=>e*t,interpret:e=>`${(e/100).toFixed(4)} bar partial pressure`},
  "enthalpyChangeCalculator": {id:`enthalpyChangeCalculator`,code:`TD–11`,category:`Thermodynamics`,mark:`ΔH`,title:`Enthalpy Change`,fields:[{key:`moles`,label:`Amount`,unit:`mol`,initial:`100`},{key:`heatCapacity`,label:`Molar Cp`,unit:`J/mol·K`,initial:`29.1`},{key:`initialTemperature`,label:`Initial T`,unit:`K`,initial:`298.15`},{key:`finalTemperature`,label:`Final T`,unit:`K`,initial:`450`}],formula:`ΔH = n Cp (T₂ − T₁)`,outputLabel:`Sensible enthalpy change`,outputUnit:`kJ`,calculate:({moles:e,heatCapacity:t,initialTemperature:n,finalTemperature:r})=>e*t*(r-n)/1e3,interpret:e=>e>=0?`Sensible heating duty`:`Sensible cooling duty`},
  "idealGas": {id:`idealGas`,code:`TD–01`,category:`Thermodynamics`,mark:`ϑ`,title:`Ideal Gas Law`,fields:[{key:`moles`,label:`Amount`,unit:`mol`,initial:`1.0`},{key:`temperature`,label:`Temperature`,unit:`K`,initial:`298.15`},{key:`volume`,label:`Volume`,unit:`m³`,initial:`0.0245`}],formula:`P = nRT / V`,outputLabel:`Absolute pressure`,outputUnit:`Pa`,calculate:({moles:e,temperature:t,volume:n})=>e*8.314462618*t/n,interpret:e=>`${(e/1e5).toFixed(3)} bar absolute`},
  "idealGasEntropyChange": {id:`idealGasEntropyChange`,code:`TD–18`,category:`Thermodynamics`,mark:`ϑ`,title:`Ideal-Gas Entropy Change`,fields:[{key:`heatCapacity`,label:`Mean heat capacity cp`,unit:`J/mol·K`,initial:`29.10`},{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`300`},{key:`finalTemperature`,label:`Final temperature`,unit:`K`,initial:`450`},{key:`initialPressure`,label:`Initial pressure`,unit:`bar`,initial:`1`},{key:`finalPressure`,label:`Final pressure`,unit:`bar`,initial:`3`}],formula:`Δs = cp ln(T₂/T₁) − R ln(P₂/P₁)`,outputLabel:`Molar entropy change`,outputUnit:`J/mol·K`,calculate:({heatCapacity:e,initialTemperature:t,finalTemperature:n,initialPressure:r,finalPressure:i})=>e*Math.log(n/t)-8.314462618*Math.log(i/r),interpret:e=>e>=0?`Net molar entropy increase`:`Net molar entropy decrease`},
  "idealGasMixtureProperties": {id:`idealGasMixtureProperties`,code:`TD–19`,category:`Thermodynamics`,mark:`ϑ`,title:`Ideal-Gas Mixture Properties`,fields:[{key:`moleFractionA`,label:`Mole fraction A`,unit:`fraction`,initial:`0.35`},{key:`molecularWeightA`,label:`Molecular weight A`,unit:`g/mol`,initial:`28.01`},{key:`molecularWeightB`,label:`Molecular weight B`,unit:`g/mol`,initial:`44.01`}],formula:`Mmix = yA MA + (1−yA) MB`,outputLabel:`Mixture molecular weight`,outputUnit:`g/mol`,calculate:({moleFractionA:e,molecularWeightA:t,molecularWeightB:n})=>e*t+(1-e)*n,interpret:()=>`Binary ideal-gas mixture on a molar basis`},
  "incompressibleEntropyChange": {id:`incompressibleEntropyChange`,code:`TD–20`,category:`Thermodynamics`,mark:`ϑ`,title:`Incompressible Entropy Change`,fields:[{key:`heatCapacity`,label:`Specific heat capacity`,unit:`kJ/kg·K`,initial:`4.18`},{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`293.15`},{key:`finalTemperature`,label:`Final temperature`,unit:`K`,initial:`353.15`}],formula:`Δs = cp ln(T₂/T₁)`,outputLabel:`Specific entropy change`,outputUnit:`kJ/kg·K`,calculate:({heatCapacity:e,initialTemperature:t,finalTemperature:n})=>e*Math.log(n/t),interpret:e=>e>=0?`Entropy rises with heating`:`Entropy falls with cooling`},
  "internalEnergyChangeCalculator": {id:`internalEnergyChangeCalculator`,code:`TD–21`,category:`Thermodynamics`,mark:`ϑ`,title:`Internal-Energy Change`,fields:[{key:`mass`,label:`Mass`,unit:`kg`,initial:`2.5`},{key:`heatCapacity`,label:`Constant-volume heat capacity`,unit:`kJ/kg·K`,initial:`0.718`},{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`300`},{key:`finalTemperature`,label:`Final temperature`,unit:`K`,initial:`500`}],formula:`ΔU = m cv (T₂−T₁)`,outputLabel:`Internal-energy change`,outputUnit:`kJ`,calculate:({mass:e,heatCapacity:t,initialTemperature:n,finalTemperature:r})=>e*t*(r-n),interpret:e=>e>=0?`Energy added to the system`:`Energy removed from the system`},
  "isobaricIdealGasProcess": {id:`isobaricIdealGasProcess`,code:`TD–22`,category:`Thermodynamics`,mark:`ϑ`,title:`Isobaric Ideal-Gas Process`,fields:[{key:`moles`,label:`Amount`,unit:`mol`,initial:`2`},{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`300`},{key:`finalTemperature`,label:`Final temperature`,unit:`K`,initial:`450`}],formula:`W = nR(T₂−T₁)`,outputLabel:`Boundary work`,outputUnit:`J`,calculate:({moles:e,initialTemperature:t,finalTemperature:n})=>e*8.314462618*(n-t),interpret:e=>e>=0?`Expansion work by the gas`:`Compression work on the gas`},
  "isochoricIdealGasProcess": {id:`isochoricIdealGasProcess`,code:`TD–23`,category:`Thermodynamics`,mark:`ϑ`,title:`Isochoric Ideal-Gas Process`,fields:[{key:`initialPressure`,label:`Initial pressure`,unit:`bar`,initial:`1.2`},{key:`initialTemperature`,label:`Initial temperature`,unit:`K`,initial:`300`},{key:`finalTemperature`,label:`Final temperature`,unit:`K`,initial:`480`}],formula:`P₂ = P₁(T₂/T₁)`,outputLabel:`Final pressure`,outputUnit:`bar`,calculate:({initialPressure:e,initialTemperature:t,finalTemperature:n})=>e*n/t,interpret:()=>`Constant-volume ideal-gas pressure`},
  "isothermalIdealGasProcess": {id:`isothermalIdealGasProcess`,code:`TD–24`,category:`Thermodynamics`,mark:`ϑ`,title:`Isothermal Ideal-Gas Process`,fields:[{key:`moles`,label:`Amount`,unit:`mol`,initial:`1.5`},{key:`temperature`,label:`Temperature`,unit:`K`,initial:`350`},{key:`initialVolume`,label:`Initial volume`,unit:`m³`,initial:`0.020`},{key:`finalVolume`,label:`Final volume`,unit:`m³`,initial:`0.050`}],formula:`W = nRT ln(V₂/V₁)`,outputLabel:`Isothermal work`,outputUnit:`J`,calculate:({moles:e,temperature:t,initialVolume:n,finalVolume:r})=>e*8.314462618*t*Math.log(r/n),interpret:e=>e>=0?`Reversible expansion work`:`Reversible compression work`},
  "nozzleDiffuserEnergyBalance": {id:`nozzleDiffuserEnergyBalance`,code:`TD–25`,category:`Thermodynamics`,mark:`ϑ`,title:`Nozzle–Diffuser Energy Balance`,fields:[{key:`inletEnthalpy`,label:`Inlet enthalpy`,unit:`kJ/kg`,initial:`3200`},{key:`outletEnthalpy`,label:`Outlet enthalpy`,unit:`kJ/kg`,initial:`3000`},{key:`inletVelocity`,label:`Inlet velocity`,unit:`m/s`,initial:`40`}],formula:`V₂ = √(V₁² + 2000(h₁−h₂))`,outputLabel:`Outlet velocity`,outputUnit:`m/s`,calculate:({inletEnthalpy:e,outletEnthalpy:t,inletVelocity:n})=>Math.sqrt(n**2+2e3*(e-t)),interpret:()=>`Adiabatic nozzle estimate with negligible potential-energy change`},
  "polytropicIdealGasProcess": {id:`polytropicIdealGasProcess`,code:`TD–26`,category:`Thermodynamics`,mark:`ϑ`,title:`Polytropic Ideal-Gas Process`,fields:[{key:`initialPressure`,label:`Initial pressure`,unit:`kPa`,initial:`100`},{key:`initialVolume`,label:`Initial volume`,unit:`m³`,initial:`0.10`},{key:`finalVolume`,label:`Final volume`,unit:`m³`,initial:`0.04`},{key:`exponent`,label:`Polytropic exponent n`,unit:`—`,initial:`1.30`}],formula:`P₂ = P₁(V₁/V₂)^n`,outputLabel:`Final pressure`,outputUnit:`kPa`,calculate:({initialPressure:e,initialVolume:t,finalVolume:n,exponent:r})=>e*(t/n)**r,interpret:()=>`Polytropic pressure–volume relation`},
  "pumpIsentropicEfficiency": {id:`pumpIsentropicEfficiency`,code:`TD–27`,category:`Thermodynamics`,mark:`ϑ`,title:`Pump Isentropic Efficiency`,fields:[{key:`inletEnthalpy`,label:`Inlet enthalpy h₁`,unit:`kJ/kg`,initial:`100`},{key:`isentropicOutletEnthalpy`,label:`Isentropic outlet h₂s`,unit:`kJ/kg`,initial:`112`},{key:`actualOutletEnthalpy`,label:`Actual outlet h₂`,unit:`kJ/kg`,initial:`116`}],formula:`ηp = (h₂s−h₁)/(h₂−h₁) × 100`,outputLabel:`Pump efficiency`,outputUnit:`%`,calculate:({inletEnthalpy:e,isentropicOutletEnthalpy:t,actualOutletEnthalpy:n})=>100*(t-e)/(n-e),interpret:()=>`Ideal pump work divided by actual pump work`},
  "reducedPropertiesCalculator": {id:`reducedPropertiesCalculator`,code:`TD–28`,category:`Thermodynamics`,mark:`ϑ`,title:`Reduced Properties`,fields:[{key:`temperature`,label:`Temperature`,unit:`K`,initial:`400`},{key:`criticalTemperature`,label:`Critical temperature`,unit:`K`,initial:`507.6`},{key:`pressure`,label:`Pressure`,unit:`bar`,initial:`20`},{key:`criticalPressure`,label:`Critical pressure`,unit:`bar`,initial:`30.25`}],formula:`Tᵣ = T/Tc; Pᵣ = P/Pc`,outputLabel:`Reduced temperature`,outputUnit:`Tᵣ`,calculate:({temperature:e,criticalTemperature:t})=>e/t,interpret:_e=>`Use reduced temperature with reduced pressure for corresponding-states estimates`},
  "saturatedMixtureProperty": {id:`saturatedMixtureProperty`,code:`TD–29`,category:`Thermodynamics`,mark:`ϑ`,title:`Saturated Mixture Property`,fields:[{key:`saturatedLiquid`,label:`Saturated-liquid value`,unit:`property/kg`,initial:`640`},{key:`saturatedVapor`,label:`Saturated-vapor value`,unit:`property/kg`,initial:`2748`},{key:`quality`,label:`Vapor quality`,unit:`fraction`,initial:`0.35`}],formula:`y = yf + x(yg − yf)`,outputLabel:`Mixture property`,outputUnit:`property/kg`,calculate:({saturatedLiquid:e,saturatedVapor:t,quality:n})=>e+n*(t-e),interpret:()=>`Linear saturated liquid–vapor mixture relation`},
  "steadyFlowEnergyEquation": {id:`steadyFlowEnergyEquation`,code:`TD–18`,category:`Thermodynamics`,mark:`Q`,title:`Steady-Flow Energy Equation`,fields:[{key:`massFlow`,label:`Mass flow`,unit:`kg/s`,initial:`2.5`},{key:`enthalpyIn`,label:`Inlet h`,unit:`kJ/kg`,initial:`320`},{key:`enthalpyOut`,label:`Outlet h`,unit:`kJ/kg`,initial:`510`},{key:`shaftWork`,label:`Shaft work out`,unit:`kW`,initial:`50`}],formula:`Q̇ = ṁ(h₂ − h₁) + Ẇs`,outputLabel:`Required heat-transfer rate`,outputUnit:`kW`,calculate:({massFlow:e,enthalpyIn:t,enthalpyOut:n,shaftWork:r})=>e*(n-t)+r,interpret:e=>e>=0?`Net heat input to the control volume`:`Net heat rejection`},
  "thermalEfficiencyCOP": {id:`thermalEfficiencyCOP`,code:`TD–20`,category:`Thermodynamics`,mark:`η`,title:`Thermal Efficiency & COP`,fields:[{key:`usefulOutput`,label:`Useful output`,unit:`kW`,initial:`420`},{key:`energyInput`,label:`Energy input`,unit:`kW`,initial:`1000`}],formula:`η = Wₙₑₜ / Qᵢₙ`,outputLabel:`Thermal efficiency`,outputUnit:`%`,calculate:({usefulOutput:e,energyInput:t})=>e/t*100,interpret:e=>`${e.toFixed(1)}% of the input becomes useful output`},
  "throttlingProcess": {id:`throttlingProcess`,code:`TD–30`,category:`Thermodynamics`,mark:`ϑ`,title:`Throttling Process`,fields:[{key:`inletEnthalpy`,label:`Inlet enthalpy`,unit:`kJ/kg`,initial:`2800`},{key:`outletLiquidEnthalpy`,label:`Outlet saturated-liquid h`,unit:`kJ/kg`,initial:`500`},{key:`outletVaporEnthalpy`,label:`Outlet saturated-vapor h`,unit:`kJ/kg`,initial:`2700`}],formula:`h₁ = h₂; x₂ = (h₁−hf,₂)/(hg,₂−hf,₂)`,outputLabel:`Outlet vapor quality`,outputUnit:`fraction`,calculate:({inletEnthalpy:e,outletLiquidEnthalpy:t,outletVaporEnthalpy:n})=>(e-t)/(n-t),interpret:()=>`Steady adiabatic throttling with negligible kinetic and potential changes`},
  "turbineIsentropicEfficiency": {id:`turbineIsentropicEfficiency`,code:`TD–17`,category:`Thermodynamics`,mark:`ϑ`,title:`Turbine Isentropic Efficiency`,fields:[{key:`inletEnthalpy`,label:`Inlet enthalpy h₁`,unit:`kJ/kg`,initial:`3400`},{key:`actualOutletEnthalpy`,label:`Actual outlet enthalpy h₂`,unit:`kJ/kg`,initial:`2700`},{key:`isentropicOutletEnthalpy`,label:`Isentropic outlet enthalpy h₂s`,unit:`kJ/kg`,initial:`2550`}],formula:`ηₜ = (h₁−h₂)/(h₁−h₂s) × 100`,outputLabel:`Turbine efficiency`,outputUnit:`%`,calculate:({inletEnthalpy:e,actualOutletEnthalpy:t,isentropicOutletEnthalpy:n})=>100*(e-t)/(e-n),interpret:()=>`Actual turbine work divided by isentropic work`},
  "vaporQualityFromEnthalpy": {id:`vaporQualityFromEnthalpy`,code:`TD–31`,category:`Thermodynamics`,mark:`ϑ`,title:`Vapor Quality from Enthalpy`,fields:[{key:`mixtureEnthalpy`,label:`Mixture enthalpy`,unit:`kJ/kg`,initial:`1500`},{key:`liquidEnthalpy`,label:`Saturated-liquid h`,unit:`kJ/kg`,initial:`500`},{key:`vaporEnthalpy`,label:`Saturated-vapor h`,unit:`kJ/kg`,initial:`2700`}],formula:`x = (h−hf)/(hg−hf)`,outputLabel:`Vapor quality`,outputUnit:`fraction`,calculate:({mixtureEnthalpy:e,liquidEnthalpy:t,vaporEnthalpy:n})=>(e-t)/(n-t),interpret:()=>`Mass fraction of vapor in a saturated two-phase mixture`},
} satisfies Record<
  PhaseTenThermodynamicsCalculatorId,
  PhaseTenThermodynamicsDefinition
>
