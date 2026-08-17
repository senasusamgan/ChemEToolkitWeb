export type PhaseTwelveCalculatorId =
  | "averageMolecularWeight"
  | "binaryCompositionBasisConversion"
  | "chemicalFormulaMolecularWeight"
  | "densitySpecificGravity"
  | "engineeringPrefixConverter"
  | "massFlowMolarFlowConversion"
  | "massFractionCalculator"
  | "massMoleConversion"
  | "mixtureDensityCalculator"
  | "moleFractionCalculator"
  | "concentrationScaleConverter"
  | "significantFiguresRounding"
  | "solutionConcentration"
  | "standardGasFlowConverter"
  | "unitConverter"
  | "volumetricMassFlowConversion"
  | "biotNumber"
  | "combinedConvectionRadiation"
  | "compositeWallConduction"
  | "criticalRadiusOfInsulation"
  | "cylindricalWallConduction"
  | "forcedConvectionCorrelation"
  | "foulingAnalysis"
  | "fourierNumber"
  | "grashofNumber"
  | "naturalConvectionCorrelation"
  | "nusseltNumber"
  | "planeWallConduction"
  | "prandtlNumber"
  | "rayleighNumber"
  | "shellAndTubeHeatExchanger"
  | "sphericalWallConduction"
  | "thermalRadiation"
  | "thermalResistanceNetwork"
  | "lumpedCapacitance"

export interface PhaseTwelveField {
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}

export interface PhaseTwelveDefinition {
  id: PhaseTwelveCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseTwelveField[]
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

export const PHASE_TWELVE_IDS = [
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
  "biotNumber",
  "combinedConvectionRadiation",
  "compositeWallConduction",
  "criticalRadiusOfInsulation",
  "cylindricalWallConduction",
  "forcedConvectionCorrelation",
  "foulingAnalysis",
  "fourierNumber",
  "grashofNumber",
  "naturalConvectionCorrelation",
  "nusseltNumber",
  "planeWallConduction",
  "prandtlNumber",
  "rayleighNumber",
  "shellAndTubeHeatExchanger",
  "sphericalWallConduction",
  "thermalRadiation",
  "thermalResistanceNetwork",
  "lumpedCapacitance",
] as const satisfies readonly PhaseTwelveCalculatorId[]

export const PHASE_TWELVE_DEFINITIONS = {
  "averageMolecularWeight": {id:`averageMolecularWeight`,code:`EF–01`,category:`Engineering Fundamentals`,mark:`M̄`,title:`Average Molecular Weight`,fields:[{key:`fractionA`,label:`Mole fraction A`,unit:`fraction`,initial:`0.65`},{key:`molecularWeightA`,label:`Molecular weight A`,unit:`g/mol`,initial:`28.01`},{key:`molecularWeightB`,label:`Molecular weight B`,unit:`g/mol`,initial:`44.01`}],formula:`M̄ = xₐMₐ + (1−xₐ)Mᵦ`,outputLabel:`Mixture molecular weight`,outputUnit:`g/mol`,calculate:({fractionA:e,molecularWeightA:t,molecularWeightB:n})=>e*t+(1-e)*n,interpret:()=>`Binary-mixture mole-fraction basis`},
  "binaryCompositionBasisConversion": {id:`binaryCompositionBasisConversion`,code:`EF–02`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Binary Mass–Mole Fraction`,fields:[{key:`massFractionA`,label:`Mass fraction A`,unit:`fraction`,initial:`0.40`},{key:`molecularWeightA`,label:`Molecular weight A`,unit:`g/mol`,initial:`18.015`},{key:`molecularWeightB`,label:`Molecular weight B`,unit:`g/mol`,initial:`46.07`}],formula:`xA = (wA/MA) / [(wA/MA) + ((1−wA)/MB)]`,outputLabel:`Mole fraction A`,outputUnit:``,calculate:({massFractionA:e,molecularWeightA:t,molecularWeightB:n})=>e/t/(e/t+(1-e)/n),interpret:e=>`${(e*100).toFixed(2)} mol% component A`},
  "chemicalFormulaMolecularWeight": {id:`chemicalFormulaMolecularWeight`,code:`EF–03`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Chemical Formula Molecular Weight`,fields:[{key:`carbonAtoms`,label:`Carbon atoms`,unit:`atoms`,initial:`2`},{key:`hydrogenAtoms`,label:`Hydrogen atoms`,unit:`atoms`,initial:`6`},{key:`oxygenAtoms`,label:`Oxygen atoms`,unit:`atoms`,initial:`1`}],formula:`M = 12.011nC + 1.008nH + 15.999nO`,outputLabel:`Molecular weight`,outputUnit:`g/mol`,calculate:({carbonAtoms:e,hydrogenAtoms:t,oxygenAtoms:n})=>12.011*e+1.008*t+15.999*n,interpret:()=>`Calculated for a C–H–O molecular formula using standard atomic weights`},
  "densitySpecificGravity": {id:`densitySpecificGravity`,code:`EF–04`,category:`Engineering Fundamentals`,mark:`ρ`,title:`Density & Specific Gravity`,fields:[{key:`mass`,label:`Mass`,unit:`kg`,initial:`785`},{key:`volume`,label:`Volume`,unit:`m³`,initial:`0.10`},{key:`referenceDensity`,label:`Reference density`,unit:`kg/m³`,initial:`998.2`}],formula:`ρ = m/V; SG = ρ/ρref`,outputLabel:`Specific gravity`,outputUnit:``,calculate:({mass:e,volume:t,referenceDensity:n})=>e/t/n,interpret:e=>`Density ${(e*998.2).toFixed(1)} kg/m³ on the water-reference basis`},
  "engineeringPrefixConverter": {id:`engineeringPrefixConverter`,code:`EF–05`,category:`Engineering Fundamentals`,mark:`10ⁿ`,title:`Engineering Prefix Converter`,fields:[{key:`value`,label:`Input value`,unit:`base unit`,initial:`2.5`},{key:`sourceExponent`,label:`Source exponent`,unit:`10ⁿ`,initial:`3`},{key:`targetExponent`,label:`Target exponent`,unit:`10ⁿ`,initial:`-3`}],formula:`x₂ = x₁ × 10^(n₁−n₂)`,outputLabel:`Converted value`,outputUnit:`target unit`,calculate:({value:e,sourceExponent:t,targetExponent:n})=>e*10**(t-n),interpret:()=>`Use engineering exponents such as 3 for kilo and −3 for milli`},
  "massFlowMolarFlowConversion": {id:`massFlowMolarFlowConversion`,code:`EF–07`,category:`Engineering Fundamentals`,mark:`ṁ↔ṅ`,title:`Mass Flow–Molar Flow`,fields:[{key:`massFlow`,label:`Mass flow`,unit:`kg/h`,initial:`1800`},{key:`molecularWeight`,label:`Molecular weight`,unit:`kg/kmol`,initial:`18.015`}],formula:`ṅ = ṁ / M`,outputLabel:`Molar flow`,outputUnit:`kmol/h`,calculate:({massFlow:e,molecularWeight:t})=>e/t,interpret:()=>`Flow-rate conversion on the supplied molecular-weight basis`},
  "massFractionCalculator": {id:`massFractionCalculator`,code:`EF–08`,category:`Engineering Fundamentals`,mark:`w`,title:`Mass Fraction`,fields:[{key:`componentMass`,label:`Component mass`,unit:`kg`,initial:`35`},{key:`totalMass`,label:`Mixture mass`,unit:`kg`,initial:`140`}],formula:`wᵢ = mᵢ / mₜₒₜ`,outputLabel:`Component mass fraction`,outputUnit:`%`,calculate:({componentMass:e,totalMass:t})=>e/t*100,interpret:()=>`Mass-based composition of the selected component`},
  "massMoleConversion": {id:`massMoleConversion`,code:`EF–09`,category:`Engineering Fundamentals`,mark:`⇄`,title:`Mass–Mole Conversion`,fields:[{key:`mass`,label:`Mass`,unit:`kg`,initial:`12.5`},{key:`molecularWeight`,label:`Molecular weight`,unit:`kg/kmol`,initial:`18.015`}],formula:`n = m / M`,outputLabel:`Amount of substance`,outputUnit:`kmol`,calculate:({mass:e,molecularWeight:t})=>e/t,interpret:()=>`Mass converted on the supplied molecular-weight basis`},
  "mixtureDensityCalculator": {id:`mixtureDensityCalculator`,code:`EF–10`,category:`Engineering Fundamentals`,mark:`ρₘ`,title:`Mixture Density`,fields:[{key:`massA`,label:`Mass A`,unit:`kg`,initial:`60`},{key:`densityA`,label:`Density A`,unit:`kg/m³`,initial:`800`},{key:`massB`,label:`Mass B`,unit:`kg`,initial:`40`},{key:`densityB`,label:`Density B`,unit:`kg/m³`,initial:`1000`}],formula:`ρₘ = (mₐ+mᵦ)/(mₐ/ρₐ+mᵦ/ρᵦ)`,outputLabel:`Ideal mixture density`,outputUnit:`kg/m³`,calculate:({massA:e,densityA:t,massB:n,densityB:r})=>(e+n)/(e/t+n/r),interpret:()=>`Additive-volume mixture estimate`},
  "moleFractionCalculator": {id:`moleFractionCalculator`,code:`EF–11`,category:`Engineering Fundamentals`,mark:`x`,title:`Mole Fraction`,fields:[{key:`componentMoles`,label:`Component amount`,unit:`mol`,initial:`2.4`},{key:`totalMoles`,label:`Total amount`,unit:`mol`,initial:`6.0`}],formula:`xᵢ = nᵢ / nₜₒₜ`,outputLabel:`Component mole fraction`,outputUnit:`%`,calculate:({componentMoles:e,totalMoles:t})=>e/t*100,interpret:()=>`Molar composition of the selected component`},
  "concentrationScaleConverter": {id:`concentrationScaleConverter`,code:`EF–12`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Percent–ppm–ppb Converter`,fields:[{key:`massPercent`,label:`Mass concentration`,unit:`%`,initial:`0.25`}],formula:`ppm = mass% × 10⁴`,outputLabel:`Concentration`,outputUnit:`ppm`,calculate:({massPercent:e})=>e*1e4,interpret:e=>`${(e*1e3).toLocaleString(`en-US`)} ppb on the same mass basis`},
  "significantFiguresRounding": {id:`significantFiguresRounding`,code:`EF–13`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Significant Figures & Rounding`,fields:[{key:`value`,label:`Value`,unit:`—`,initial:`12345.6789`},{key:`figures`,label:`Significant figures`,unit:`digits`,initial:`4`}],formula:`rounded = value expressed to n significant digits`,outputLabel:`Rounded value`,outputUnit:``,calculate:({value:e,figures:t})=>Number(e.toPrecision(Math.floor(t))),interpret:()=>`Rounded to the requested significant-digit count`},
  "solutionConcentration": {id:`solutionConcentration`,code:`EF–14`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Solution Concentration`,fields:[{key:`soluteMoles`,label:`Solute amount`,unit:`mol`,initial:`0.50`},{key:`solutionVolume`,label:`Solution volume`,unit:`L`,initial:`2.0`}],formula:`c = nsolute / Vsolution`,outputLabel:`Molar concentration`,outputUnit:`mol/L`,calculate:({soluteMoles:e,solutionVolume:t})=>e/t,interpret:e=>`${(e*1e3).toFixed(2)} mol/m³`},
  "standardGasFlowConverter": {id:`standardGasFlowConverter`,code:`EF–15`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Standard Gas Flow Converter`,fields:[{key:`actualFlow`,label:`Actual volumetric flow`,unit:`m³/h`,initial:`100`},{key:`actualPressure`,label:`Absolute pressure`,unit:`kPa`,initial:`200`},{key:`actualTemperature`,label:`Actual temperature`,unit:`K`,initial:`350`}],formula:`Qs = Qa(Pa/Ps)(Ts/Ta), Ps = 101.325 kPa, Ts = 273.15 K`,outputLabel:`Standard volumetric flow`,outputUnit:`Sm³/h`,calculate:({actualFlow:e,actualPressure:t,actualTemperature:n})=>t/101.325*e*(273.15/n),interpret:()=>`Ideal-gas conversion to 101.325 kPa and 273.15 K`},
  "unitConverter": {id:`unitConverter`,code:`EF–17`,category:`Engineering Fundamentals`,mark:`⌁`,title:`Unit Converter`,fields:[{key:`pressureBar`,label:`Pressure`,unit:`bar`,initial:`2.50`}],formula:`P(Pa) = P(bar) × 100,000`,outputLabel:`Pressure`,outputUnit:`Pa`,calculate:({pressureBar:e})=>e*1e5,interpret:e=>`${(e/1e3).toFixed(2)} kPa`},
  "volumetricMassFlowConversion": {id:`volumetricMassFlowConversion`,code:`EF–17`,category:`Engineering Fundamentals`,mark:`Q↔ṁ`,title:`Volumetric Flow–Mass Flow`,fields:[{key:`volumetricFlow`,label:`Volumetric flow`,unit:`m³/h`,initial:`12.5`},{key:`density`,label:`Fluid density`,unit:`kg/m³`,initial:`998.2`}],formula:`ṁ = ρQ`,outputLabel:`Mass flow`,outputUnit:`kg/h`,calculate:({volumetricFlow:e,density:t})=>e*t,interpret:()=>`Steady-flow conversion at the specified density`},
  "biotNumber": {id:`biotNumber`,code:`HT–02`,category:`Heat Transfer`,mark:`♨`,title:`Biot Number`,fields:[{key:`coefficient`,label:`Convection coefficient`,unit:`W/m²·K`,initial:`25`},{key:`characteristicLength`,label:`Characteristic length`,unit:`m`,initial:`0.01`},{key:`conductivity`,label:`Solid conductivity`,unit:`W/m·K`,initial:`15`}],formula:`Bi = hLc / k`,outputLabel:`Biot number`,outputUnit:``,calculate:({coefficient:e,characteristicLength:t,conductivity:n})=>e*t/n,interpret:e=>e<.1?`Lumped-capacitance analysis is generally suitable`:`Internal temperature gradients may be important`},
  "combinedConvectionRadiation": {id:`combinedConvectionRadiation`,code:`HT–07`,category:`Heat Transfer`,mark:`♨`,title:`Combined Convection & Radiation`,fields:[{key:`coefficient`,label:`Convection coefficient`,unit:`W/m²·K`,initial:`18`},{key:`emissivity`,label:`Surface emissivity`,unit:`fraction`,initial:`0.82`},{key:`area`,label:`Surface area`,unit:`m²`,initial:`1.5`},{key:`surfaceTemperature`,label:`Surface temperature`,unit:`K`,initial:`420`},{key:`surroundingTemperature`,label:`Fluid/surroundings temperature`,unit:`K`,initial:`298.15`}],formula:`Q̇ = hA(Tₛ−T∞) + εσA(Tₛ⁴−Tsur⁴)`,outputLabel:`Combined heat rate`,outputUnit:`W`,calculate:({coefficient:e,emissivity:t,area:n,surfaceTemperature:r,surroundingTemperature:i})=>e*n*(r-i)+t*5.670374419e-8*n*(r**4-i**4),interpret:e=>`${(e/1e3).toFixed(2)} kW combined convection–radiation loss`},
  "compositeWallConduction": {id:`compositeWallConduction`,code:`HT–07`,category:`Heat Transfer`,mark:`♨`,title:`Composite-Wall Conduction`,fields:[{key:`hotTemperature`,label:`Hot-side temperature`,unit:`°C`,initial:`150`},{key:`coldTemperature`,label:`Cold-side temperature`,unit:`°C`,initial:`30`},{key:`resistanceOne`,label:`Layer 1 resistance`,unit:`K/W`,initial:`0.08`},{key:`resistanceTwo`,label:`Layer 2 resistance`,unit:`K/W`,initial:`0.12`}],formula:`Q = (Th − Tc)/(R1 + R2)`,outputLabel:`Heat-transfer rate`,outputUnit:`W`,calculate:({hotTemperature:e,coldTemperature:t,resistanceOne:n,resistanceTwo:r})=>(e-t)/(n+r),interpret:()=>`One-dimensional steady conduction through two layers in series`},
  "criticalRadiusOfInsulation": {id:`criticalRadiusOfInsulation`,code:`HT–07`,category:`Heat Transfer`,mark:`rᶜ`,title:`Critical Radius of Insulation`,fields:[{key:`conductivity`,label:`Insulation conductivity`,unit:`W/m·K`,initial:`0.045`},{key:`convectionCoefficient`,label:`Outside convection h`,unit:`W/m²·K`,initial:`12`}],formula:`rᶜ = k / h`,outputLabel:`Critical cylinder radius`,outputUnit:`m`,calculate:({conductivity:e,convectionCoefficient:t})=>e/t,interpret:e=>`${(e*1e3).toFixed(2)} mm critical outer radius`},
  "cylindricalWallConduction": {id:`cylindricalWallConduction`,code:`HT–03`,category:`Heat Transfer`,mark:`◯`,title:`Cylindrical Wall Conduction`,fields:[{key:`conductivity`,label:`Thermal conductivity`,unit:`W/m·K`,initial:`16`},{key:`length`,label:`Cylinder length`,unit:`m`,initial:`2`},{key:`innerRadius`,label:`Inner radius`,unit:`m`,initial:`0.04`},{key:`outerRadius`,label:`Outer radius`,unit:`m`,initial:`0.06`},{key:`hotTemperature`,label:`Inner temperature`,unit:`°C`,initial:`180`},{key:`coldTemperature`,label:`Outer temperature`,unit:`°C`,initial:`60`}],formula:`Q̇ = 2πkL(Tᵢ−Tₒ) / ln(rₒ/rᵢ)`,outputLabel:`Radial heat-transfer rate`,outputUnit:`W`,calculate:({conductivity:e,length:t,innerRadius:n,outerRadius:r,hotTemperature:i,coldTemperature:a})=>2*Math.PI*e*t*(i-a)/Math.log(r/n),interpret:()=>`Steady one-dimensional radial conduction`},
  "forcedConvectionCorrelation": {id:`forcedConvectionCorrelation`,code:`HT–19`,category:`Heat Transfer`,mark:`♨`,title:`Forced Convection Correlation`,fields:[{key:`reynolds`,label:`Reynolds number`,unit:`—`,initial:`50000`},{key:`prandtl`,label:`Prandtl number`,unit:`—`,initial:`7.0`},{key:`conductivity`,label:`Fluid conductivity`,unit:`W/m·K`,initial:`0.60`},{key:`length`,label:`Characteristic length`,unit:`m`,initial:`0.05`}],formula:`Nu = 0.023Re⁰·⁸Pr⁰·⁴; h = Nuk/L`,outputLabel:`Heat-transfer coefficient`,outputUnit:`W/m²·K`,calculate:({reynolds:e,prandtl:t,conductivity:n,length:r})=>.023*e**.8*t**.4*n/r,interpret:()=>`Dittus–Boelter screening estimate for turbulent internal flow`},
  "foulingAnalysis": {id:`foulingAnalysis`,code:`HT–13`,category:`Heat Transfer`,mark:`♨`,title:`Fouling Analysis`,fields:[{key:`cleanCoefficient`,label:`Clean overall coefficient`,unit:`W/m²·K`,initial:`500`},{key:`foulingResistance`,label:`Fouling resistance`,unit:`m²·K/W`,initial:`0.0004`}],formula:`1/Uf = 1/Uclean + Rf`,outputLabel:`Fouled overall coefficient`,outputUnit:`W/m²·K`,calculate:({cleanCoefficient:e,foulingResistance:t})=>1/(1/e+t),interpret:()=>`The supplied fouling resistance is included in the overall resistance`},
  "fourierNumber": {id:`fourierNumber`,code:`HT–13`,category:`Heat Transfer`,mark:`♨`,title:`Fourier Number`,fields:[{key:`diffusivity`,label:`Thermal diffusivity`,unit:`m²/s`,initial:`1.4e-7`},{key:`time`,label:`Elapsed time`,unit:`s`,initial:`3600`},{key:`length`,label:`Characteristic length`,unit:`m`,initial:`0.02`}],formula:`Fo = αt/L²`,outputLabel:`Fourier number`,outputUnit:``,calculate:({diffusivity:e,time:t,length:n})=>e*t/n**2,interpret:e=>e>.2?`Substantial transient thermal penetration`:`Early transient response`},
  "grashofNumber": {id:`grashofNumber`,code:`HT–14`,category:`Heat Transfer`,mark:`♨`,title:`Grashof Number`,fields:[{key:`gravity`,label:`Gravity`,unit:`m/s²`,initial:`9.80665`},{key:`expansion`,label:`Volumetric expansion β`,unit:`1/K`,initial:`0.00335`},{key:`temperatureDifference`,label:`Temperature difference`,unit:`K`,initial:`40`},{key:`length`,label:`Characteristic length`,unit:`m`,initial:`0.5`},{key:`kinematicViscosity`,label:`Kinematic viscosity`,unit:`m²/s`,initial:`1.6e-5`}],formula:`Gr = gβΔTL³/ν²`,outputLabel:`Grashof number`,outputUnit:``,calculate:({gravity:e,expansion:t,temperatureDifference:n,length:r,kinematicViscosity:i})=>e*t*n*r**3/i**2,interpret:e=>e<1e9?`Buoyancy-driven flow is commonly laminar`:`Transition/turbulent natural convection is likely`},
  "naturalConvectionCorrelation": {id:`naturalConvectionCorrelation`,code:`HT–20`,category:`Heat Transfer`,mark:`♨`,title:`Natural Convection Correlation`,fields:[{key:`rayleigh`,label:`Rayleigh number`,unit:`—`,initial:`1.0e7`},{key:`conductivity`,label:`Fluid conductivity`,unit:`W/m·K`,initial:`0.026`},{key:`length`,label:`Vertical length`,unit:`m`,initial:`0.5`}],formula:`Nu = 0.59Ra¹⁄⁴; h = Nuk/L`,outputLabel:`Heat-transfer coefficient`,outputUnit:`W/m²·K`,calculate:({rayleigh:e,conductivity:t,length:n})=>.59*e**.25*t/n,interpret:()=>`Laminar vertical-plate correlation; use within its stated range`},
  "nusseltNumber": {id:`nusseltNumber`,code:`HT–17`,category:`Heat Transfer`,mark:`♨`,title:`Nusselt Number`,fields:[{key:`coefficient`,label:`Heat-transfer h`,unit:`W/m²·K`,initial:`120`},{key:`length`,label:`Characteristic length`,unit:`m`,initial:`0.05`},{key:`conductivity`,label:`Conductivity`,unit:`W/m·K`,initial:`0.60`}],formula:`Nu = hL/k`,outputLabel:`Nusselt number`,outputUnit:``,calculate:({coefficient:e,length:t,conductivity:n})=>e*t/n,interpret:e=>e>1?`Convection enhances heat transfer above pure conduction`:`Conduction-scale transport`},
  "planeWallConduction": {id:`planeWallConduction`,code:`HT–01`,category:`Heat Transfer`,mark:`▥`,title:`Plane-Wall Conduction`,fields:[{key:`conductivity`,label:`Conductivity`,unit:`W/m·K`,initial:`16`},{key:`area`,label:`Wall area`,unit:`m²`,initial:`12`},{key:`hotTemperature`,label:`Hot surface`,unit:`°C`,initial:`180`},{key:`coldTemperature`,label:`Cold surface`,unit:`°C`,initial:`40`},{key:`thickness`,label:`Thickness`,unit:`m`,initial:`0.08`}],formula:`Q̇ = kA(T₁−T₂)/L`,outputLabel:`Conduction heat rate`,outputUnit:`W`,calculate:({conductivity:e,area:t,hotTemperature:n,coldTemperature:r,thickness:i})=>e*t*(n-r)/i,interpret:e=>`${(e/1e3).toFixed(2)} kW from hot to cold surface`},
  "prandtlNumber": {id:`prandtlNumber`,code:`HT–18`,category:`Heat Transfer`,mark:`♨`,title:`Prandtl Number`,fields:[{key:`heatCapacity`,label:`Heat capacity`,unit:`J/kg·K`,initial:`4180`},{key:`viscosity`,label:`Viscosity`,unit:`Pa·s`,initial:`0.001`},{key:`conductivity`,label:`Conductivity`,unit:`W/m·K`,initial:`0.60`}],formula:`Pr = cₚμ/k`,outputLabel:`Prandtl number`,outputUnit:``,calculate:({heatCapacity:e,viscosity:t,conductivity:n})=>e*t/n,interpret:e=>e<1?`Thermal diffusion dominates momentum diffusion`:`Momentum diffusion dominates thermal diffusion`},
  "rayleighNumber": {id:`rayleighNumber`,code:`HT–15`,category:`Heat Transfer`,mark:`♨`,title:`Rayleigh Number`,fields:[{key:`grashof`,label:`Grashof number`,unit:`—`,initial:`6.4e8`},{key:`prandtl`,label:`Prandtl number`,unit:`—`,initial:`0.71`}],formula:`Ra = Gr·Pr`,outputLabel:`Rayleigh number`,outputUnit:``,calculate:({grashof:e,prandtl:t})=>e*t,interpret:e=>e<1e9?`Typical laminar natural-convection range`:`Transition/turbulent natural-convection range`},
  "shellAndTubeHeatExchanger": {id:`shellAndTubeHeatExchanger`,code:`HT–28`,category:`Heat Transfer`,mark:`♨`,title:`Shell-and-Tube Heat Exchanger`,fields:[{key:`coefficient`,label:`Overall U`,unit:`W/m²·K`,initial:`650`},{key:`area`,label:`Transfer area`,unit:`m²`,initial:`45`},{key:`lmtd`,label:`Counter-current LMTD`,unit:`K`,initial:`42`},{key:`correction`,label:`LMTD correction factor`,unit:`fraction`,initial:`0.88`}],formula:`Q̇ = UA·F·LMTD`,outputLabel:`Corrected heat duty`,outputUnit:`W`,calculate:({coefficient:e,area:t,lmtd:n,correction:r})=>e*t*r*n,interpret:e=>`${(e/1e3).toFixed(2)} kW corrected exchanger duty`},
  "sphericalWallConduction": {id:`sphericalWallConduction`,code:`HT–05`,category:`Heat Transfer`,mark:`♨`,title:`Spherical Wall Conduction`,fields:[{key:`conductivity`,label:`Thermal conductivity`,unit:`W/m·K`,initial:`15`},{key:`innerRadius`,label:`Inner radius`,unit:`m`,initial:`0.10`},{key:`outerRadius`,label:`Outer radius`,unit:`m`,initial:`0.14`},{key:`innerTemperature`,label:`Inner temperature`,unit:`°C`,initial:`180`},{key:`outerTemperature`,label:`Outer temperature`,unit:`°C`,initial:`40`}],formula:`Q̇ = 4πk(Tᵢ−Tₒ)/(1/rᵢ−1/rₒ)`,outputLabel:`Conduction heat rate`,outputUnit:`W`,calculate:({conductivity:e,innerRadius:t,outerRadius:n,innerTemperature:r,outerTemperature:i})=>4*Math.PI*e*(r-i)/(1/t-1/n),interpret:e=>`${(e/1e3).toFixed(2)} kW through the spherical shell`},
  "thermalRadiation": {id:`thermalRadiation`,code:`HT–24`,category:`Heat Transfer`,mark:`σ`,title:`Thermal Radiation`,fields:[{key:`emissivity`,label:`Surface emissivity`,unit:`fraction`,initial:`0.85`},{key:`area`,label:`Surface area`,unit:`m²`,initial:`1.5`},{key:`surfaceTemperature`,label:`Surface temperature`,unit:`K`,initial:`650`},{key:`surroundingsTemperature`,label:`Surroundings temperature`,unit:`K`,initial:`300`}],formula:`Q̇ = εσA(Tₛ⁴ − Tₛᵤᵣ⁴)`,outputLabel:`Net radiative heat transfer`,outputUnit:`W`,calculate:({emissivity:e,area:t,surfaceTemperature:n,surroundingsTemperature:r})=>e*5.670374419e-8*t*(n**4-r**4),interpret:()=>`Diffuse gray surface exchanging with large surroundings`},
  "thermalResistanceNetwork": {id:`thermalResistanceNetwork`,code:`HT–26`,category:`Heat Transfer`,mark:`♨`,title:`Thermal Resistance Network`,fields:[{key:`temperatureDifference`,label:`Overall temperature difference`,unit:`K`,initial:`80`},{key:`seriesResistance`,label:`Series resistance`,unit:`K/W`,initial:`0.10`},{key:`parallelResistanceOne`,label:`Parallel branch 1`,unit:`K/W`,initial:`0.30`},{key:`parallelResistanceTwo`,label:`Parallel branch 2`,unit:`K/W`,initial:`0.60`}],formula:`Req = Rs + (1/Rp1 + 1/Rp2)⁻¹; Q = ΔT/Req`,outputLabel:`Network heat-transfer rate`,outputUnit:`W`,calculate:({temperatureDifference:e,seriesResistance:t,parallelResistanceOne:n,parallelResistanceTwo:r})=>e/(t+1/(1/n+1/r)),interpret:()=>`Equivalent resistance combines one series element and two parallel branches`},
  "lumpedCapacitance": {id:`lumpedCapacitance`,code:`HT–24`,category:`Heat Transfer`,mark:`♨`,title:`Transient Lumped Capacitance`,fields:[{key:`initialTemperature`,label:`Initial body temperature`,unit:`°C`,initial:`180`},{key:`ambientTemperature`,label:`Ambient temperature`,unit:`°C`,initial:`25`},{key:`coefficient`,label:`Convection coefficient`,unit:`W/m²·K`,initial:`35`},{key:`area`,label:`Surface area`,unit:`m²`,initial:`0.12`},{key:`time`,label:`Elapsed time`,unit:`s`,initial:`600`},{key:`mass`,label:`Body mass`,unit:`kg`,initial:`4.5`},{key:`heatCapacity`,label:`Heat capacity`,unit:`J/kg·K`,initial:`480`}],formula:`T(t)=T∞+(Tᵢ−T∞)exp[−hAt/(mcₚ)]`,outputLabel:`Body temperature`,outputUnit:`°C`,calculate:({initialTemperature:e,ambientTemperature:t,coefficient:n,area:r,time:i,mass:a,heatCapacity:o})=>t+(e-t)*Math.exp(-n*r*i/(a*o)),interpret:()=>`Valid when internal temperature gradients are negligible (typically Bi < 0.1)`},
} satisfies Record<
  PhaseTwelveCalculatorId,
  PhaseTwelveDefinition
>
