export type PhaseElevenCalculatorId =
  | "adsorptionIsotherms"
  | "batchAdsorptionDesign"
  | "betIsotherm"
  | "chiltonColburnAnalogy"
  | "convectiveMassTransferCorrelations"
  | "countercurrentLiquidLiquidExtraction"
  | "crosscurrentLiquidLiquidExtraction"
  | "diffusionThroughMembrane"
  | "distributionCoefficientSelectivity"
  | "effectiveDiffusivity"
  | "equimolarCounterDiffusion"
  | "ficksFirstLaw"
  | "ficksSecondLaw"
  | "fixedBedAdsorptionBDST"
  | "gasAbsorptionStrippingFundamentals"
  | "gasPhaseDiffusivity"
  | "interphaseEquilibriumDrivingForces"
  | "kremserMethod"
  | "liquidPhaseDiffusivity"
  | "massTransferCoefficient"
  | "dimensionlessMassTransfer"
  | "membraneGasSeparation"
  | "overallMassTransferCoefficient"
  | "packedColumnHTUNTUDesign"
  | "reverseOsmosisPerformance"
  | "stagnantFilmDiffusion"
  | "steadyStateDiffusion"
  | "twoFilmTheory"

export interface PhaseElevenField {
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}

export interface PhaseElevenDefinition {
  id: PhaseElevenCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseElevenField[]
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

export const PHASE_ELEVEN_IDS = [
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
] as const satisfies readonly PhaseElevenCalculatorId[]

export const PHASE_ELEVEN_DEFINITIONS = {
  "adsorptionIsotherms": {id:`adsorptionIsotherms`,code:`MT–18`,category:`Mass Transfer`,mark:`⠿`,title:`Adsorption Isotherms`,fields:[{key:`maximumCapacity`,label:`Langmuir capacity`,unit:`mol/kg`,initial:`2.5`},{key:`equilibriumConstant`,label:`Langmuir constant`,unit:`m³/mol`,initial:`0.80`},{key:`concentration`,label:`Fluid concentration`,unit:`mol/m³`,initial:`1.5`}],formula:`q = qₘₐₓKC/(1 + KC)`,outputLabel:`Equilibrium loading`,outputUnit:`mol/kg`,calculate:({maximumCapacity:e,equilibriumConstant:t,concentration:n})=>e*t*n/(1+t*n),interpret:e=>`${(100*e/2.5).toFixed(1)}% of the example saturation capacity`},
  "batchAdsorptionDesign": {id:`batchAdsorptionDesign`,code:`MT–08`,category:`Mass Transfer`,mark:`↯`,title:`Batch Adsorption Design`,fields:[{key:`solutionVolume`,label:`Solution volume`,unit:`L`,initial:`1000`},{key:`initialConcentration`,label:`Initial concentration`,unit:`mg/L`,initial:`120`},{key:`equilibriumConcentration`,label:`Target equilibrium concentration`,unit:`mg/L`,initial:`20`},{key:`equilibriumLoading`,label:`Adsorbent loading qₑ`,unit:`mg/g`,initial:`50`}],formula:`mads = V(C₀−Cₑ)/qₑ`,outputLabel:`Adsorbent mass`,outputUnit:`g`,calculate:({solutionVolume:e,initialConcentration:t,equilibriumConcentration:n,equilibriumLoading:r})=>e*(t-n)/r,interpret:()=>`Equilibrium batch balance; verify qₑ with a fitted isotherm`},
  "betIsotherm": {id:`betIsotherm`,code:`MT–33`,category:`Mass Transfer`,mark:`θ`,title:`BET Isotherm`,fields:[{key:`monolayerCapacity`,label:`Monolayer capacity qm`,unit:`mol/kg`,initial:`2.5`},{key:`betConstant`,label:`BET constant C`,unit:``,initial:`40`},{key:`relativePressure`,label:`Relative pressure P/P₀`,unit:`fraction`,initial:`0.25`}],formula:`q = qm Cx / [(1−x)(1+(C−1)x)]`,outputLabel:`Adsorbed amount`,outputUnit:`mol/kg`,calculate:({monolayerCapacity:e,betConstant:t,relativePressure:n})=>e*t*n/((1-n)*(1+(t-1)*n)),interpret:()=>`Multilayer adsorption below saturation pressure`},
  "chiltonColburnAnalogy": {id:`chiltonColburnAnalogy`,code:`MT–11`,category:`Mass Transfer`,mark:`j`,title:`Chilton–Colburn Analogy`,fields:[{key:`frictionFactor`,label:`Fanning friction factor`,unit:``,initial:`0.005`},{key:`velocity`,label:`Bulk velocity`,unit:`m/s`,initial:`2.0`},{key:`schmidt`,label:`Schmidt number`,unit:``,initial:`850`}],formula:`kᶜ = (f/2) u Sc⁻²ᐟ³`,outputLabel:`Mass-transfer coefficient`,outputUnit:`m/s`,calculate:({frictionFactor:e,velocity:t,schmidt:n})=>e/2*t*n**(-2/3),interpret:()=>`Turbulent-flow heat–momentum–mass transfer analogy`},
  "convectiveMassTransferCorrelations": {id:`convectiveMassTransferCorrelations`,code:`MT–15`,category:`Mass Transfer`,mark:`Sh`,title:`Convective Mass-Transfer Correlations`,fields:[{key:`reynolds`,label:`Reynolds number`,unit:``,initial:`25000`},{key:`schmidt`,label:`Schmidt number`,unit:``,initial:`0.85`}],formula:`Sh = 0.023 Re^0.83 Sc^0.44`,outputLabel:`Sherwood number`,outputUnit:``,calculate:({reynolds:e,schmidt:t})=>.023*e**.83*t**.44,interpret:()=>`Turbulent internal-flow screening correlation`},
  "countercurrentLiquidLiquidExtraction": {id:`countercurrentLiquidLiquidExtraction`,code:`MT–20`,category:`Mass Transfer`,mark:`⇆`,title:`Countercurrent Liquid–Liquid Extraction`,fields:[{key:`feedFlow`,label:`Feed carrier flow`,unit:`kg/h`,initial:`1000`},{key:`feedFraction`,label:`Feed solute fraction`,unit:`fraction`,initial:`0.12`},{key:`raffinateFraction`,label:`Raffinate target`,unit:`fraction`,initial:`0.02`},{key:`solventFlow`,label:`Fresh solvent flow`,unit:`kg/h`,initial:`650`}],formula:`ȳ = F(xF − xR) / S`,outputLabel:`Mean extract loading`,outputUnit:`kg solute/kg solvent`,calculate:({feedFlow:e,feedFraction:t,raffinateFraction:n,solventFlow:r})=>e*(t-n)/r,interpret:()=>`Overall countercurrent solute balance on carrier-free flows`},
  "crosscurrentLiquidLiquidExtraction": {id:`crosscurrentLiquidLiquidExtraction`,code:`MT–21`,category:`Mass Transfer`,mark:`×`,title:`Crosscurrent Liquid–Liquid Extraction`,fields:[{key:`initialSolute`,label:`Initial solute mass`,unit:`kg`,initial:`100`},{key:`distributionCoefficient`,label:`Distribution coefficient`,unit:``,initial:`2.5`},{key:`solventRatio`,label:`Solvent/feed per stage`,unit:``,initial:`0.5`},{key:`stages`,label:`Ideal stages`,unit:``,initial:`3`}],formula:`mR = m₀ [1/(1 + K S/F)]ᴺ`,outputLabel:`Solute remaining`,outputUnit:`kg`,calculate:({initialSolute:e,distributionCoefficient:t,solventRatio:n,stages:r})=>e*(1/(1+t*n))**r,interpret:()=>`Equal fresh-solvent portions and ideal equilibrium stages`},
  "diffusionThroughMembrane": {id:`diffusionThroughMembrane`,code:`MT–13`,category:`Mass Transfer`,mark:`Jₘ`,title:`Diffusion Through a Membrane`,fields:[{key:`permeability`,label:`Permeability`,unit:`mol·m/m²·s·Pa`,initial:`2.5e-13`},{key:`pressureDifference`,label:`Partial-pressure difference`,unit:`Pa`,initial:`250000`},{key:`thickness`,label:`Membrane thickness`,unit:`m`,initial:`0.00008`}],formula:`J = PΔp / δ`,outputLabel:`Permeation flux`,outputUnit:`mol/m²·s`,calculate:({permeability:e,pressureDifference:t,thickness:n})=>e*t/n,interpret:()=>`Solution-diffusion estimate with constant permeability`},
  "distributionCoefficientSelectivity": {id:`distributionCoefficientSelectivity`,code:`MT–19`,category:`Mass Transfer`,mark:`β`,title:`Distribution Coefficient & Selectivity`,fields:[{key:`soluteExtract`,label:`Solute in extract`,unit:`mol/m³`,initial:`80`},{key:`soluteRaffinate`,label:`Solute in raffinate`,unit:`mol/m³`,initial:`20`},{key:`carrierExtract`,label:`Carrier in extract`,unit:`mol/m³`,initial:`5`},{key:`carrierRaffinate`,label:`Carrier in raffinate`,unit:`mol/m³`,initial:`50`}],formula:`β = (CE,A/CR,A) / (CE,B/CR,B)`,outputLabel:`Separation factor`,outputUnit:``,calculate:({soluteExtract:e,soluteRaffinate:t,carrierExtract:n,carrierRaffinate:r})=>e/t/(n/r),interpret:e=>e>1?`Solvent is selective for the target solute`:`No favorable target-solute selectivity`},
  "effectiveDiffusivity": {id:`effectiveDiffusivity`,code:`MT–19`,category:`Mass Transfer`,mark:`⠿`,title:`Effective Diffusivity`,fields:[{key:`bulkDiffusivity`,label:`Bulk diffusivity`,unit:`m²/s`,initial:`1.0e-9`},{key:`porosity`,label:`Porosity`,unit:`fraction`,initial:`0.42`},{key:`tortuosity`,label:`Tortuosity`,unit:`—`,initial:`2.5`}],formula:`Dₑ = (ε/τ)D`,outputLabel:`Effective diffusivity`,outputUnit:`m²/s`,calculate:({bulkDiffusivity:e,porosity:t,tortuosity:n})=>e*t/n,interpret:()=>`Porous-medium estimate based on porosity and tortuosity`},
  "equimolarCounterDiffusion": {id:`equimolarCounterDiffusion`,code:`MT–07`,category:`Mass Transfer`,mark:`⇄`,title:`Equimolar Counter-Diffusion`,fields:[{key:`diffusivity`,label:`Diffusivity DAB`,unit:`m²/s`,initial:`1.8e-5`},{key:`totalConcentration`,label:`Total concentration`,unit:`mol/m³`,initial:`40.9`},{key:`fractionOne`,label:`Mole fraction yA₁`,unit:`fraction`,initial:`0.30`},{key:`fractionTwo`,label:`Mole fraction yA₂`,unit:`fraction`,initial:`0.05`},{key:`distance`,label:`Diffusion length`,unit:`m`,initial:`0.01`}],formula:`Nₐ = DAB C (yA₁ − yA₂) / L`,outputLabel:`Molar flux of A`,outputUnit:`mol/m²·s`,calculate:({diffusivity:e,totalConcentration:t,fractionOne:n,fractionTwo:r,distance:i})=>e*t*(n-r)/i,interpret:()=>`Steady binary diffusion with equal and opposite molar fluxes`},
  "ficksFirstLaw": {id:`ficksFirstLaw`,code:`MT–01`,category:`Mass Transfer`,mark:`⠿`,title:`Fick’s First Law`,fields:[{key:`diffusivity`,label:`Diffusivity`,unit:`m²/s`,initial:`1.0e-9`},{key:`concentrationA`,label:`C at x₁`,unit:`mol/m³`,initial:`100`},{key:`concentrationB`,label:`C at x₂`,unit:`mol/m³`,initial:`20`},{key:`distance`,label:`Distance`,unit:`m`,initial:`0.002`}],formula:`J = −D (C₂ − C₁) / Δx`,outputLabel:`Molar flux`,outputUnit:`mol/m²·s`,calculate:({diffusivity:e,concentrationA:t,concentrationB:n,distance:r})=>-e*(n-t)/r,interpret:e=>e>=0?`Net transport from x₁ toward x₂`:`Net transport from x₂ toward x₁`},
  "ficksSecondLaw": {id:`ficksSecondLaw`,code:`MT–09`,category:`Mass Transfer`,mark:`∂`,title:`Fick’s Second Law`,fields:[{key:`diffusivity`,label:`Diffusivity`,unit:`m²/s`,initial:`1.0e-9`},{key:`time`,label:`Diffusion time`,unit:`s`,initial:`3600`}],formula:`ℓd = √(2Dt)`,outputLabel:`Diffusion penetration length`,outputUnit:`m`,calculate:({diffusivity:e,time:t})=>Math.sqrt(2*e*t),interpret:()=>`Characteristic one-dimensional transient diffusion length`},
  "fixedBedAdsorptionBDST": {id:`fixedBedAdsorptionBDST`,code:`MT–31`,category:`Mass Transfer`,mark:`B`,title:`Fixed-Bed Adsorption BDST`,fields:[{key:`capacity`,label:`Bed capacity N₀`,unit:`mg/L bed`,initial:`18000`},{key:`depth`,label:`Bed depth`,unit:`m`,initial:`1.2`},{key:`concentration`,label:`Feed concentration`,unit:`mg/L`,initial:`120`},{key:`velocity`,label:`Superficial velocity`,unit:`m/h`,initial:`8`}],formula:`t ≈ N₀ Z / (C₀ v)`,outputLabel:`Ideal service time`,outputUnit:`h`,calculate:({capacity:e,depth:t,concentration:n,velocity:r})=>e*t/(n*r),interpret:()=>`Capacity-controlled BDST screening before kinetic correction`},
  "gasAbsorptionStrippingFundamentals": {id:`gasAbsorptionStrippingFundamentals`,code:`MT–18`,category:`Mass Transfer`,mark:`↕`,title:`Gas Absorption & Stripping Fundamentals`,fields:[{key:`liquidFlow`,label:`Solute-free liquid flow L`,unit:`kmol/h`,initial:`120`},{key:`gasFlow`,label:`Solute-free gas flow V`,unit:`kmol/h`,initial:`80`},{key:`equilibriumSlope`,label:`Equilibrium slope m`,unit:``,initial:`1.2`}],formula:`A = L/(mV)`,outputLabel:`Absorption factor`,outputUnit:``,calculate:({liquidFlow:e,gasFlow:t,equilibriumSlope:n})=>e/(n*t),interpret:e=>e>1?`Absorption is favored (A > 1)`:`Stripping tendency is stronger (A ≤ 1)`},
  "gasPhaseDiffusivity": {id:`gasPhaseDiffusivity`,code:`MT–12`,category:`Mass Transfer`,mark:`↟`,title:`Gas-Phase Diffusivity`,fields:[{key:`referenceDiffusivity`,label:`Reference diffusivity`,unit:`m²/s`,initial:`2.0e-5`},{key:`temperature`,label:`Temperature`,unit:`K`,initial:`350`},{key:`referenceTemperature`,label:`Reference temperature`,unit:`K`,initial:`298.15`},{key:`pressure`,label:`Pressure`,unit:`bar`,initial:`2`},{key:`referencePressure`,label:`Reference pressure`,unit:`bar`,initial:`1`}],formula:`D = Dref(T/Tref)^1.75(Pref/P)`,outputLabel:`Gas diffusivity`,outputUnit:`m²/s`,calculate:({referenceDiffusivity:e,temperature:t,referenceTemperature:n,pressure:r,referencePressure:i})=>e*(t/n)**1.75*i/r,interpret:()=>`Low-pressure gas scaling from a known reference diffusivity`},
  "interphaseEquilibriumDrivingForces": {id:`interphaseEquilibriumDrivingForces`,code:`MT–17`,category:`Mass Transfer`,mark:`Δ`,title:`Interphase Equilibrium & Driving Forces`,fields:[{key:`overallCoefficient`,label:`Overall coefficient`,unit:`mol/m²·s`,initial:`0.035`},{key:`gasFraction`,label:`Bulk gas fraction y`,unit:`fraction`,initial:`0.18`},{key:`liquidFraction`,label:`Bulk liquid fraction x`,unit:`fraction`,initial:`0.04`},{key:`equilibriumSlope`,label:`Equilibrium slope m`,unit:``,initial:`2.0`}],formula:`Nₐ = KG(y−mx)`,outputLabel:`Interphase molar flux`,outputUnit:`mol/m²·s`,calculate:({overallCoefficient:e,gasFraction:t,liquidFraction:n,equilibriumSlope:r})=>e*(t-r*n),interpret:e=>e>=0?`Absorption: gas to liquid`:`Stripping: liquid to gas`},
  "kremserMethod": {id:`kremserMethod`,code:`MT–23`,category:`Mass Transfer`,mark:`N`,title:`Kremser Method`,fields:[{key:`absorptionFactor`,label:`Absorption factor A`,unit:``,initial:`1.5`},{key:`stages`,label:`Ideal stages`,unit:``,initial:`5`}],formula:`Yout/Yin = (A − 1)/(Aᴺ⁺¹ − 1)`,outputLabel:`Outlet-to-inlet solute ratio`,outputUnit:``,calculate:({absorptionFactor:e,stages:t})=>Math.abs(e-1)<1e-10?1/(t+1):(e-1)/(e**(t+1)-1),interpret:()=>`Lean-solvent Kremser solution with linear equilibrium`},
  "liquidPhaseDiffusivity": {id:`liquidPhaseDiffusivity`,code:`MT–13`,category:`Mass Transfer`,mark:`≋`,title:`Liquid-Phase Diffusivity`,fields:[{key:`referenceDiffusivity`,label:`Reference diffusivity`,unit:`m²/s`,initial:`1.0e-9`},{key:`temperature`,label:`Temperature`,unit:`K`,initial:`323.15`},{key:`referenceTemperature`,label:`Reference temperature`,unit:`K`,initial:`298.15`},{key:`viscosity`,label:`Liquid viscosity`,unit:`mPa·s`,initial:`0.65`},{key:`referenceViscosity`,label:`Reference viscosity`,unit:`mPa·s`,initial:`0.89`}],formula:`D = Dref(T/Tref)(μref/μ)`,outputLabel:`Liquid diffusivity`,outputUnit:`m²/s`,calculate:({referenceDiffusivity:e,temperature:t,referenceTemperature:n,viscosity:r,referenceViscosity:i})=>e*t/n*i/r,interpret:()=>`Stokes–Einstein temperature–viscosity scaling at fixed solute size`},
  "massTransferCoefficient": {id:`massTransferCoefficient`,code:`MT–28`,category:`Mass Transfer`,mark:`kᶜ`,title:`Mass-Transfer Coefficient`,fields:[{key:`flux`,label:`Molar flux`,unit:`mol/m²·s`,initial:`0.018`},{key:`bulkConcentration`,label:`Bulk concentration`,unit:`mol/m³`,initial:`12`},{key:`interfaceConcentration`,label:`Interface concentration`,unit:`mol/m³`,initial:`3`}],formula:`kᶜ = Nₐ / (Cₐ,bulk − Cₐ,i)`,outputLabel:`Film mass-transfer coefficient`,outputUnit:`m/s`,calculate:({flux:e,bulkConcentration:t,interfaceConcentration:n})=>e/(t-n),interpret:()=>`Concentration-driving-force film coefficient`},
  "dimensionlessMassTransfer": {id:`dimensionlessMassTransfer`,code:`MT–14`,category:`Mass Transfer`,mark:`Sh`,title:`Mass-Transfer Numbers`,fields:[{key:`coefficient`,label:`Mass-transfer coefficient`,unit:`m/s`,initial:`0.012`},{key:`length`,label:`Characteristic length`,unit:`m`,initial:`0.05`},{key:`diffusivity`,label:`Diffusivity`,unit:`m²/s`,initial:`1.8e-5`}],formula:`Sh = kL/D`,outputLabel:`Sherwood number`,outputUnit:``,calculate:({coefficient:e,length:t,diffusivity:n})=>e*t/n,interpret:()=>`Ratio of convective to molecular mass transfer`},
  "membraneGasSeparation": {id:`membraneGasSeparation`,code:`MT–27`,category:`Mass Transfer`,mark:`║`,title:`Membrane Gas Separation`,fields:[{key:`permeance`,label:`Component permeance`,unit:`mol/m²·s·Pa`,initial:`2.0e-9`},{key:`feedPartialPressure`,label:`Feed partial pressure`,unit:`Pa`,initial:`300000`},{key:`permeatePartialPressure`,label:`Permeate partial pressure`,unit:`Pa`,initial:`50000`},{key:`area`,label:`Membrane area`,unit:`m²`,initial:`25`}],formula:`ṅA = ΠA (pF − pP)`,outputLabel:`Component permeation rate`,outputUnit:`mol/s`,calculate:({permeance:e,feedPartialPressure:t,permeatePartialPressure:n,area:r})=>e*r*(t-n),interpret:()=>`Solution–diffusion estimate with constant permeance`},
  "overallMassTransferCoefficient": {id:`overallMassTransferCoefficient`,code:`MT–24`,category:`Mass Transfer`,mark:`K`,title:`Overall Mass-Transfer Coefficient`,fields:[{key:`gasCoefficient`,label:`Gas-film coefficient`,unit:`mol/m²·s·Pa`,initial:`2.5e-7`},{key:`liquidCoefficient`,label:`Liquid-film coefficient`,unit:`m/s`,initial:`0.0002`},{key:`henrySlope`,label:`Equilibrium slope m`,unit:`Pa·m³/mol`,initial:`1200`}],formula:`1/KG = 1/kG + m/kL`,outputLabel:`Overall gas-side coefficient`,outputUnit:`mol/m²·s·Pa`,calculate:({gasCoefficient:e,liquidCoefficient:t,henrySlope:n})=>1/(1/e+n/t),interpret:()=>`Two-film resistance model on a gas-phase driving-force basis`},
  "packedColumnHTUNTUDesign": {id:`packedColumnHTUNTUDesign`,code:`MT–25`,category:`Mass Transfer`,mark:`H`,title:`Packed-Column HTU–NTU Design`,fields:[{key:`gasVelocity`,label:`Molar gas velocity`,unit:`mol/m²·s`,initial:`2.4`},{key:`overallCoefficient`,label:`Overall coefficient Kya`,unit:`mol/m³·s`,initial:`0.85`},{key:`ntu`,label:`Transfer units NTU`,unit:``,initial:`4.5`}],formula:`HTU = G/Kya; Z = HTU × NTU`,outputLabel:`Required packing height`,outputUnit:`m`,calculate:({gasVelocity:e,overallCoefficient:t,ntu:n})=>e/t*n,interpret:()=>`Overall gas-phase transfer-unit design basis`},
  "reverseOsmosisPerformance": {id:`reverseOsmosisPerformance`,code:`MT–29`,category:`Mass Transfer`,mark:`Π`,title:`Reverse Osmosis Performance`,fields:[{key:`waterPermeability`,label:`Water permeability A`,unit:`L/m²·h·bar`,initial:`1.8`},{key:`pressureDifference`,label:`Applied ΔP`,unit:`bar`,initial:`18`},{key:`osmoticDifference`,label:`Osmotic Δπ`,unit:`bar`,initial:`4`},{key:`area`,label:`Membrane area`,unit:`m²`,initial:`40`}],formula:`Qp = Aₘ A (ΔP − Δπ)`,outputLabel:`Permeate flow`,outputUnit:`L/h`,calculate:({waterPermeability:e,pressureDifference:t,osmoticDifference:n,area:r})=>e*r*(t-n),interpret:()=>`Positive net driving-pressure water-flux model`},
  "stagnantFilmDiffusion": {id:`stagnantFilmDiffusion`,code:`MT–11`,category:`Mass Transfer`,mark:`◌`,title:`Stagnant-Film Diffusion`,fields:[{key:`diffusivity`,label:`Diffusivity`,unit:`m²/s`,initial:`1.8e-5`},{key:`totalConcentration`,label:`Total concentration`,unit:`mol/m³`,initial:`40.9`},{key:`fractionOne`,label:`Gas mole fraction y₁`,unit:`fraction`,initial:`0.25`},{key:`fractionTwo`,label:`Gas mole fraction y₂`,unit:`fraction`,initial:`0.05`},{key:`thickness`,label:`Film thickness`,unit:`m`,initial:`0.003`}],formula:`Nₐ = DC/L · ln[(1−y₂)/(1−y₁)]`,outputLabel:`Molar flux`,outputUnit:`mol/m²·s`,calculate:({diffusivity:e,totalConcentration:t,fractionOne:n,fractionTwo:r,thickness:i})=>e*t/i*Math.log((1-r)/(1-n)),interpret:()=>`Species A diffuses through stagnant, non-diffusing species B`},
  "steadyStateDiffusion": {id:`steadyStateDiffusion`,code:`MT–10`,category:`Mass Transfer`,mark:`⇢`,title:`Steady-State Diffusion`,fields:[{key:`diffusivity`,label:`Diffusivity`,unit:`m²/s`,initial:`1.2e-9`},{key:`concentrationOne`,label:`Concentration C₁`,unit:`mol/m³`,initial:`120`},{key:`concentrationTwo`,label:`Concentration C₂`,unit:`mol/m³`,initial:`30`},{key:`thickness`,label:`Film thickness`,unit:`m`,initial:`0.0015`}],formula:`Nₐ = D(C₁−C₂)/L`,outputLabel:`Molar flux`,outputUnit:`mol/m²·s`,calculate:({diffusivity:e,concentrationOne:t,concentrationTwo:n,thickness:r})=>e*(t-n)/r,interpret:()=>`Positive flux is reported from side 1 toward side 2`},
  "twoFilmTheory": {id:`twoFilmTheory`,code:`MT–16`,category:`Mass Transfer`,mark:`⇆`,title:`Two-Film Theory`,fields:[{key:`gasCoefficient`,label:`Gas-film coefficient kG`,unit:`mol/m²·s·bar`,initial:`0.08`},{key:`liquidCoefficient`,label:`Liquid-film coefficient kL`,unit:`mol/m²·s·bar`,initial:`0.12`},{key:`equilibriumSlope`,label:`Equilibrium slope m`,unit:``,initial:`1.5`}],formula:`1/KG = 1/kG + m/kL`,outputLabel:`Overall gas-basis coefficient`,outputUnit:`mol/m²·s·bar`,calculate:({gasCoefficient:e,liquidCoefficient:t,equilibriumSlope:n})=>1/(1/e+n/t),interpret:()=>`Gas- and liquid-film resistances combined on a gas-phase basis`},
} satisfies Record<
  PhaseElevenCalculatorId,
  PhaseElevenDefinition
>
