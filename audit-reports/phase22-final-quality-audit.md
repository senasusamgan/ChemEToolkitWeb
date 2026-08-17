# ChemE Toolkit — Final Quality Audit

## Calculator platform

- Catalog calculators: **473**
- Native calculator routes: **473**
- Legacy calculator routes: **0**
- Direct test coverage signals: **473 / 473**

## Bundle architecture

- JavaScript chunks: **84**
- Dynamic entries: **65**
- Largest JavaScript chunk: **193.6 KiB**
- Largest entry chunk: **81.4 KiB**
- Total JavaScript: **3079.8 KiB**
- Total gzip JavaScript: **703.5 KiB**
- JavaScript chunks over 200 KiB: **0**

## Runtime architecture

- Calculator registry: **native registry dispatcher**
- Calculator category loading: **lazy**
- Fluid Mechanics: **6 lazy shards**
- Separation Processes: **4 lazy shards**
- Engineering Workspace panels: **lazy loaded**
- Problem Solver worker fallback catalog: **on-demand**
- Ineffective Problem Solver engine dynamic import: **removed**

## Release safeguards

- TypeScript build: **pass**
- Lint: **pass**
- Bundle regression budget: **pass**
- Build performance warnings: **0**
- Legacy runtime references: **0**

## Largest generated JavaScript chunks

| Rank | Asset | Size KiB |
|---:|---|---:|
| 1 | `FluidMechanicsShard05-BWTDIM1V.js` | 193.6 |
| 2 | `vendor-react-BDiuValF.js` | 177.5 |
| 3 | `feature-reaction-engineering-DWBk_rYz.js` | 169.4 |
| 4 | `FluidMechanicsShard06-DA2Pz4S-.js` | 162.1 |
| 5 | `problemSolver.worker-BM1llju5.js` | 156.1 |
| 6 | `feature-numerical-methods-B3w_4aME.js` | 144.6 |
| 7 | `feature-problem-solver-rHK8KzkS.js` | 139.6 |
| 8 | `FluidMechanicsShard04-phJkQudM.js` | 136.6 |
| 9 | `feature-native-migrations-BosMszPq.js` | 133.0 |
| 10 | `feature-process-control-CNbw7Tbv.js` | 121.9 |
| 11 | `feature-process-safety-economics-DhBqMg-Y.js` | 119.5 |
| 12 | `FluidMechanicsShard03-ZOA-u7Hk.js` | 108.3 |
| 13 | `feature-mass-transfer-NHZG7PPE.js` | 101.7 |
| 14 | `FluidMechanicsShard02-BVQNwbth.js` | 97.4 |
| 15 | `SeparationProcessesShard03-BqpfX1s8.js` | 96.6 |
