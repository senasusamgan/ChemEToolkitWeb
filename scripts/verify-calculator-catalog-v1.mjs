import {
  readFileSync,
} from 'node:fs'

const CALCULATORS_PATH =
  'src/data/calculators.ts'

const CATEGORIES_PATH =
  'src/data/categories.ts'

const EXPECTED_CATEGORIES = [
  {
    number: 1,
    name: 'Engineering Fundamentals',
    count: 18,
  },
  {
    number: 2,
    name: 'Fluid Mechanics',
    count: 17,
  },
  {
    number: 3,
    name: 'Heat Transfer',
    count: 28,
  },
  {
    number: 4,
    name: 'Mass Transfer',
    count: 45,
  },
  {
    number: 5,
    name: 'Material & Energy Balances',
    count: 31,
  },
  {
    number: 6,
    name: 'Numerical Methods',
    count: 40,
  },
  {
    number: 7,
    name: 'Process Control',
    count: 40,
  },
  {
    number: 8,
    name: 'Process Safety & Economics',
    count: 40,
  },
  {
    number: 9,
    name: 'Reaction Engineering',
    count: 62,
  },
  {
    number: 10,
    name: 'Separation Processes',
    count: 52,
  },
  {
    number: 11,
    name: 'Thermodynamics',
    count: 25,
  },
]

const EXPECTED_CALCULATOR_COUNT =
  EXPECTED_CATEGORIES.reduce(
    (total, category) =>
      total + category.count,
    0,
  )

const errors = []

function addError(message) {
  errors.push(message)
}

function countValues(values) {
  const counts = new Map()

  for (const value of values) {
    counts.set(
      value,
      (counts.get(value) ?? 0) + 1,
    )
  }

  return counts
}

function duplicateValues(values) {
  return [
    ...countValues(values),
  ]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({
      value,
      count,
    }))
}

const calculatorSource =
  readFileSync(
    CALCULATORS_PATH,
    'utf8',
  )

const categorySource =
  readFileSync(
    CATEGORIES_PATH,
    'utf8',
  )

const calculatorPattern =
  /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g

const categoryPattern =
  /\{\s*number:\s*(\d+)\s*,\s*name:\s*"([^"]+)"\s*,\s*icon:\s*"([^"]*)"\s*,\s*total:\s*(\d+)\s*,\s*live:\s*(\d+)\s*\}/g

const calculators = [
  ...calculatorSource.matchAll(
    calculatorPattern,
  ),
].map((match) => ({
  id: match[1],
  title: match[2],
  category: match[3],
  available: match[4] === 'true',
}))

const categories = [
  ...categorySource.matchAll(
    categoryPattern,
  ),
].map((match) => ({
  number: Number(match[1]),
  name: match[2],
  icon: match[3],
  total: Number(match[4]),
  live: Number(match[5]),
}))

const rawCalculatorMarkers =
  calculatorSource.match(
    /\{\s*id\s*:/g,
  )?.length ?? 0

const rawCategoryMarkers =
  categorySource.match(
    /\{\s*number\s*:/g,
  )?.length ?? 0

if (
  rawCalculatorMarkers !==
  calculators.length
) {
  addError(
    `Calculator parser matched ${calculators.length} of ${rawCalculatorMarkers} catalog entries.`,
  )
}

if (
  rawCategoryMarkers !==
  categories.length
) {
  addError(
    `Category parser matched ${categories.length} of ${rawCategoryMarkers} category entries.`,
  )
}

if (
  calculators.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  addError(
    `Expected ${EXPECTED_CALCULATOR_COUNT} calculators, found ${calculators.length}.`,
  )
}

if (
  categories.length !==
  EXPECTED_CATEGORIES.length
) {
  addError(
    `Expected ${EXPECTED_CATEGORIES.length} categories, found ${categories.length}.`,
  )
}

const duplicateIds =
  duplicateValues(
    calculators.map(
      (calculator) =>
        calculator.id,
    ),
  )

for (const duplicate of duplicateIds) {
  addError(
    `Duplicate calculator id "${duplicate.value}" appears ${duplicate.count} times.`,
  )
}

for (const calculator of calculators) {
  if (
    calculator.id.trim() !==
    calculator.id ||
    !/^[a-z][A-Za-z0-9]*$/.test(
      calculator.id,
    )
  ) {
    addError(
      `Invalid calculator id: "${calculator.id}".`,
    )
  }

  if (
    calculator.title.trim().length ===
    0
  ) {
    addError(
      `Calculator "${calculator.id}" has an empty title.`,
    )
  }

  if (
    calculator.category.trim()
      .length === 0
  ) {
    addError(
      `Calculator "${calculator.id}" has an empty category.`,
    )
  }

  if (!calculator.available) {
    addError(
      `Calculator "${calculator.id}" is not marked available.`,
    )
  }
}

const expectedByName =
  new Map(
    EXPECTED_CATEGORIES.map(
      (category) => [
        category.name,
        category,
      ],
    ),
  )

const categoryCounts =
  countValues(
    calculators.map(
      (calculator) =>
        calculator.category,
    ),
  )

for (
  const [
    categoryName,
    actualCount,
  ] of categoryCounts
) {
  if (
    !expectedByName.has(
      categoryName,
    )
  ) {
    addError(
      `Unknown calculator category: "${categoryName}".`,
    )
    continue
  }

  const expected =
    expectedByName.get(
      categoryName,
    )

  if (
    actualCount !==
    expected.count
  ) {
    addError(
      `${categoryName}: expected ${expected.count} calculators, found ${actualCount}.`,
    )
  }
}

for (
  const expectedCategory
  of EXPECTED_CATEGORIES
) {
  if (
    !categoryCounts.has(
      expectedCategory.name,
    )
  ) {
    addError(
      `Missing calculator category: "${expectedCategory.name}".`,
    )
  }
}

const duplicateCategoryNames =
  duplicateValues(
    categories.map(
      (category) =>
        category.name,
    ),
  )

for (
  const duplicate
  of duplicateCategoryNames
) {
  addError(
    `Duplicate category name "${duplicate.value}" appears ${duplicate.count} times.`,
  )
}

const duplicateCategoryNumbers =
  duplicateValues(
    categories.map(
      (category) =>
        category.number,
    ),
  )

for (
  const duplicate
  of duplicateCategoryNumbers
) {
  addError(
    `Duplicate category number ${duplicate.value} appears ${duplicate.count} times.`,
  )
}

for (const category of categories) {
  const expected =
    expectedByName.get(
      category.name,
    )

  if (!expected) {
    addError(
      `Unknown category definition: "${category.name}".`,
    )
    continue
  }

  if (
    category.number !==
    expected.number
  ) {
    addError(
      `${category.name}: expected category number ${expected.number}, found ${category.number}.`,
    )
  }

  if (
    category.total !==
    expected.count
  ) {
    addError(
      `${category.name}: declared total is ${category.total}; expected ${expected.count}.`,
    )
  }

  if (
    category.live !==
    expected.count
  ) {
    addError(
      `${category.name}: declared live count is ${category.live}; expected ${expected.count}.`,
    )
  }

  if (
    category.icon.trim().length ===
    0
  ) {
    addError(
      `${category.name}: category icon is empty.`,
    )
  }

  const catalogCount =
    categoryCounts.get(
      category.name,
    ) ?? 0

  if (
    category.total !==
    catalogCount
  ) {
    addError(
      `${category.name}: category metadata total ${category.total} does not match catalog count ${catalogCount}.`,
    )
  }

  if (
    category.live !==
    catalogCount
  ) {
    addError(
      `${category.name}: category metadata live count ${category.live} does not match catalog count ${catalogCount}.`,
    )
  }
}

if (errors.length > 0) {
  console.error(
    'CALCULATOR CATALOG VERIFICATION FAILED',
  )

  for (
    const [
      index,
      error,
    ] of errors.entries()
  ) {
    console.error(
      `${index + 1}. ${error}`,
    )
  }

  process.exit(1)
}

console.log(
  'CALCULATOR CATALOG VERIFICATION PASSED',
)
console.log(
  `Calculators verified: ${calculators.length}`,
)
console.log(
  `Categories verified: ${categories.length}`,
)
console.log(
  `Available calculators: ${
    calculators.filter(
      (calculator) =>
        calculator.available,
    ).length
  }`,
)
console.log(
  'Category distribution:',
)

for (
  const category
  of EXPECTED_CATEGORIES
) {
  console.log(
    `- ${category.name}: ${category.count}`,
  )
}
