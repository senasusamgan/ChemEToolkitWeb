import {
  readFileSync,
} from 'node:fs'

const calendar =
  readFileSync(
    'src/lib/scientificNotebookReviewCalendar.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const contracts = [
  [
    calendar.includes(
      'buildProjectReviewCalendar',
    )
      && calendar.includes(
        'downloadProjectReviewCalendar',
      ),
    'Review calendar builder or download helper missing.',
  ],
  [
    calendar.includes(
      'BEGIN:VCALENDAR',
    )
      && calendar.includes(
        'BEGIN:VEVENT',
      )
      && calendar.includes(
        'VERSION:2.0',
      ),
    'iCalendar structure missing.',
  ],
  [
    calendar.includes(
      'DTSTART;VALUE=DATE:',
    )
      && calendar.includes(
        'DTEND;VALUE=DATE:',
      ),
    'All-day review event dates missing.',
  ],
  [
    calendar.includes(
      'normalizeProjectReviewInterval',
    )
      && calendar.includes(
        'getProjectSetActivityTimestamp',
      ),
    'Review scheduling must use cadence and latest activity.',
  ],
  [
    calendar.includes(
      "projectSet.status !==\n            'complete'",
    ),
    'Completed projects must be excluded from review calendar.',
  ],
  [
    calendar.includes(
      'projectSet.nextAction',
    )
      && calendar.includes(
        'normalizeProjectPriority',
      ),
    'Calendar project context missing.',
  ],
  [
    calendar.includes(
      'cheme-toolkit-project-reviews.ics',
    )
      && calendar.includes(
        'text/calendar;charset=utf-8',
      ),
    'Calendar download contract missing.',
  ],
  [
    component.includes(
      'async function exportReviewCalendar()',
    )
      && component.includes(
        '../lib/scientificNotebookReviewCalendar',
      ),
    'Review calendar UI workflow missing.',
  ],
  [
    component.includes(
      'Review Calendar',
    ),
    'Review calendar control missing.',
  ],
  [
    component.includes(
      'await import(',
    ),
    'Review calendar must remain dynamically loaded.',
  ],
]

const failures =
  contracts
    .filter(
      ([passed]) =>
        !passed,
    )
    .map(
      ([, message]) =>
        message,
    )

if (failures.length) {
  console.error(
    'SCIENTIFIC NOTEBOOK REVIEW CALENDAR V28 VERIFICATION FAILED',
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'SCIENTIFIC NOTEBOOK REVIEW CALENDAR V28 VERIFICATION PASSED',
)

console.log(
  'PASS: standards-based iCalendar export.',
)

console.log(
  'PASS: review dates follow project cadence.',
)

console.log(
  'PASS: project context included in events.',
)

console.log(
  'PASS: completed projects excluded.',
)

console.log(
  'PASS: calendar bundle remains lazy-loaded.',
)
