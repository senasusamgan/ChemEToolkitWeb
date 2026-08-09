import {
  readFile,
  readdir,
} from 'node:fs/promises'

import {
  extname,
  join,
} from 'node:path'

const baseline =
  JSON.parse(
    await readFile(
      'scripts/calculator-test-coverage-baseline-v1.json',
      'utf8',
    ),
  )

const expected =
  baseline.catalogCalculatorCount

const extensions =
  new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.html',
    '.md',
  ])

const targets = []

async function walk(directory) {
  const entries =
    await readdir(
      directory,
      {
        withFileTypes: true,
      },
    )

  for (const entry of entries) {
    const path =
      join(
        directory,
        entry.name,
      )

    if (entry.isDirectory()) {
      await walk(path)
      continue
    }

    if (
      extensions.has(
        extname(entry.name),
      )
    ) {
      targets.push(path)
    }
  }
}

for (const directory of [
  'src',
  'public',
]) {
  try {
    await walk(directory)
  } catch {
    // Optional directory.
  }
}

targets.push('index.html')

const verifiedPattern =
  /\b(\d+)\+?\s+verified\s+calculators\b/gi

const searchPattern =
  /\bSearch\s+all\s+(\d+)\+?\s+calculators\b/gi

const stale = []

let verifiedOccurrences = 0
let searchOccurrences = 0

for (const path of targets) {
  let source

  try {
    source =
      await readFile(
        path,
        'utf8',
      )
  } catch {
    continue
  }

  for (
    const match of
    source.matchAll(
      verifiedPattern,
    )
  ) {
    verifiedOccurrences += 1

    if (
      Number(match[1]) !==
      expected
    ) {
      stale.push(
        `${path}: ${match[0]}`,
      )
    }
  }

  for (
    const match of
    source.matchAll(
      searchPattern,
    )
  ) {
    searchOccurrences += 1

    if (
      Number(match[1]) !==
      expected
    ) {
      stale.push(
        `${path}: ${match[0]}`,
      )
    }
  }
}

if (stale.length > 0) {
  throw new Error(
    [
      `Expected all visible calculator counts to equal ${expected}.`,
      ...stale,
    ].join('\n'),
  )
}

console.log(
  `PASS: visible calculator counts match ${expected}.`,
)

console.log(
  `Verified occurrences checked: ${verifiedOccurrences}`,
)

console.log(
  `Search occurrences checked: ${searchOccurrences}`,
)
