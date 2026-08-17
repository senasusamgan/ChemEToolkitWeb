export type PhaseNineCalculatorId =
  | "crystallizerBalance"
  | "pressureDrop"
  | "filterCakeBalance"
  | "finHeatTransfer"
  | "froudeNumber"
  | "gasAbsorberBalance"
  | "heatExchangerLMTD"
  | "heatExchangerAreaSizing"
  | "heatExchangerEffectivenessNTU"
  | "humidifierWaterBalance"
  | "hydrostaticPressure"
  | "limitingReactantExcess"
  | "liquidLiquidExtractionBalance"
  | "membraneSeparatorBalance"
  | "openChannelFlow"
  | "overallHeatTransferCoefficient"
  | "frictionFactor"
  | "pumpPower"
  | "raoultBubblePointPressure"
  | "raoultDewPointPressure"

export interface PhaseNineFieldDefinition {
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}

export interface PhaseNineCalculatorDefinition {
  id: PhaseNineCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseNineFieldDefinition[]
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

export const PHASE_NINE_CALCULATOR_IDS = [
  "crystallizerBalance",
  "pressureDrop",
  "filterCakeBalance",
  "finHeatTransfer",
  "froudeNumber",
  "gasAbsorberBalance",
  "heatExchangerLMTD",
  "heatExchangerAreaSizing",
  "heatExchangerEffectivenessNTU",
  "humidifierWaterBalance",
  "hydrostaticPressure",
  "limitingReactantExcess",
  "liquidLiquidExtractionBalance",
  "membraneSeparatorBalance",
  "openChannelFlow",
  "overallHeatTransferCoefficient",
  "frictionFactor",
  "pumpPower",
  "raoultBubblePointPressure",
  "raoultDewPointPressure",
] as const satisfies readonly PhaseNineCalculatorId[]

export const PHASE_NINE_DEFINITIONS = {
  "crystallizerBalance": {id:`crystallizerBalance`,code:`MEB–18`,category:`Material & Energy Balances`,mark:`⇄`,title:`Crystallizer Balance`,fields:[{key:`feedFlow`,label:`Feed solution`,unit:`kg/h`,initial:`1000`},{key:`feedSoluteFraction`,label:`Feed solute fraction`,unit:`fraction`,initial:`0.40`},{key:`motherLiquorFraction`,label:`Saturated mother-liquor fraction`,unit:`fraction`,initial:`0.20`}],formula:`C = F(xF−xL)/(1−xL)`,outputLabel:`Crystal production`,outputUnit:`kg/h`,calculate:({feedFlow:e,feedSoluteFraction:t,motherLiquorFraction:n})=>e*(t-n)/(1-n),interpret:()=>`Pure crystals with solute-free evaporation neglected`},
  "pressureDrop": {id:`pressureDrop`,code:`FM–03`,category:`Fluid Mechanics`,mark:`↘`,title:`Darcy–Weisbach Pressure Drop`,fields:[{key:`friction`,label:`Friction factor`,unit:`—`,initial:`0.020`},{key:`length`,label:`Pipe length`,unit:`m`,initial:`50`},{key:`diameter`,label:`Diameter`,unit:`m`,initial:`0.10`},{key:`density`,label:`Density`,unit:`kg/m³`,initial:`998.2`},{key:`velocity`,label:`Velocity`,unit:`m/s`,initial:`2.0`}],formula:`ΔP = f (L/D) ρv²/2`,outputLabel:`Pressure drop`,outputUnit:`Pa`,calculate:({friction:e,length:t,diameter:n,density:r,velocity:i})=>t/n*e*r*i**2/2,interpret:e=>`${(e/1e3).toFixed(2)} kPa loss along the pipe`},
  "filterCakeBalance": {id:`filterCakeBalance`,code:`MEB–19`,category:`Material & Energy Balances`,mark:`⇄`,title:`Filter Cake Balance`,fields:[{key:`slurryFeed`,label:`Slurry feed`,unit:`kg/h`,initial:`1200`},{key:`slurrySolids`,label:`Slurry solids fraction`,unit:`fraction`,initial:`0.18`},{key:`cakeMoisture`,label:`Cake liquid fraction`,unit:`fraction`,initial:`0.35`}],formula:`Cake = F xs/(1−xm)`,outputLabel:`Wet filter-cake flow`,outputUnit:`kg/h`,calculate:({slurryFeed:e,slurrySolids:t,cakeMoisture:n})=>e*t/(1-n),interpret:()=>`All feed solids are retained in the wet cake`},
  "finHeatTransfer": {id:`finHeatTransfer`,code:`HT–09`,category:`Heat Transfer`,mark:`ηᶠ`,title:`Fin Efficiency & Heat Transfer`,fields:[{key:`convectionCoefficient`,label:`Convection h`,unit:`W/m²·K`,initial:`25`},{key:`perimeter`,label:`Fin perimeter`,unit:`m`,initial:`0.04`},{key:`conductivity`,label:`Fin conductivity`,unit:`W/m·K`,initial:`205`},{key:`crossSectionArea`,label:`Cross-section area`,unit:`m²`,initial:`0.0001`},{key:`length`,label:`Fin length`,unit:`m`,initial:`0.08`}],formula:`ηᶠ = tanh(mL)/(mL), m = √(hP/kAᶜ)`,outputLabel:`Adiabatic-tip fin efficiency`,outputUnit:`%`,calculate:({convectionCoefficient:e,perimeter:t,conductivity:n,crossSectionArea:r,length:i})=>{let a=Math.sqrt(e*t/(n*r))*i;return Math.tanh(a)/a*100},interpret:()=>`Straight uniform fin with an adiabatic tip`},
  "froudeNumber": {id:`froudeNumber`,code:`FM–05`,category:`Fluid Mechanics`,mark:`≈`,title:`Froude Number & Flow Regime`,fields:[{key:`velocity`,label:`Mean velocity`,unit:`m/s`,initial:`2.5`},{key:`hydraulicDepth`,label:`Hydraulic depth`,unit:`m`,initial:`0.8`}],formula:`Fr = v / √(gDₕ)`,outputLabel:`Froude number`,outputUnit:``,calculate:({velocity:e,hydraulicDepth:t})=>e/Math.sqrt(9.80665*t),interpret:e=>e<1?`Subcritical flow`:e>1?`Supercritical flow`:`Critical flow`},
  "gasAbsorberBalance": {id:`gasAbsorberBalance`,code:`MEB–20`,category:`Material & Energy Balances`,mark:`⇄`,title:`Gas Absorber Balance`,fields:[{key:`gasFlow`,label:`Solute-free gas flow`,unit:`kmol/h`,initial:`500`},{key:`inletRatio`,label:`Inlet solute ratio Y₁`,unit:`kmol/kmol`,initial:`0.08`},{key:`outletRatio`,label:`Outlet solute ratio Y₂`,unit:`kmol/kmol`,initial:`0.02`}],formula:`Nabsorbed = Gs(Y₁−Y₂)`,outputLabel:`Solute absorbed`,outputUnit:`kmol/h`,calculate:({gasFlow:e,inletRatio:t,outletRatio:n})=>e*(t-n),interpret:()=>`Solute-free gas flow is treated as constant`},
  "heatExchangerLMTD": {id:`heatExchangerLMTD`,code:`HT–14`,category:`Heat Transfer`,mark:`Δ`,title:`Heat Exchanger LMTD`,fields:[{key:`hotIn`,label:`Hot inlet`,unit:`°C`,initial:`150`},{key:`hotOut`,label:`Hot outlet`,unit:`°C`,initial:`90`},{key:`coldIn`,label:`Cold inlet`,unit:`°C`,initial:`25`},{key:`coldOut`,label:`Cold outlet`,unit:`°C`,initial:`70`}],formula:`ΔTₗₘ = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)`,outputLabel:`Counter-current LMTD`,outputUnit:`K`,calculate:({hotIn:e,hotOut:t,coldIn:n,coldOut:r})=>{let i=e-r,a=t-n;return Math.abs(i-a)<1e-12?i:(i-a)/Math.log(i/a)},interpret:()=>`Counter-current terminal-temperature basis`},
  "heatExchangerAreaSizing": {id:`heatExchangerAreaSizing`,code:`HT–15`,category:`Heat Transfer`,mark:`▧`,title:`Heat Exchanger Area Sizing`,fields:[{key:`duty`,label:`Heat duty`,unit:`W`,initial:`250000`},{key:`coefficient`,label:`Overall U`,unit:`W/m²·K`,initial:`450`},{key:`lmtd`,label:`LMTD`,unit:`K`,initial:`42`},{key:`correction`,label:`Correction F`,unit:`fraction`,initial:`0.90`}],formula:`A = Q / (U F ΔTₗₘ)`,outputLabel:`Required area`,outputUnit:`m²`,calculate:({duty:e,coefficient:t,lmtd:n,correction:r})=>e/(t*n*r),interpret:()=>`Thermal area before mechanical design allowance`},
  "heatExchangerEffectivenessNTU": {id:`heatExchangerEffectivenessNTU`,code:`HT–16`,category:`Heat Transfer`,mark:`ε`,title:`Heat Exchanger Effectiveness–NTU`,fields:[{key:`ntu`,label:`NTU`,unit:`—`,initial:`2.0`},{key:`capacityRatio`,label:`Capacity ratio Cr`,unit:`—`,initial:`0.60`}],formula:`ε = [1 − e^(−NTU(1−Cr))] / [1 − Cr e^(−NTU(1−Cr))]`,outputLabel:`Counter-current effectiveness`,outputUnit:`%`,calculate:({ntu:e,capacityRatio:t})=>{if(Math.abs(t-1)<1e-10)return e/(1+e)*100;let n=Math.exp(-e*(1-t));return(1-n)/(1-t*n)*100},interpret:()=>`Counter-current exchanger on the ε–NTU basis`},
  "humidifierWaterBalance": {id:`humidifierWaterBalance`,code:`MEB–21`,category:`Material & Energy Balances`,mark:`⇄`,title:`Humidifier Water Balance`,fields:[{key:`dryGasFlow`,label:`Dry-gas flow`,unit:`kg dry gas/h`,initial:`800`},{key:`inletHumidity`,label:`Inlet humidity ratio`,unit:`kg/kg`,initial:`0.008`},{key:`outletHumidity`,label:`Outlet humidity ratio`,unit:`kg/kg`,initial:`0.020`}],formula:`ṁw = ṁdry(ω₂−ω₁)`,outputLabel:`Water evaporated`,outputUnit:`kg/h`,calculate:({dryGasFlow:e,inletHumidity:t,outletHumidity:n})=>e*(n-t),interpret:()=>`Dry-gas mass is conserved across the humidifier`},
  "hydrostaticPressure": {id:`hydrostaticPressure`,code:`FM–06`,category:`Fluid Mechanics`,mark:`h`,title:`Hydrostatic Pressure`,fields:[{key:`density`,label:`Fluid density`,unit:`kg/m³`,initial:`998.2`},{key:`depth`,label:`Liquid depth`,unit:`m`,initial:`6`},{key:`surfacePressure`,label:`Surface pressure`,unit:`Pa`,initial:`101325`}],formula:`P = P₀ + ρgh`,outputLabel:`Absolute pressure`,outputUnit:`Pa`,calculate:({density:e,depth:t,surfacePressure:n})=>n+e*9.80665*t,interpret:e=>`${(e/1e5).toFixed(3)} bar absolute`},
  "limitingReactantExcess": {id:`limitingReactantExcess`,code:`MB–10`,category:`Material & Energy Balances`,mark:`⇄`,title:`Limiting & Excess Reactant`,fields:[{key:`limitingFeed`,label:`Limiting-reactant feed`,unit:`kmol/h`,initial:`100`},{key:`otherFeed`,label:`Other-reactant feed`,unit:`kmol/h`,initial:`240`},{key:`stoichiometricRatio`,label:`Required other/limiting ratio`,unit:`—`,initial:`2`}],formula:`% excess = (nother − r·nlimiting)/(r·nlimiting) × 100`,outputLabel:`Other reactant excess`,outputUnit:`%`,calculate:({limitingFeed:e,otherFeed:t,stoichiometricRatio:n})=>100*(t-n*e)/(n*e),interpret:e=>e>=0?`The named limiting reactant controls the reaction extent`:`Feeds are inconsistent with the selected limiting-reactant basis`},
  "liquidLiquidExtractionBalance": {id:`liquidLiquidExtractionBalance`,code:`MEB–22`,category:`Material & Energy Balances`,mark:`⇄`,title:`Liquid–Liquid Extraction Balance`,fields:[{key:`feedCarrier`,label:`Feed-carrier flow`,unit:`kg/h`,initial:`600`},{key:`distributionCoefficient`,label:`Distribution coefficient K`,unit:`—`,initial:`2.5`},{key:`targetExtraction`,label:`Target extracted fraction`,unit:`fraction`,initial:`0.80`}],formula:`S = EF/[K(1−E)]`,outputLabel:`Fresh solvent required`,outputUnit:`kg/h`,calculate:({feedCarrier:e,distributionCoefficient:t,targetExtraction:n})=>n*e/(t*(1-n)),interpret:()=>`Single ideal equilibrium contact with immiscible carrier and solvent`},
  "membraneSeparatorBalance": {id:`membraneSeparatorBalance`,code:`MEB–23`,category:`Material & Energy Balances`,mark:`⇄`,title:`Membrane Separator Balance`,fields:[{key:`feedFlow`,label:`Feed flow`,unit:`kmol/h`,initial:`100`},{key:`feedFraction`,label:`Feed fraction A`,unit:`fraction`,initial:`0.40`},{key:`retentateFraction`,label:`Retentate fraction A`,unit:`fraction`,initial:`0.20`},{key:`permeateFraction`,label:`Permeate fraction A`,unit:`fraction`,initial:`0.80`}],formula:`P = F(zF−xR)/(yP−xR)`,outputLabel:`Permeate flow`,outputUnit:`kmol/h`,calculate:({feedFlow:e,feedFraction:t,retentateFraction:n,permeateFraction:r})=>e*(t-n)/(r-n),interpret:()=>`Binary total and component balances across the membrane`},
  "openChannelFlow": {id:`openChannelFlow`,code:`FM–10`,category:`Fluid Mechanics`,mark:`Q`,title:`Open Channel Flow`,fields:[{key:`manning`,label:`Manning roughness n`,unit:`—`,initial:`0.013`},{key:`area`,label:`Flow area`,unit:`m²`,initial:`1.8`},{key:`hydraulicRadius`,label:`Hydraulic radius`,unit:`m`,initial:`0.42`},{key:`slope`,label:`Energy slope`,unit:`m/m`,initial:`0.0015`}],formula:`Q = (1/n) A Rₕ^(2/3) S^(1/2)`,outputLabel:`Manning discharge`,outputUnit:`m³/s`,calculate:({manning:e,area:t,hydraulicRadius:n,slope:r})=>t*n**(2/3)*Math.sqrt(r)/e,interpret:()=>`Uniform open-channel flow estimate using SI Manning units`},
  "overallHeatTransferCoefficient": {id:`overallHeatTransferCoefficient`,code:`HT–08`,category:`Heat Transfer`,mark:`♨`,title:`Overall Heat-Transfer Coefficient`,fields:[{key:`insideH`,label:`Inside h`,unit:`W/m²·K`,initial:`500`},{key:`thickness`,label:`Wall thickness`,unit:`m`,initial:`0.005`},{key:`conductivity`,label:`Conductivity`,unit:`W/m·K`,initial:`16`},{key:`outsideH`,label:`Outside h`,unit:`W/m²·K`,initial:`120`}],formula:`1/U = 1/hᵢ + L/k + 1/hₒ`,outputLabel:`Overall coefficient`,outputUnit:`W/m²·K`,calculate:({insideH:e,thickness:t,conductivity:n,outsideH:r})=>1/(1/e+t/n+1/r),interpret:()=>`Plane wall · clean surface basis`},
  "frictionFactor": {id:`frictionFactor`,code:`FM–04`,category:`Fluid Mechanics`,mark:`f`,title:`Pipe Friction Factor`,fields:[{key:`reynolds`,label:`Reynolds number`,unit:`—`,initial:`100000`},{key:`roughness`,label:`Roughness`,unit:`m`,initial:`0.000045`},{key:`diameter`,label:`Diameter`,unit:`m`,initial:`0.10`}],formula:`f = 0.25/[log₁₀(ε/3.7D + 5.74/Re⁰·⁹)]²`,outputLabel:`Darcy friction factor`,outputUnit:``,calculate:({reynolds:e,roughness:t,diameter:n})=>e<2300?64/e:.25/Math.log10(t/(3.7*n)+5.74/e**.9)**2,interpret:e=>e>.03?`Relatively high hydraulic resistance`:`Typical pipe-flow resistance`},
  "pumpPower": {id:`pumpPower`,code:`FM–12`,category:`Fluid Mechanics`,mark:`◉`,title:`Pump Power & Head`,fields:[{key:`density`,label:`Density`,unit:`kg/m³`,initial:`998.2`},{key:`flow`,label:`Flow rate`,unit:`m³/s`,initial:`0.025`},{key:`head`,label:`Pump head`,unit:`m`,initial:`30`},{key:`efficiency`,label:`Efficiency`,unit:`fraction`,initial:`0.75`}],formula:`P = ρgQH / η`,outputLabel:`Shaft power`,outputUnit:`W`,calculate:({density:e,flow:t,head:n,efficiency:r})=>e*9.80665*t*n/r,interpret:e=>`${(e/1e3).toFixed(2)} kW required shaft power`},
  "raoultBubblePointPressure": {id:`raoultBubblePointPressure`,code:`SP–29`,category:`Separation Processes`,mark:`○`,title:`Raoult Bubble-Point Pressure`,fields:[{key:`moleFractionA`,label:`Liquid xₐ`,unit:`fraction`,initial:`0.40`},{key:`saturationA`,label:`P° A`,unit:`kPa`,initial:`120`},{key:`saturationB`,label:`P° B`,unit:`kPa`,initial:`55`}],formula:`Pᵦ = xₐP°ₐ + (1−xₐ)P°ᵦ`,outputLabel:`Bubble-point pressure`,outputUnit:`kPa`,calculate:({moleFractionA:e,saturationA:t,saturationB:n})=>e*t+(1-e)*n,interpret:()=>`Ideal binary liquid · Raoult’s-law basis`},
  "raoultDewPointPressure": {id:`raoultDewPointPressure`,code:`SP–30`,category:`Separation Processes`,mark:`◇`,title:`Raoult Dew-Point Pressure`,fields:[{key:`moleFractionA`,label:`Vapor yₐ`,unit:`fraction`,initial:`0.40`},{key:`saturationA`,label:`P° A`,unit:`kPa`,initial:`120`},{key:`saturationB`,label:`P° B`,unit:`kPa`,initial:`55`}],formula:`1/Pd = yₐ/P°ₐ + (1−yₐ)/P°ᵦ`,outputLabel:`Dew-point pressure`,outputUnit:`kPa`,calculate:({moleFractionA:e,saturationA:t,saturationB:n})=>1/(e/t+(1-e)/n),interpret:()=>`Ideal binary vapor · Raoult’s-law basis`},
} satisfies Record<
  PhaseNineCalculatorId,
  PhaseNineCalculatorDefinition
>

export function isPhaseNineCalculatorId(
  value: string,
): value is PhaseNineCalculatorId {
  return (
    PHASE_NINE_CALCULATOR_IDS as readonly string[]
  ).includes(value)
}
