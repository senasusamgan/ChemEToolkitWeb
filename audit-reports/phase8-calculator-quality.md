# ChemE Toolkit — Phase 8 Calculator Quality Audit

Generated: 2026-08-17T08:15:33.001Z

## Executive summary

- Catalog calculators: 473
- Native calculators: 297
- Legacy calculators: 176
- Direct test signals: 473/473
- Coverage gaps: 0

## Category architecture

| Category | Total | Native | Legacy |
|---|---:|---:|---:|
| Engineering Fundamentals | 18 | 2 | 16 |
| Fluid Mechanics | 90 | 73 | 17 |
| Heat Transfer | 28 | 0 | 28 |
| Mass Transfer | 45 | 17 | 28 |
| Material & Energy Balances | 33 | 8 | 25 |
| Numerical Methods | 40 | 30 | 10 |
| Process Control | 40 | 34 | 6 |
| Process Safety & Economics | 40 | 40 | 0 |
| Reaction Engineering | 62 | 52 | 10 |
| Separation Processes | 52 | 41 | 11 |
| Thermodynamics | 25 | 0 | 25 |

## Top 20 modernization candidates

Priority score is a structural heuristic, not an engineering safety rating. Coverage gaps receive the highest weight, followed by legacy routing and engineering-criticality signals.

| # | Calculator | Category | Route | Direct test | Score |
|---:|---|---|---|---|---:|
| 1 | Heat Exchanger Energy Balance (`heatExchangerEnergyBalance`) | Material & Energy Balances | legacy | yes | 26 |
| 2 | Activation Energy from Two Temperatures (`activationEnergyTwoPoint`) | Reaction Engineering | legacy | yes | 25 |
| 3 | Adiabatic Mixing Temperature (`adiabaticMixingTemperature`) | Material & Energy Balances | legacy | yes | 25 |
| 4 | Double-Pipe Heat Exchanger (`doublePipeHeatExchanger`) | Heat Transfer | legacy | yes | 25 |
| 5 | Dryer Balance (`dryerBalance`) | Material & Energy Balances | legacy | yes | 25 |
| 6 | Evaporator Balance (`evaporatorBalance`) | Material & Energy Balances | legacy | yes | 25 |
| 7 | Mass Balance (`massBalance`) | Material & Energy Balances | legacy | yes | 25 |
| 8 | Phase-Change Energy Balance (`phaseChangeEnergyBalance`) | Material & Energy Balances | legacy | yes | 25 |
| 9 | Sensible Heat Balance (`sensibleHeatBalance`) | Material & Energy Balances | legacy | yes | 25 |
| 10 | Volumetric & Mass Flow Rate (`flowRate`) | Fluid Mechanics | legacy | yes | 25 |
| 11 | Bernoulli Equation & Energy Head (`bernoulliEquation`) | Fluid Mechanics | legacy | yes | 24 |
| 12 | Binary Separator Balance (`binarySeparatorBalance`) | Material & Energy Balances | legacy | yes | 24 |
| 13 | Boiling Heat Transfer (`boilingHeatTransfer`) | Heat Transfer | legacy | yes | 24 |
| 14 | Bypass Mixing Balance (`bypassMixingBalance`) | Material & Energy Balances | legacy | yes | 24 |
| 15 | Combustion Air Requirement (`combustionAirRequirement`) | Material & Energy Balances | legacy | yes | 24 |
| 16 | Condensation Heat Transfer (`condensationHeatTransfer`) | Heat Transfer | legacy | yes | 24 |
| 17 | Condenser Balance (`condenserBalance`) | Material & Energy Balances | legacy | yes | 24 |
| 18 | Convection Heat Transfer (`convectionHeatTransfer`) | Heat Transfer | legacy | yes | 24 |
| 19 | Conversion–Yield–Selectivity (`reactionPerformanceBalance`) | Material & Energy Balances | legacy | yes | 24 |
| 20 | Critical Depth & Specific Energy (`criticalDepth`) | Fluid Mechanics | legacy | yes | 24 |

## Recommended execution

1. Preserve existing numerical behavior and references.
2. Migrate selected legacy calculators to the native calculator primitives.
3. Add calculator-specific numerical regression tests during migration.
4. Verify desktop/mobile layout, validation, units and result presentation.
5. Run the complete release gate after each migration batch.

