import {
  readFileSync,
} from 'node:fs'

const catalog =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const registry =
  readFileSync(
    'src/components/NativeCalculatorRegistry.tsx',
    'utf8',
  )

const workbench =
  readFileSync(
    'src/components/CalculatorWorkbench.tsx',
    'utf8',
  )

const catalogIds =
  [
    ...catalog.matchAll(
      /\{\s*id:\s*"([^"]+)"/g,
    ),
  ].map(
    (match) =>
      match[1],
  )

const registryIds =
  [
    ...registry.matchAll(
      /^  "([^"]+)":\s*\(/gm,
    ),
  ].map(
    (match) =>
      match[1],
  )

const catalogSet =
  new Set(
    catalogIds,
  )

const registrySet =
  new Set(
    registryIds,
  )

const missing =
  catalogIds.filter(
    (id) =>
      !registrySet.has(id),
  )

const unknown =
  registryIds.filter(
    (id) =>
      !catalogSet.has(id),
  )

const errors = []

if (
  catalogIds.length !== 473
) {
  errors.push(
    `catalog=${catalogIds.length}`,
  )
}

if (
  registryIds.length !== 473
) {
  errors.push(
    `registry=${registryIds.length}`,
  )
}

if (
  registrySet.size !== 473
) {
  errors.push(
    `unique=${registrySet.size}`,
  )
}

if (missing.length) {
  errors.push(
    `missing=${missing.join(',')}`,
  )
}

if (unknown.length) {
  errors.push(
    `unknown=${unknown.join(',')}`,
  )
}

if (
  !workbench.includes(
    'renderNativeCalculator(',
  )
) {
  errors.push(
    'dispatcher missing',
  )
}

if (
  workbench.includes(
    'LegacyWorkbench',
  )
  || workbench.includes(
    '/legacy/',
  )
) {
  errors.push(
    'legacy reference detected',
  )
}

if (errors.length) {
  console.error(
    'NATIVE CALCULATOR REGISTRY VERIFICATION FAILED',
  )

  for (
    const error
    of errors
  ) {
    console.error(
      `- ${error}`,
    )
  }

  process.exit(1)
}

console.log(
  'NATIVE CALCULATOR REGISTRY VERIFICATION PASSED',
)
console.log(
  `Registry routes: ${registryIds.length}`,
)
console.log(
  'Legacy routes: 0',
)
