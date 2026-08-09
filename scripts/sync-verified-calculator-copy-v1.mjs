import {
  readFile,
  writeFile,
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

const calculatorCount =
  baseline.catalogCalculatorCount

if (
  !Number.isInteger(calculatorCount) ||
  calculatorCount <= 0
) {
  throw new Error(
    'Invalid catalog calculator count.',
  )
}

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
  /\b\d+\+?(\s+verified\s+calculators)\b/gi

const searchPattern =
  /\b(Search\s+all\s+)\d+\+?(\s+calculators)\b/gi

let changedFiles = 0
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

  let updated =
    source.replace(
      verifiedPattern,
      (_match, suffix) => {
        verifiedOccurrences += 1

        return (
          `${calculatorCount}` +
          suffix
        )
      },
    )

  updated =
    updated.replace(
      searchPattern,
      (
        _match,
        prefix,
        suffix,
      ) => {
        searchOccurrences += 1

        return (
          prefix +
          `${calculatorCount}` +
          suffix
        )
      },
    )

  if (updated !== source) {
    await writeFile(
      path,
      updated,
      'utf8',
    )

    changedFiles += 1
  }
}

console.log(
  `PASS: visible calculator counts synchronized to ${calculatorCount}.`,
)

console.log(
  `Changed files: ${changedFiles}`,
)

console.log(
  `Verified occurrences: ${verifiedOccurrences}`,
)

console.log(
  `Search occurrences: ${searchOccurrences}`,
)
