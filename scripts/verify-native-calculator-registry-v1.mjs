import {
  readFileSync,
} from 'node:fs'

const EXPECTED = 473

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

const catalogIds =
  [
    ...catalog.matchAll(
      /\{\s*id:\s*"([^"]+)"/g,
    ),
  ].map(
    (match) => match[1],
  )

const mapMatch =
  registry.match(
    /const CATEGORY_BY_CALCULATOR:[\s\S]*?=\s*\{([\s\S]*?)\n\}/,
  )

if (!mapMatch) {
  console.error(
    'NATIVE CALCULATOR REGISTRY VERIFICATION FAILED',
  )
  console.error(
    '- CATEGORY_BY_CALCULATOR not found',
  )
  process.exit(1)
}

const registryIds =
  [
    ...mapMatch[1].matchAll(
      /^\s{2}"([^"]+)":\s*"[^"]+",$/gm,
    ),
  ].map(
    (match) => match[1],
  )

const catalogSet =
  new Set(catalogIds)

const registrySet =
  new Set(registryIds)

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

const lazyImports =
  [
    ...registry.matchAll(
      /\blazy\s*\(\s*\(\)\s*=>\s*import\s*\(/g,
    ),
  ].length

const errors = []

if (
  catalogIds.length !== EXPECTED
) {
  errors.push(
    `catalog=${catalogIds.length}`,
  )
}

if (
  registryIds.length !== EXPECTED
) {
  errors.push(
    `registry=${registryIds.length}`,
  )
}

if (
  registrySet.size !== EXPECTED
) {
  errors.push(
    `unique=${registrySet.size}`,
  )
}

if (
  lazyImports !== 11
) {
  errors.push(
    `lazy category imports=${lazyImports}`,
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

if (errors.length) {
  console.error(
    'NATIVE CALCULATOR REGISTRY VERIFICATION FAILED',
  )

  for (const error of errors) {
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
  'Registry routes: 473',
)
console.log(
  'Lazy category modules: 11',
)
console.log(
  'Legacy routes: 0',
)
