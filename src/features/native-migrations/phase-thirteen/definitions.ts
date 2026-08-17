export type PhaseThirteenCalculatorId =
  | "dragForce"
  | "minorLosses"
  | "orificeMeter"
  | "particleSettling"
  | "reynoldsNumber"
  | "tankDrainTime"
  | "uTubeManometer"
  | "venturiMeter"
  | "reactiveMaterialBalance"
  | "recyclePurgeInertBalance"
  | "solidsWashingBalance"
  | "soluteDilutionCalculator"
  | "streamSplitterBalance"
  | "twoStreamMixerBalance"
  | "adaptiveSimpsonIntegration"
  | "odeSolver"
  | "gaussLegendreQuadrature"
  | "goldenSectionOptimization"
  | "linearSystems"
  | "numericalDifferentiation"
  | "numericalIntegration"
  | "numericalInterpolation"
  | "rootFinding"
  | "rombergIntegration"
  | "firstOrderPlusDeadTimeProcess"
  | "firstOrderProcessResponse"
  | "imcControllerTuning"
  | "pidController"
  | "secondOrderProcessResponse"
  | "zieglerNicholsReactionCurveTuning"
  | "arrheniusRateConstant"
  | "constantVolumeStoichiometry"
  | "conversionYieldSelectivity"
  | "cstrsInSeries"
  | "pfrSections"
  | "reactionRateCalculator"
  | "reactorComparison"
  | "reactorDesign"
  | "spaceTimeSpaceVelocity"
  | "binaryIsothermalFlash"
  | "binaryMinimumReflux"
  | "binaryRelativeVolatilityVLE"
  | "cycloneCutDiameter"
  | "fenskeMinimumStages"
  | "absorptionMinimumSolventRate"
  | "murphreeTrayEfficiency"
  | "packedColumnHTUNTU"
  | "psychrometricAirEnthalpy"

export interface PhaseThirteenField {
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}

export interface PhaseThirteenDefinition {
  id: PhaseThirteenCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseThirteenField[]
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

export const PHASE_THIRTEEN_IDS = [
  "dragForce",
  "minorLosses",
  "orificeMeter",
  "particleSettling",
  "reynoldsNumber",
  "tankDrainTime",
  "uTubeManometer",
  "venturiMeter",
  "reactiveMaterialBalance",
  "recyclePurgeInertBalance",
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
] as const satisfies readonly PhaseThirteenCalculatorId[]

export const PHASE_THIRTEEN_DEFINITIONS = {
  "dragForce": {id:`dragForce`,code:`FM–05`,category:`Fluid Mechanics`,mark:`F`,title:`Drag Force`,fields:[{key:`coefficient`,label:`Drag coefficient`,unit:`—`,initial:`0.47`},{key:`density`,label:`Fluid density`,unit:`kg/m³`,initial:`1.225`},{key:`velocity`,label:`Relative velocity`,unit:`m/s`,initial:`20`},{key:`area`,label:`Projected area`,unit:`m²`,initial:`0.50`}],formula:`Fᴅ = ½ Cᴅρv²A`,outputLabel:`Drag force`,outputUnit:`N`,calculate:({coefficient:e,density:t,velocity:n,area:r})=>.5*e*t*n**2*r,interpret:()=>`Steady relative-flow screening result`},
  "minorLosses": {id:`minorLosses`,code:`FM–08`,category:`Fluid Mechanics`,mark:`K`,title:`Minor Losses`,fields:[{key:`lossCoefficient`,label:`Total loss coefficient ΣK`,unit:`—`,initial:`3.2`},{key:`velocity`,label:`Mean velocity`,unit:`m/s`,initial:`2.4`},{key:`gravity`,label:`Gravity`,unit:`m/s²`,initial:`9.80665`}],formula:`hₘ = ΣK · v²/(2g)`,outputLabel:`Minor-loss head`,outputUnit:`m`,calculate:({lossCoefficient:e,velocity:t,gravity:n})=>e*t**2/(2*n),interpret:()=>`Head loss caused by fittings, entrances, exits, and local geometry changes`},
  "orificeMeter": {id:`orificeMeter`,code:`FM–08`,category:`Fluid Mechanics`,mark:`◉`,title:`Orifice Meter`,fields:[{key:`coefficient`,label:`Discharge coeff.`,unit:`—`,initial:`0.61`},{key:`diameter`,label:`Orifice diameter`,unit:`m`,initial:`0.05`},{key:`pressureDrop`,label:`Pressure drop`,unit:`Pa`,initial:`12000`},{key:`density`,label:`Fluid density`,unit:`kg/m³`,initial:`998.2`}],formula:`Q = C_d A √(2ΔP/ρ)`,outputLabel:`Volumetric flow rate`,outputUnit:`m³/s`,calculate:({coefficient:e,diameter:t,pressureDrop:n,density:r})=>e*Math.PI*t**2/4*Math.sqrt(2*n/r),interpret:e=>`${(e*1e3).toFixed(2)} L/s through the orifice`},
  "particleSettling": {id:`particleSettling`,code:`FM–10`,category:`Fluid Mechanics`,mark:`↓`,title:`Particle Settling — Stokes Law`,fields:[{key:`particleDensity`,label:`Particle density`,unit:`kg/m³`,initial:`2650`},{key:`fluidDensity`,label:`Fluid density`,unit:`kg/m³`,initial:`998.2`},{key:`diameter`,label:`Particle diameter`,unit:`m`,initial:`0.0001`},{key:`viscosity`,label:`Dynamic viscosity`,unit:`Pa·s`,initial:`0.001`}],formula:`vₜ = g(ρₚ − ρ_f)d²/(18μ)`,outputLabel:`Terminal settling velocity`,outputUnit:`m/s`,calculate:({particleDensity:e,fluidDensity:t,diameter:n,viscosity:r})=>9.80665*(e-t)*n**2/(18*r),interpret:e=>`Stokes-regime estimate · ${(e*1e3).toFixed(3)} mm/s`},
  "reynoldsNumber": {id:`reynoldsNumber`,code:`FM–01`,category:`Fluid Mechanics`,mark:`≈`,title:`Reynolds Number`,fields:[{key:`density`,label:`Density`,unit:`kg/m³`,initial:`998.2`},{key:`velocity`,label:`Velocity`,unit:`m/s`,initial:`2.50`},{key:`diameter`,label:`Diameter`,unit:`m`,initial:`0.050`},{key:`viscosity`,label:`Viscosity`,unit:`Pa·s`,initial:`0.00089`}],formula:`Re = ρvD / μ`,outputLabel:`Reynolds number`,outputUnit:``,calculate:({density:e,velocity:t,diameter:n,viscosity:r})=>e*t*n/r,interpret:e=>e<2300?`Laminar flow`:e<4e3?`Transitional flow`:`Turbulent flow`},
  "tankDrainTime": {id:`tankDrainTime`,code:`FM–14`,category:`Fluid Mechanics`,mark:`⌇`,title:`Tank Drain Time`,fields:[{key:`tankArea`,label:`Tank area`,unit:`m²`,initial:`2.0`},{key:`orificeArea`,label:`Outlet area`,unit:`m²`,initial:`0.002`},{key:`coefficient`,label:`Discharge coeff.`,unit:`—`,initial:`0.62`},{key:`initialHead`,label:`Initial head`,unit:`m`,initial:`3.0`},{key:`finalHead`,label:`Final head`,unit:`m`,initial:`0.2`}],formula:`t = 2A(√h₁ − √h₂)/(C_d a√(2g))`,outputLabel:`Drain time`,outputUnit:`s`,calculate:({tankArea:e,orificeArea:t,coefficient:n,initialHead:r,finalHead:i})=>2*e*(Math.sqrt(r)-Math.sqrt(i))/(n*t*Math.sqrt(2*9.80665)),interpret:e=>`${(e/60).toFixed(2)} minutes to the final liquid head`},
  "uTubeManometer": {id:`uTubeManometer`,code:`FM–16`,category:`Fluid Mechanics`,mark:`≈`,title:`U-Tube Manometer`,fields:[{key:`manometerDensity`,label:`Manometer-fluid density`,unit:`kg/m³`,initial:`13600`},{key:`processDensity`,label:`Process-fluid density`,unit:`kg/m³`,initial:`1000`},{key:`heightDifference`,label:`Level difference`,unit:`m`,initial:`0.12`}],formula:`ΔP = (ρm − ρf)gΔh`,outputLabel:`Pressure difference`,outputUnit:`Pa`,calculate:({manometerDensity:e,processDensity:t,heightDifference:n})=>(e-t)*9.80665*n,interpret:e=>`${(e/1e3).toFixed(3)} kPa differential pressure`},
  "venturiMeter": {id:`venturiMeter`,code:`FM–15`,category:`Fluid Mechanics`,mark:`⋈`,title:`Venturi Meter`,fields:[{key:`coefficient`,label:`Discharge coeff.`,unit:`—`,initial:`0.98`},{key:`upstreamDiameter`,label:`Upstream diameter`,unit:`m`,initial:`0.10`},{key:`throatDiameter`,label:`Throat diameter`,unit:`m`,initial:`0.05`},{key:`pressureDrop`,label:`Pressure drop`,unit:`Pa`,initial:`15000`},{key:`density`,label:`Fluid density`,unit:`kg/m³`,initial:`998.2`}],formula:`Q = C_d A₂ √[2ΔP / ρ(1 − β⁴)]`,outputLabel:`Volumetric flow rate`,outputUnit:`m³/s`,calculate:({coefficient:e,upstreamDiameter:t,throatDiameter:n,pressureDrop:r,density:i})=>{let a=n/t;return e*Math.PI*n**2/4*Math.sqrt(2*r/(i*(1-a**4)))},interpret:e=>`${(e*1e3).toFixed(2)} L/s through the throat`},
  "reactiveMaterialBalance": {id:`reactiveMaterialBalance`,code:`MEB–24`,category:`Material & Energy Balances`,mark:`⇄`,title:`Reactive Material Balance`,fields:[{key:`reactantFeed`,label:`Reactant A feed`,unit:`kmol/h`,initial:`100`},{key:`conversion`,label:`Conversion of A`,unit:`fraction`,initial:`0.75`},{key:`productCoefficient`,label:`Product/A stoichiometric ratio`,unit:`mol/mol`,initial:`1.5`}],formula:`FP = FA0 X(νP/νA)`,outputLabel:`Product formation`,outputUnit:`kmol/h`,calculate:({reactantFeed:e,conversion:t,productCoefficient:n})=>e*t*n,interpret:()=>`Single-reaction extent on the limiting-reactant basis`},
  "recyclePurgeInertBalance": {id:`recyclePurgeInertBalance`,code:`MEB–13`,category:`Material & Energy Balances`,mark:`⇄`,title:`Recycle–Purge Inert Balance`,fields:[{key:`freshInert`,label:`Fresh inert feed`,unit:`kmol/h`,initial:`2.5`},{key:`recycleInertFraction`,label:`Recycle inert fraction`,unit:`fraction`,initial:`0.20`}],formula:`P = I_fresh / yI,purge`,outputLabel:`Required purge flow`,outputUnit:`kmol/h`,calculate:({freshInert:e,recycleInertFraction:t})=>e/t,interpret:()=>`Steady-state purge needed to prevent inert accumulation`},
  "solidsWashingBalance": {id:`solidsWashingBalance`,code:`MEB–25`,category:`Material & Energy Balances`,mark:`⇄`,title:`Solids Washing Balance`,fields:[{key:`entrainedSolution`,label:`Solution retained with solids`,unit:`kg/h`,initial:`250`},{key:`soluteFraction`,label:`Solute fraction in retained liquid`,unit:`fraction`,initial:`0.12`},{key:`washingEfficiency`,label:`Washing efficiency`,unit:`fraction`,initial:`0.85`}],formula:`mremoved = L x ηwash`,outputLabel:`Solute removed`,outputUnit:`kg/h`,calculate:({entrainedSolution:e,soluteFraction:t,washingEfficiency:n})=>e*t*n,interpret:()=>`Screening estimate based on displacement-washing efficiency`},
  "soluteDilutionCalculator": {id:`soluteDilutionCalculator`,code:`MEB–14`,category:`Material & Energy Balances`,mark:`⇄`,title:`Solute Dilution Calculator`,fields:[{key:`initialConcentration`,label:`Initial concentration`,unit:`mol/L`,initial:`2.0`},{key:`initialVolume`,label:`Initial volume`,unit:`L`,initial:`5`},{key:`finalConcentration`,label:`Final concentration`,unit:`mol/L`,initial:`0.50`}],formula:`C₁V₁ = C₂V₂`,outputLabel:`Final solution volume`,outputUnit:`L`,calculate:({initialConcentration:e,initialVolume:t,finalConcentration:n})=>e*t/n,interpret:()=>`Solute amount is conserved during dilution`},
  "streamSplitterBalance": {id:`streamSplitterBalance`,code:`MEB–15`,category:`Material & Energy Balances`,mark:`⇄`,title:`Stream Splitter Balance`,fields:[{key:`feedFlow`,label:`Feed flow`,unit:`kg/h`,initial:`1000`},{key:`splitFraction`,label:`Outlet-1 fraction`,unit:`fraction`,initial:`0.35`}],formula:`F₁ = sF; F₂ = (1−s)F`,outputLabel:`Outlet-1 flow`,outputUnit:`kg/h`,calculate:({feedFlow:e,splitFraction:t})=>e*t,interpret:_e=>`Both outlet streams retain the feed composition`},
  "twoStreamMixerBalance": {id:`twoStreamMixerBalance`,code:`MEB–16`,category:`Material & Energy Balances`,mark:`⇄`,title:`Two-Stream Mixer Balance`,fields:[{key:`flowOne`,label:`Stream 1 flow`,unit:`kg/h`,initial:`400`},{key:`fractionOne`,label:`Stream 1 solute`,unit:`fraction`,initial:`0.10`},{key:`flowTwo`,label:`Stream 2 flow`,unit:`kg/h`,initial:`600`},{key:`fractionTwo`,label:`Stream 2 solute`,unit:`fraction`,initial:`0.30`}],formula:`xM = (F₁x₁+F₂x₂)/(F₁+F₂)`,outputLabel:`Mixed solute fraction`,outputUnit:`fraction`,calculate:({flowOne:e,fractionOne:t,flowTwo:n,fractionTwo:r})=>(e*t+n*r)/(e+n),interpret:()=>`Perfect steady-state mixing with no reaction`},
  "adaptiveSimpsonIntegration": {id:`adaptiveSimpsonIntegration`,code:`NM–02`,category:`Numerical Methods`,mark:`ƒ`,title:`Adaptive Simpson Integration`,fields:[{key:`coarseSimpson`,label:`Coarse Simpson estimate`,unit:`integral unit`,initial:`1.71828`},{key:`leftHalf`,label:`Left-half Simpson estimate`,unit:`integral unit`,initial:`0.64872`},{key:`rightHalf`,label:`Right-half Simpson estimate`,unit:`integral unit`,initial:`1.06957`}],formula:`I ≈ Sleft + Sright + (Sleft + Sright − Scoarse)/15`,outputLabel:`Richardson-corrected integral`,outputUnit:``,calculate:({coarseSimpson:e,leftHalf:t,rightHalf:n})=>t+n+(t+n-e)/15,interpret:()=>`Adaptive Simpson correction from one coarse and two half-interval estimates`},
  "odeSolver": {id:`odeSolver`,code:`NM–11`,category:`Numerical Methods`,mark:`y₁`,title:`First-Order ODE Solver`,fields:[{key:`initialValue`,label:`Initial value y₀`,unit:`—`,initial:`1`},{key:`rateConstant`,label:`First-order constant k`,unit:`1/s`,initial:`0.25`},{key:`step`,label:`Time step h`,unit:`s`,initial:`0.5`}],formula:`y₁ = y₀ + h(−ky₀)`,outputLabel:`Euler estimate after one step`,outputUnit:``,calculate:({initialValue:e,rateConstant:t,step:n})=>e+n*(-t*e),interpret:()=>`Explicit Euler step for dy/dt = −ky; reduce h to improve accuracy`},
  "gaussLegendreQuadrature": {id:`gaussLegendreQuadrature`,code:`NM–18`,category:`Numerical Methods`,mark:`∫`,title:`Gauss–Legendre Quadrature`,fields:[{key:`lower`,label:`Lower bound`,unit:`x`,initial:`0`},{key:`upper`,label:`Upper bound`,unit:`x`,initial:`2`},{key:`fMinus`,label:`f at lower Gauss node`,unit:`y`,initial:`0.1786`},{key:`fPlus`,label:`f at upper Gauss node`,unit:`y`,initial:`2.4880`}],formula:`I ≈ (b−a)/2 [f(x₋)+f(x₊)]`,outputLabel:`Two-point quadrature`,outputUnit:`x·y`,calculate:({lower:e,upper:t,fMinus:n,fPlus:r})=>(t-e)/2*(n+r),interpret:()=>`Two-point Gauss–Legendre rule on the specified interval`},
  "goldenSectionOptimization": {id:`goldenSectionOptimization`,code:`NM–14`,category:`Numerical Methods`,mark:`φ`,title:`Golden-Section Optimization`,fields:[{key:`lower`,label:`Lower bound`,unit:`x`,initial:`0`},{key:`upper`,label:`Upper bound`,unit:`x`,initial:`10`},{key:`iterations`,label:`Iterations`,unit:`—`,initial:`12`}],formula:`Lₙ = (1/φ)ⁿ L₀`,outputLabel:`Remaining bracket width`,outputUnit:`x`,calculate:({lower:e,upper:t,iterations:n})=>(t-e)*((Math.sqrt(5)-1)/2)**Math.floor(n),interpret:()=>`Guaranteed interval contraction after the requested iterations`},
  "linearSystems": {id:`linearSystems`,code:`NM–18`,category:`Numerical Methods`,mark:`x₁`,title:`Linear Systems Solver`,fields:[{key:`a11`,label:`a₁₁`,unit:`—`,initial:`4`},{key:`a12`,label:`a₁₂`,unit:`—`,initial:`1`},{key:`b1`,label:`b₁`,unit:`—`,initial:`9`},{key:`a21`,label:`a₂₁`,unit:`—`,initial:`2`},{key:`a22`,label:`a₂₂`,unit:`—`,initial:`3`},{key:`b2`,label:`b₂`,unit:`—`,initial:`13`}],formula:`x₁ = (b₁a₂₂ − a₁₂b₂)/(a₁₁a₂₂ − a₁₂a₂₁)`,outputLabel:`First solution component x₁`,outputUnit:``,calculate:({a11:e,a12:t,b1:n,a21:r,a22:i,b2:a})=>(n*i-t*a)/(e*i-t*r),interpret:()=>`Direct 2×2 solution; the coefficient determinant must be nonzero`},
  "numericalDifferentiation": {id:`numericalDifferentiation`,code:`NM–24`,category:`Numerical Methods`,mark:`d`,title:`Numerical Differentiation`,fields:[{key:`left`,label:`f(x − h)`,unit:`y-unit`,initial:`4.41`},{key:`right`,label:`f(x + h)`,unit:`y-unit`,initial:`5.29`},{key:`step`,label:`Step size h`,unit:`x-unit`,initial:`0.10`}],formula:`f′(x) ≈ [f(x+h) − f(x−h)] / 2h`,outputLabel:`Central-difference derivative`,outputUnit:`y/x`,calculate:({left:e,right:t,step:n})=>(t-e)/(2*n),interpret:()=>`Second-order central finite-difference estimate`},
  "numericalIntegration": {id:`numericalIntegration`,code:`NM–01`,category:`Numerical Methods`,mark:`∫`,title:`Simpson’s Rule Integration`,fields:[{key:`spacing`,label:`Point spacing h`,unit:`x-unit`,initial:`0.5`},{key:`first`,label:`f(x₀)`,unit:`y-unit`,initial:`1`},{key:`middle`,label:`f(x₁)`,unit:`y-unit`,initial:`2.25`},{key:`last`,label:`f(x₂)`,unit:`y-unit`,initial:`4`}],formula:`I ≈ h/3 [f₀ + 4f₁ + f₂]`,outputLabel:`Integrated area`,outputUnit:`x·y`,calculate:({spacing:e,first:t,middle:n,last:r})=>e/3*(t+4*n+r),interpret:()=>`Composite basis: one Simpson 1/3 panel`},
  "numericalInterpolation": {id:`numericalInterpolation`,code:`NM–24`,category:`Numerical Methods`,mark:`↗`,title:`Linear Interpolation`,fields:[{key:`x0`,label:`Lower x`,unit:`x`,initial:`10`},{key:`y0`,label:`Lower y`,unit:`y`,initial:`42`},{key:`x1`,label:`Upper x`,unit:`x`,initial:`20`},{key:`y1`,label:`Upper y`,unit:`y`,initial:`68`},{key:`x`,label:`Target x`,unit:`x`,initial:`14`}],formula:`y = y₀ + (x−x₀)(y₁−y₀)/(x₁−x₀)`,outputLabel:`Interpolated value`,outputUnit:`y`,calculate:({x0:e,y0:t,x1:n,y1:r,x:i})=>t+(i-e)*(r-t)/(n-e),interpret:()=>`Straight-line interpolation between the supplied tabulated points`},
  "rootFinding": {id:`rootFinding`,code:`NM–28`,category:`Numerical Methods`,mark:`x`,title:`Polynomial Root Finding`,fields:[{key:`a`,label:`Quadratic coefficient a`,unit:`—`,initial:`1`},{key:`b`,label:`Linear coefficient b`,unit:`—`,initial:`5`},{key:`c`,label:`Constant coefficient c`,unit:`—`,initial:`6`}],formula:`x₁ = (−b + √(b² − 4ac)) / 2a`,outputLabel:`Larger real root`,outputUnit:``,calculate:({a:e,b:t,c:n})=>(-t+Math.sqrt(t**2-4*e*n))/(2*e),interpret:()=>`Quadratic formula · the companion root uses the negative square-root branch`},
  "rombergIntegration": {id:`rombergIntegration`,code:`NM–31`,category:`Numerical Methods`,mark:`ƒ`,title:`Romberg Integration`,fields:[{key:`coarseTrapezoid`,label:`Coarse trapezoid T(h)`,unit:`integral unit`,initial:`1.85914`},{key:`fineTrapezoid`,label:`Fine trapezoid T(h/2)`,unit:`integral unit`,initial:`1.75393`}],formula:`R₂,₂ = T(h/2) + [T(h/2) − T(h)]/3`,outputLabel:`Romberg extrapolation`,outputUnit:``,calculate:({coarseTrapezoid:e,fineTrapezoid:t})=>t+(t-e)/3,interpret:()=>`First Richardson extrapolation removes the leading trapezoidal error term`},
  "firstOrderPlusDeadTimeProcess": {id:`firstOrderPlusDeadTimeProcess`,code:`PC–12`,category:`Process Control`,mark:`θ`,title:`First-Order Plus Dead Time`,fields:[{key:`gain`,label:`Process gain K`,unit:`—`,initial:`2.0`},{key:`step`,label:`Input step Δu`,unit:`—`,initial:`1.5`},{key:`time`,label:`Elapsed time`,unit:`s`,initial:`30`},{key:`deadTime`,label:`Dead time θ`,unit:`s`,initial:`5`},{key:`timeConstant`,label:`Time constant τ`,unit:`s`,initial:`12`}],formula:`Δy = KΔu[1 − exp(−(t−θ)/τ)], t > θ`,outputLabel:`FOPDT process response`,outputUnit:``,calculate:({gain:e,step:t,time:n,deadTime:r,timeConstant:i})=>n<=r?0:e*t*(1-Math.exp(-(n-r)/i)),interpret:()=>`Response measured from the initial steady state`},
  "firstOrderProcessResponse": {id:`firstOrderProcessResponse`,code:`PC–11`,category:`Process Control`,mark:`τ`,title:`First-Order Process Response`,fields:[{key:`gain`,label:`Process gain K`,unit:`—`,initial:`2.5`},{key:`step`,label:`Input step Δu`,unit:`—`,initial:`4`},{key:`time`,label:`Elapsed time`,unit:`s`,initial:`12`},{key:`timeConstant`,label:`Time constant τ`,unit:`s`,initial:`5`}],formula:`Δy(t) = KΔu(1 − e⁻ᵗ⁄τ)`,outputLabel:`Process response`,outputUnit:``,calculate:({gain:e,step:t,time:n,timeConstant:r})=>e*t*(1-Math.exp(-n/r)),interpret:()=>`Step response measured from the initial steady state`},
  "imcControllerTuning": {id:`imcControllerTuning`,code:`PC–16`,category:`Process Control`,mark:`λ`,title:`IMC Controller Tuning`,fields:[{key:`processGain`,label:`Process gain`,unit:`—`,initial:`1.8`},{key:`timeConstant`,label:`Time constant`,unit:`s`,initial:`45`},{key:`deadTime`,label:`Dead time`,unit:`s`,initial:`8`},{key:`filterTime`,label:`IMC filter λ`,unit:`s`,initial:`12`}],formula:`Kᶜ = τ / [K(λ + θ)]`,outputLabel:`Recommended controller gain`,outputUnit:``,calculate:({processGain:e,timeConstant:t,deadTime:n,filterTime:r})=>t/(e*(r+n)),interpret:()=>`Conservative FOPDT IMC-PI gain basis`},
  "pidController": {id:`pidController`,code:`PC–25`,category:`Process Control`,mark:`PID`,title:`PID Controller`,fields:[{key:`gain`,label:`Controller Kc`,unit:`—`,initial:`2.0`},{key:`error`,label:`Current error`,unit:`—`,initial:`1.5`},{key:`integral`,label:`Error integral`,unit:`s`,initial:`4.0`},{key:`derivative`,label:`Error rate`,unit:`s⁻¹`,initial:`0.25`},{key:`integralTime`,label:`Integral time`,unit:`s`,initial:`5.0`},{key:`derivativeTime`,label:`Derivative time`,unit:`s`,initial:`0.8`}],formula:`u = Kc[e + (1/τI)∫e dt + τD de/dt]`,outputLabel:`Controller output`,outputUnit:``,calculate:({gain:e,error:t,integral:n,derivative:r,integralTime:i,derivativeTime:a})=>e*(t+n/i+a*r),interpret:()=>`Ideal parallel PID form · bias excluded`},
  "secondOrderProcessResponse": {id:`secondOrderProcessResponse`,code:`PC–31`,category:`Process Control`,mark:`ζ`,title:`Second-Order Process`,fields:[{key:`gain`,label:`Process gain`,unit:`—`,initial:`2`},{key:`step`,label:`Step magnitude`,unit:`—`,initial:`1`},{key:`damping`,label:`Damping ratio`,unit:`—`,initial:`0.45`}],formula:`Mₚ = KΔu · exp(−πζ/√(1−ζ²))`,outputLabel:`Peak overshoot`,outputUnit:``,calculate:({gain:e,step:t,damping:n})=>e*t*Math.exp(-Math.PI*n/Math.sqrt(1-n**2)),interpret:()=>`Underdamped unit-step response; reported above the final value`},
  "zieglerNicholsReactionCurveTuning": {id:`zieglerNicholsReactionCurveTuning`,code:`PC–39`,category:`Process Control`,mark:`Kᶜ`,title:`Ziegler–Nichols Reaction Curve`,fields:[{key:`processGain`,label:`Process gain K`,unit:`—`,initial:`1.8`},{key:`timeConstant`,label:`Time constant τ`,unit:`s`,initial:`40`},{key:`deadTime`,label:`Dead time θ`,unit:`s`,initial:`8`}],formula:`Kᶜ = 1.2τ/(Kθ), τᴵ = 2θ, τᴰ = 0.5θ`,outputLabel:`Z–N PID controller gain`,outputUnit:``,calculate:({processGain:e,timeConstant:t,deadTime:n})=>1.2*t/(e*n),interpret:()=>`Reaction-curve PID basis; validate robustness before deployment`},
  "arrheniusRateConstant": {id:`arrheniusRateConstant`,code:`RE–02`,category:`Reaction Engineering`,mark:`⚗`,title:`Arrhenius Rate Constant`,fields:[{key:`factor`,label:`Pre-exponential A`,unit:`s⁻¹`,initial:`2.50e10`},{key:`activation`,label:`Activation Eₐ`,unit:`J/mol`,initial:`75000`},{key:`temperature`,label:`Temperature`,unit:`K`,initial:`600`}],formula:`k = A exp(−Eₐ/RT)`,outputLabel:`Rate constant`,outputUnit:`s⁻¹`,calculate:({factor:e,activation:t,temperature:n})=>e*Math.exp(-t/(8.314462618*n)),interpret:()=>`Arrhenius model at the specified absolute temperature`},
  "constantVolumeStoichiometry": {id:`constantVolumeStoichiometry`,code:`RE–14`,category:`Reaction Engineering`,mark:`⚗`,title:`Constant-Volume Stoichiometry`,fields:[{key:`initialConcentration`,label:`Initial A concentration`,unit:`mol/L`,initial:`2.0`},{key:`conversion`,label:`Conversion of A`,unit:`fraction`,initial:`0.65`},{key:`productCoefficient`,label:`Product/A stoichiometric ratio`,unit:`—`,initial:`1.5`}],formula:`Cproduct = ν(CA₀X)`,outputLabel:`Product concentration`,outputUnit:`mol/L`,calculate:({initialConcentration:e,conversion:t,productCoefficient:n})=>n*e*t,interpret:()=>`Constant-volume, initially product-free stoichiometric basis`},
  "conversionYieldSelectivity": {id:`conversionYieldSelectivity`,code:`RE–10`,category:`Reaction Engineering`,mark:`X`,title:`Conversion, Yield & Selectivity`,fields:[{key:`reactantIn`,label:`Reactant feed`,unit:`mol/h`,initial:`100`},{key:`reactantOut`,label:`Reactant outlet`,unit:`mol/h`,initial:`25`},{key:`desiredProduct`,label:`Desired product`,unit:`mol/h`,initial:`60`}],formula:`Yield = nP / (nA,in − nA,out)`,outputLabel:`Desired-product yield`,outputUnit:`%`,calculate:({reactantIn:e,reactantOut:t,desiredProduct:n})=>n/(e-t)*100,interpret:()=>`Based on reactant consumed; conversion follows from the feed–outlet basis`},
  "cstrsInSeries": {id:`cstrsInSeries`,code:`RE–22`,category:`Reaction Engineering`,mark:`N`,title:`CSTRs in Series`,fields:[{key:`rateConstant`,label:`Rate constant k`,unit:`s⁻¹`,initial:`0.08`},{key:`residenceTime`,label:`Total residence time`,unit:`s`,initial:`30`},{key:`reactorCount`,label:`Equal CSTR count`,unit:`—`,initial:`3`}],formula:`X = 1 − [1 + kτ/N]^(−N)`,outputLabel:`Overall conversion`,outputUnit:`%`,calculate:({rateConstant:e,residenceTime:t,reactorCount:n})=>(1-(1+e*t/n)**-n)*100,interpret:()=>`Equal-volume CSTRs · first-order isothermal reaction`},
  "pfrSections": {id:`pfrSections`,code:`RE–42`,category:`Reaction Engineering`,mark:`∫`,title:`PFR Sections`,fields:[{key:`molarFlow`,label:`Inlet molar flow Fₐ₀`,unit:`mol/s`,initial:`2.5`},{key:`conversionOne`,label:`Section inlet conversion`,unit:`—`,initial:`0.20`},{key:`conversionTwo`,label:`Section outlet conversion`,unit:`—`,initial:`0.70`},{key:`averageRate`,label:`Average −rₐ`,unit:`mol/m³·s`,initial:`0.85`}],formula:`ΔV ≈ Fₐ₀(X₂ − X₁)/(−rₐ,avg)`,outputLabel:`Required PFR section volume`,outputUnit:`m³`,calculate:({molarFlow:e,conversionOne:t,conversionTwo:n,averageRate:r})=>e*(n-t)/r,interpret:()=>`Single Levenspiel-plot section using an average reaction rate`},
  "reactionRateCalculator": {id:`reactionRateCalculator`,code:`RE–08`,category:`Reaction Engineering`,mark:`r`,title:`Reaction Rate Calculator`,fields:[{key:`constant`,label:`Rate constant`,unit:`varies`,initial:`0.025`},{key:`concentration`,label:`Concentration`,unit:`mol/L`,initial:`1.80`},{key:`order`,label:`Reaction order`,unit:`—`,initial:`2`}],formula:`−rₐ = k Cₐⁿ`,outputLabel:`Disappearance rate`,outputUnit:`mol/L·s`,calculate:({constant:e,concentration:t,order:n})=>e*t**n,interpret:()=>`Single-reactant power-law rate model`},
  "reactorComparison": {id:`reactorComparison`,code:`RE–48`,category:`Reaction Engineering`,mark:`V`,title:`Reactor Comparison`,fields:[{key:`molarFlow`,label:`Inlet molar flow Fₐ₀`,unit:`mol/s`,initial:`2.5`},{key:`conversion`,label:`Target conversion`,unit:`—`,initial:`0.75`},{key:`inletRate`,label:`Rate at inlet`,unit:`mol/m³·s`,initial:`1.20`},{key:`outletRate`,label:`Rate at outlet`,unit:`mol/m³·s`,initial:`0.45`}],formula:`Vᶜˢᵗʳ/Vᵖᶠʳ ≈ [X/−rₐ(X)] / [X·½(1/−rₐ₀ + 1/−rₐX)]`,outputLabel:`CSTR-to-PFR volume ratio`,outputUnit:``,calculate:({conversion:e,inletRate:t,outletRate:n})=>e/n/(e*.5*(1/t+1/n)),interpret:e=>e>1?`PFR is smaller on this rate profile`:`CSTR is smaller on this rate profile`},
  "reactorDesign": {id:`reactorDesign`,code:`RE–01`,category:`Reaction Engineering`,mark:`V`,title:`CSTR Design`,fields:[{key:`volumetricFlow`,label:`Feed flow`,unit:`m³/s`,initial:`0.010`},{key:`rateConstant`,label:`Rate constant k`,unit:`s⁻¹`,initial:`0.12`},{key:`conversion`,label:`Target conversion`,unit:`fraction`,initial:`0.80`}],formula:`V = v₀ X / [k(1 − X)]`,outputLabel:`Required CSTR volume`,outputUnit:`m³`,calculate:({volumetricFlow:e,rateConstant:t,conversion:n})=>e*n/(t*(1-n)),interpret:()=>`Constant-density, first-order, isothermal CSTR`},
  "spaceTimeSpaceVelocity": {id:`spaceTimeSpaceVelocity`,code:`RE–11`,category:`Reaction Engineering`,mark:`τ`,title:`Space Time & Space Velocity`,fields:[{key:`reactorVolume`,label:`Reactor volume`,unit:`m³`,initial:`4.5`},{key:`volumetricFlow`,label:`Feed flow rate`,unit:`m³/h`,initial:`1.8`}],formula:`τ = V/v₀; SV = v₀/V`,outputLabel:`Space time`,outputUnit:`h`,calculate:({reactorVolume:e,volumetricFlow:t})=>e/t,interpret:e=>`Space velocity ${(1/e).toFixed(4)} h⁻¹`},
  "binaryIsothermalFlash": {id:`binaryIsothermalFlash`,code:`SP–06`,category:`Separation Processes`,mark:`V/F`,title:`Binary Isothermal Flash`,fields:[{key:`feedFraction`,label:`Feed fraction of A`,unit:`—`,initial:`0.45`},{key:`liquidFraction`,label:`Liquid fraction of A`,unit:`—`,initial:`0.25`},{key:`vaporFraction`,label:`Vapor fraction of A`,unit:`—`,initial:`0.70`}],formula:`V/F = (zₐ − xₐ) / (yₐ − xₐ)`,outputLabel:`Vaporized feed fraction`,outputUnit:`%`,calculate:({feedFraction:e,liquidFraction:t,vaporFraction:n})=>(e-t)/(n-t)*100,interpret:()=>`Binary flash lever-rule result on a molar basis`},
  "binaryMinimumReflux": {id:`binaryMinimumReflux`,code:`SP–07`,category:`Separation Processes`,mark:`Rₘ`,title:`Binary Minimum Reflux`,fields:[{key:`feedFraction`,label:`Feed liquid fraction xF`,unit:`—`,initial:`0.40`},{key:`distillateFraction`,label:`Distillate fraction xD`,unit:`—`,initial:`0.92`},{key:`relativeVolatility`,label:`Relative volatility α`,unit:`—`,initial:`2.4`}],formula:`yF* = αxF/[1+(α−1)xF], Rₘᵢₙ = (xD−yF*)/(yF*−xF)`,outputLabel:`Minimum reflux ratio`,outputUnit:``,calculate:({feedFraction:e,distillateFraction:t,relativeVolatility:n})=>{let r=n*e/(1+(n-1)*e);return(t-r)/(r-e)},interpret:()=>`Saturated-liquid feed with constant relative volatility`},
  "binaryRelativeVolatilityVLE": {id:`binaryRelativeVolatilityVLE`,code:`SP–08`,category:`Separation Processes`,mark:`y*`,title:`Binary Relative-Volatility VLE`,fields:[{key:`liquidFraction`,label:`Liquid fraction xA`,unit:`—`,initial:`0.35`},{key:`relativeVolatility`,label:`Relative volatility α`,unit:`—`,initial:`2.5`}],formula:`yA* = αxA / [1 + (α−1)xA]`,outputLabel:`Equilibrium vapor fraction`,outputUnit:``,calculate:({liquidFraction:e,relativeVolatility:t})=>t*e/(1+(t-1)*e),interpret:()=>`Idealized binary VLE at constant relative volatility`},
  "cycloneCutDiameter": {id:`cycloneCutDiameter`,code:`SP–11`,category:`Separation Processes`,mark:`d`,title:`Cyclone Cut Diameter`,fields:[{key:`gasViscosity`,label:`Gas viscosity`,unit:`Pa·s`,initial:`0.000018`},{key:`inletWidth`,label:`Inlet width`,unit:`m`,initial:`0.20`},{key:`turns`,label:`Effective turns`,unit:`—`,initial:`5`},{key:`inletVelocity`,label:`Inlet velocity`,unit:`m/s`,initial:`18`},{key:`densityDifference`,label:`Particle–gas Δρ`,unit:`kg/m³`,initial:`1498`}],formula:`d₅₀ = √[9 μ b/(2π Ne vi Δρ)]`,outputLabel:`Cut diameter d₅₀`,outputUnit:`µm`,calculate:({gasViscosity:e,inletWidth:t,turns:n,inletVelocity:r,densityDifference:i})=>Math.sqrt(9*e*t/(2*Math.PI*n*r*i))*1e6,interpret:()=>`Approximate particle size collected at 50% efficiency`},
  "fenskeMinimumStages": {id:`fenskeMinimumStages`,code:`SP–15`,category:`Separation Processes`,mark:`N`,title:`Fenske Minimum Stages`,fields:[{key:`distillateLight`,label:`Light key in distillate`,unit:`fraction`,initial:`0.95`},{key:`bottomsLight`,label:`Light key in bottoms`,unit:`fraction`,initial:`0.05`},{key:`relativeVolatility`,label:`Relative volatility`,unit:`—`,initial:`2.4`}],formula:`Nmin = ln[(xD/(1−xD))((1−xB)/xB)] / ln α`,outputLabel:`Minimum equilibrium stages`,outputUnit:``,calculate:({distillateLight:e,bottomsLight:t,relativeVolatility:n})=>Math.log(e/(1-e)*((1-t)/t))/Math.log(n),interpret:e=>`${Math.ceil(e)} whole stages at total reflux`},
  "absorptionMinimumSolventRate": {id:`absorptionMinimumSolventRate`,code:`SP–16`,category:`Separation Processes`,mark:`L`,title:`Minimum Solvent Rate for Absorption`,fields:[{key:`gasFlow`,label:`Solute-free gas flow`,unit:`kmol/h`,initial:`100`},{key:`gasIn`,label:`Inlet gas ratio Y₁`,unit:`kmol/kmol`,initial:`0.08`},{key:`gasOut`,label:`Outlet gas ratio Y₂`,unit:`kmol/kmol`,initial:`0.01`},{key:`liquidIn`,label:`Lean solvent ratio X₂`,unit:`kmol/kmol`,initial:`0.001`},{key:`liquidOutStar`,label:`Pinch liquid ratio X₁*`,unit:`kmol/kmol`,initial:`0.12`}],formula:`Lmin = G (Y₁ − Y₂) / (X₁* − X₂)`,outputLabel:`Minimum solvent rate`,outputUnit:`kmol/h`,calculate:({gasFlow:e,gasIn:t,gasOut:n,liquidIn:r,liquidOutStar:i})=>e*(t-n)/(i-r),interpret:()=>`Pinch-condition minimum; operating solvent rate must be higher`},
  "murphreeTrayEfficiency": {id:`murphreeTrayEfficiency`,code:`SP–29`,category:`Separation Processes`,mark:`Eᴹ`,title:`Murphree Tray Efficiency`,fields:[{key:`vaporOut`,label:`Actual vapor-out fraction`,unit:`—`,initial:`0.58`},{key:`vaporIn`,label:`Vapor-in fraction`,unit:`—`,initial:`0.32`},{key:`equilibriumVapor`,label:`Equilibrium vapor fraction`,unit:`—`,initial:`0.68`}],formula:`Eᴹ = (yₙ − yₙ₊₁)/(yₙ* − yₙ₊₁)`,outputLabel:`Murphree vapor efficiency`,outputUnit:`%`,calculate:({vaporOut:e,vaporIn:t,equilibriumVapor:n})=>(e-t)/(n-t)*100,interpret:()=>`Vapor-phase tray efficiency relative to equilibrium`},
  "packedColumnHTUNTU": {id:`packedColumnHTUNTU`,code:`SP–25`,category:`Separation Processes`,mark:`H`,title:`Packed-Column HTU/NTU`,fields:[{key:`htu`,label:`Height of transfer unit`,unit:`m`,initial:`0.75`},{key:`ntu`,label:`Number of transfer units`,unit:`—`,initial:`5.2`},{key:`safetyFactor`,label:`Design factor`,unit:`—`,initial:`1.10`}],formula:`Z = HTU × NTU × Fdesign`,outputLabel:`Required packed height`,outputUnit:`m`,calculate:({htu:e,ntu:t,safetyFactor:n})=>e*t*n,interpret:()=>`Mass-transfer packing height before distributor and support allowances`},
  "psychrometricAirEnthalpy": {id:`psychrometricAirEnthalpy`,code:`SP–27`,category:`Separation Processes`,mark:`hₐ`,title:`Psychrometric Air Enthalpy`,fields:[{key:`dryBulb`,label:`Dry-bulb temperature`,unit:`°C`,initial:`30`},{key:`humidityRatio`,label:`Humidity ratio`,unit:`kg/kg dry air`,initial:`0.012`}],formula:`h = 1.006T + ω(2501 + 1.86T)`,outputLabel:`Moist-air enthalpy`,outputUnit:`kJ/kg dry air`,calculate:({dryBulb:e,humidityRatio:t})=>1.006*e+t*(2501+1.86*e),interpret:()=>`ASHRAE-style moist-air relation near atmospheric pressure`},
} satisfies Record<
  PhaseThirteenCalculatorId,
  PhaseThirteenDefinition
>
