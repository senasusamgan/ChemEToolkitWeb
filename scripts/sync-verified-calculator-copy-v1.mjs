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
  !Number.isInteger(
    calculatorCount,
  ) ||
  calculatorCount <= 0
) {
  throw new Error(
    'Invalid catalog calculator count in coverage baseline.',
  )
}

const allowedExtensions =
  new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.html',
    '.md',
  ])

const targets = []

async function collectDirectory(
  directory,
) {
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

    if (
      entry.isDirectory()
    ) {
      await collectDirectory(
        path,
      )

      continue
    }

    if (
      allowedExtensions.has(
        extname(
          entry.name,
        ),
      )
    ) {
      targets.push(
        path,
      )
    }
  }
}

for (const directory of [
  'src',
  'public',
]) {
  try {
    await collectDirectory(
      directory,
    )
  } catch {
    // Directory may not exist in all environments.
  }
}

targets.push(
  'index.html',
)

const pattern =
  /\b\d+\+?(\s+)(verified\s+calculators)\b/gi

let changedFiles =
  0

let updatedOccurrences =
  0

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

  let fileOccurrences =
    0

  const updated =
    source.replace(
      pattern,
      (
        _match,
        spacing,
        phrase,
      ) => {
        fileOccurrences +=
          1

        return (
          `${calculatorCount}` +
          spacing +
          phrase
        )
      },
    )

  if (
    updated !== source
  ) {
    await writeFile(
      path,
      updated,
      'utf8',
    )

    changedFiles +=
      1

    updatedOccurrences +=
      fileOccurrences
  }
}

console.log(
  `PASS: verified-calculator copy synchronized to ${calculatorCount}.`,
)

console.log(
  `Changed files: ${changedFiles}`,
)

console.log(
  `Updated occurrences: ${updatedOccurrences}`,
)
