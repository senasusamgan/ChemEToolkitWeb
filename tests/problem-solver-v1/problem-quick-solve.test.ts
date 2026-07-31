import assert from 'node:assert/strict'
import test from 'node:test'
import {
  solveProblemQuickly,
} from '../../src/features/problem-solver/problemQuickSolveEngine.ts'

function requireSolution(
  solution:
    ReturnType<
      typeof solveProblemQuickly
    >,
) {
  assert.ok(solution)
  return solution
}

test(
  'quick-solves Reynolds number and flow regime',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'reynoldsNumber',
          [
            'Find Reynolds number for',
            'fluid density 998 kg/m3,',
            'velocity 2 m/s,',
            'characteristic diameter 0.05 m',
            'and dynamic viscosity 0.001 Pa s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        99_800,
      ) < 1e-6,
    )

    assert.match(
      solution.resultValue,
      /Turbulent/,
    )

    assert.equal(
      solution.equation,
      'Re = ρvD/μ',
    )
  },
)

test(
  'quick-solves Darcy-Weisbach pressure drop',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pressureDrop',
          [
            'Estimate pressure drop.',
            'Pipe length 30 m,',
            'inside diameter 0.05 m,',
            'velocity 2 m/s,',
            'fluid density 998 kg/m3,',
            'dynamic viscosity 0.001 Pa s,',
            'roughness 0.045 mm.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        26_339.001987447435,
      ) < 1,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )

    assert.match(
      solution.resultValue,
      /kPa/,
    )
  },
)

test(
  'derives pipe velocity from volumetric flow rate',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pressureDrop',
          [
            'Estimate pressure drop.',
            'Pipe length 30 m,',
            'inside diameter 0.05 m,',
            'flow rate 0.003927 m3/s,',
            'fluid density 998 kg/m3,',
            'dynamic viscosity 0.001 Pa s,',
            'roughness 0.045 mm.',
          ].join(' '),
        ),
      )

    assert.ok(
      solution.numericValue >
      20_000,
    )

    assert.match(
      solution.steps[0],
      /Velocity/,
    )
  },
)

test(
  'quick-solves required pump power',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pumpPower',
          [
            'Calculate pump power.',
            'Fluid density 1000 kg/m3,',
            'flow rate 0.01 m3/s,',
            'total head 20 m',
            'and pump efficiency 80%.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        2451.6625,
      ) < 1e-6,
    )

    assert.match(
      solution.resultValue,
      /kW/,
    )
  },
)

test(
  'quick-solves Biot number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'biotNumber',
          [
            'Find Biot number.',
            'Convection coefficient 25 W/m2K,',
            'characteristic length 0.01 m',
            'and thermal conductivity 15 W/mK.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        1 / 60,
      ) < 1e-12,
    )

    assert.match(
      solution.steps.join(' '),
      /Lumped-capacitance/,
    )
  },
)

test(
  'quick-solves missing ideal-gas pressure',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'idealGas',
          [
            'Find the ideal gas pressure.',
            'Volume 0.024 m3,',
            'moles 1 mol',
            'and temperature 293.15 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        101_557.69651944583,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )
  },
)

test(
  'does not invent a result when inputs are incomplete',
  () => {
    assert.equal(
      solveProblemQuickly(
        'reynoldsNumber',
        'Find Reynolds number for density 998 kg/m3.',
      ),
      undefined,
    )
  },
)

test(
  'does not quick-solve unsupported calculators',
  () => {
    assert.equal(
      solveProblemQuickly(
        'pidController',
        'Tune a PID controller.',
      ),
      undefined,
    )
  },
)

test(
  'quick-solves heat-exchanger LMTD',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'heatExchangerLMTD',
          [
            'Calculate LMTD.',
            'Terminal temperature difference 1 60 K',
            'and terminal temperature difference 2 30 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        43.2808512266689,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'K',
    )
  },
)

test(
  'quick-solves required heat-exchanger area',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'heatExchangerAreaSizing',
          [
            'Size the heat exchanger.',
            'Heat duty 500 kW,',
            'overall heat transfer coefficient 800 W/m2K,',
            'LMTD 40 K',
            'and correction factor 0.9.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        17.36111111111111,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'm2',
    )
  },
)

test(
  'quick-solves required CSTR volume',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'reactorDesign',
          [
            'Calculate the required CSTR volume.',
            'Feed molar flow 2 mol/s,',
            'conversion 75%',
            'and exit reaction rate 0.5 mol/m3 s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        3,
      ) < 1e-12,
    )

    assert.equal(
      solution.unit,
      'm3',
    )
  },
)

test(
  'does not size an exchanger without a correction factor',
  () => {
    const solution =
      solveProblemQuickly(
        'heatExchangerAreaSizing',
        [
          'Heat duty 500 kW,',
          'overall heat transfer coefficient 800 W/m2K',
          'and LMTD 40 K.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)

test(
  'quick-solves hydrostatic pressure',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'hydrostaticPressure',
          [
            'Calculate hydrostatic pressure.',
            'Fluid density 1000 kg/m3',
            'and liquid depth 5 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        49_033.25,
      ) < 1e-8,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )

    assert.equal(
      solution.equation,
      'ΔP = ρgh',
    )
  },
)

test(
  'quick-solves plane-wall conduction',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'planeWallConduction',
          [
            'Calculate plane wall heat transfer.',
            'Thermal conductivity 0.8 W/mK,',
            'wall area 10 m2,',
            'temperature difference 25 K',
            'and wall thickness 0.2 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        1000,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'W',
    )

    assert.equal(
      solution.equation,
      'Q = kAΔT/L',
    )
  },
)

test(
  'quick-solves Ficks first-law flux',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'ficksFirstLaw',
          [
            'Calculate diffusive flux.',
            'Diffusivity 2e-9 m2/s,',
            'concentration difference 500 mol/m3',
            'and diffusion distance 0.001 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        0.001,
      ) < 1e-14,
    )

    assert.equal(
      solution.unit,
      'mol/(m2 s)',
    )

    assert.match(
      solution.equation,
      /Jₐ/,
    )
  },
)

test(
  'does not solve Ficks first law without diffusion distance',
  () => {
    const solution =
      solveProblemQuickly(
        'ficksFirstLaw',
        [
          'Diffusivity 2e-9 m2/s',
          'and concentration difference 500 mol/m3.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)

test(
  'quick-solves convection heat transfer',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'convectionHeatTransfer',
          [
            'Calculate convection heat transfer.',
            'Convection coefficient 25 W/m2K,',
            'surface area 4 m2',
            'and temperature difference 30 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        3000,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'W',
    )

    assert.equal(
      solution.equation,
      'Q = hAΔT',
    )
  },
)

test(
  'quick-solves Nusselt number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'nusseltNumber',
          [
            'Calculate the Nusselt number.',
            'Heat transfer coefficient 100 W/m2K,',
            'characteristic length 0.05 m',
            'and thermal conductivity 0.5 W/mK.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        10,
      ) < 1e-12,
    )

    assert.equal(
      solution.unit,
      'dimensionless',
    )

    assert.equal(
      solution.equation,
      'Nu = hL/k',
    )
  },
)

test(
  'quick-solves Froude number and regime',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'froudeNumber',
          [
            'Calculate Froude number.',
            'Velocity 3 m/s',
            'and hydraulic depth 2 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        0.6774011336276814,
      ) < 1e-12,
    )

    assert.match(
      solution.resultValue,
      /Subcritical/,
    )

    assert.equal(
      solution.equation,
      'Fr = v/√(gL)',
    )
  },
)

test(
  'does not solve convection heat transfer without area',
  () => {
    const solution =
      solveProblemQuickly(
        'convectionHeatTransfer',
        [
          'Convection coefficient 25 W/m2K',
          'and temperature difference 30 K.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)

test(
  'quick-solves volumetric flow rate',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'flowRate',
          [
            'Calculate volumetric flow rate.',
            'Flow area 0.02 m2',
            'and velocity 3 m/s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        0.06,
      ) < 1e-12,
    )

    assert.equal(
      solution.equation,
      'Q = Av',
    )
  },
)

test(
  'quick-solves drag force',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'dragForce',
          [
            'Calculate drag force.',
            'Drag coefficient 1.2,',
            'fluid density 1.225 kg/m3,',
            'velocity 10 m/s',
            'and projected area 0.5 m2.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        36.75,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'N',
    )
  },
)

test(
  'quick-solves minor-loss pressure drop',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'minorLosses',
          [
            'Calculate minor losses.',
            'Total loss coefficient 4.5,',
            'fluid density 1000 kg/m3',
            'and velocity 2 m/s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        9000,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )
  },
)

test(
  'quick-solves net thermal radiation',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'thermalRadiation',
          [
            'Calculate net thermal radiation.',
            'Emissivity 0.8,',
            'surface area 2 m2,',
            'surface temperature 500 K',
            'and surroundings temperature 300 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        4935.4938942976005,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'W',
    )
  },
)

test(
  'quick-solves Fourier number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'fourierNumber',
          [
            'Calculate Fourier number.',
            'Thermal diffusivity 1e-5 m2/s,',
            'time 120 s',
            'and characteristic length 0.02 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        3,
      ) < 1e-12,
    )

    assert.equal(
      solution.equation,
      'Fo = αt/Lc²',
    )
  },
)

test(
  'quick-solves Prandtl number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'prandtlNumber',
          [
            'Calculate Prandtl number.',
            'Specific heat capacity 4180 J/kgK,',
            'dynamic viscosity 0.001 Pa s',
            'and thermal conductivity 0.6 W/mK.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        6.966666666666667,
      ) < 1e-12,
    )

    assert.equal(
      solution.equation,
      'Pr = cpμ/k',
    )
  },
)

test(
  'does not calculate radiation without emissivity',
  () => {
    const solution =
      solveProblemQuickly(
        'thermalRadiation',
        [
          'Surface area 2 m2,',
          'surface temperature 500 K',
          'and surroundings temperature 300 K.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)

test(
  'quick-solves U-tube manometer pressure difference',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'uTubeManometer',
          [
            'Calculate U-tube pressure difference.',
            'Manometer fluid density 13600 kg/m3,',
            'process fluid density 1000 kg/m3',
            'and level difference 0.2 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        24712.758,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )
  },
)

test(
  'quick-solves orifice volumetric flow rate',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'orificeMeter',
          [
            'Calculate orifice flow.',
            'Discharge coefficient 0.62,',
            'orifice area 0.001 m2,',
            'pressure difference 10000 Pa',
            'and fluid density 1000 kg/m3.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        0.002772724292099739,
      ) < 1e-14,
    )

    assert.equal(
      solution.unit,
      'm3/s',
    )
  },
)

test(
  'quick-solves tank drain time',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'tankDrainTime',
          [
            'Calculate tank drain time.',
            'Tank cross-sectional area 1 m2,',
            'drain orifice area 0.01 m2,',
            'discharge coefficient 0.6',
            'and initial liquid height 2 m.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        106.44331892701958,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      's',
    )
  },
)

test(
  'quick-solves Grashof number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'grashofNumber',
          [
            'Calculate Grashof number.',
            'Thermal expansion coefficient 0.0034 1/K,',
            'temperature difference 30 K,',
            'characteristic length 0.1 m',
            'and kinematic viscosity 1.5e-5 m2/s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        4445681.333333333,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'dimensionless',
    )
  },
)

test(
  'quick-solves Rayleigh number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'rayleighNumber',
          [
            'Calculate Rayleigh number.',
            'Grashof number 1.2e8',
            'and Prandtl number 0.71.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        85200000,
      ) < 1e-6,
    )

    assert.equal(
      solution.equation,
      'Ra = GrPr',
    )
  },
)

test(
  'quick-solves mass-transfer coefficient',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'massTransferCoefficient',
          [
            'Calculate the mass transfer coefficient.',
            'Molar flux 0.002 mol/m2 s',
            'and concentration difference 500 mol/m3.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        4e-6,
      ) < 1e-16,
    )

    assert.equal(
      solution.unit,
      'm/s',
    )
  },
)

test(
  'does not calculate an orifice flow without pressure difference',
  () => {
    const solution =
      solveProblemQuickly(
        'orificeMeter',
        [
          'Discharge coefficient 0.62,',
          'orifice area 0.001 m2',
          'and fluid density 1000 kg/m3.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)
