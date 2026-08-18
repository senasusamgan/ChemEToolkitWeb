import {
  getProjectSetActivityTimestamp,
  normalizeProjectPriority,
  normalizeProjectReviewInterval,
  type NotebookProjectSet,
} from './scientificNotebookProjectSets'

function escapeCalendarText(
  value: string,
): string {
  return value
    .replace(
      /\\/g,
      '\\\\',
    )
    .replace(
      /\r?\n/g,
      '\\n',
    )
    .replace(
      /;/g,
      '\\;',
    )
    .replace(
      /,/g,
      '\\,',
    )
}

function formatCalendarDate(
  timestamp: number,
): string {
  const date =
    new Date(
      timestamp,
    )

  const year =
    date
      .getUTCFullYear()
      .toString()
      .padStart(
        4,
        '0',
      )

  const month =
    (
      date.getUTCMonth()
      + 1
    )
      .toString()
      .padStart(
        2,
        '0',
      )

  const day =
    date
      .getUTCDate()
      .toString()
      .padStart(
        2,
        '0',
      )

  return `${year}${month}${day}`
}

function formatCalendarTimestamp(
  date: Date,
): string {
  return date
    .toISOString()
    .replace(
      /[-:]/g,
      '',
    )
    .replace(
      /\.\d{3}Z$/,
      'Z',
    )
}

function nextCalendarDay(
  timestamp: number,
): number {
  const date =
    new Date(
      timestamp,
    )

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
      + 1,
  )
}

function getNextReviewTimestamp(
  projectSet:
    NotebookProjectSet,
): number {
  return (
    getProjectSetActivityTimestamp(
      projectSet,
    )
    + normalizeProjectReviewInterval(
        projectSet.reviewIntervalDays,
      )
      * 86_400_000
  )
}

function buildDescription(
  projectSet:
    NotebookProjectSet,
): string {
  const parts = [
    `Status: ${
      projectSet.status
      ?? 'planned'
    }`,
    `Priority: ${
      normalizeProjectPriority(
        projectSet.priority,
      )
    }`,
    `Review cadence: ${
      normalizeProjectReviewInterval(
        projectSet.reviewIntervalDays,
      )
    } days`,
  ]

  if (
    projectSet.nextAction
      ?.trim()
  ) {
    parts.push(
      `Next action: ${
        projectSet.nextAction.trim()
      }`,
    )
  }

  return parts.join(
    '\n',
  )
}

export function buildProjectReviewCalendar(
  projectSets:
    NotebookProjectSet[],
): string {
  const generatedAt =
    formatCalendarTimestamp(
      new Date(),
    )

  const events =
    projectSets
      .filter(
        (projectSet) =>
          projectSet.status !==
            'complete',
      )
      .map(
        (projectSet) => {
          const nextReview =
            getNextReviewTimestamp(
              projectSet,
            )

          if (
            !Number.isFinite(
              nextReview,
            )
            || nextReview <= 0
          ) {
            return ''
          }

          const start =
            formatCalendarDate(
              nextReview,
            )

          const end =
            formatCalendarDate(
              nextCalendarDay(
                nextReview,
              ),
            )

          const summary =
            escapeCalendarText(
              `Review: ${
                projectSet.name
              }`,
            )

          const description =
            escapeCalendarText(
              buildDescription(
                projectSet,
              ),
            )

          const uid =
            escapeCalendarText(
              `${
                projectSet.id
              }-review@cheme-toolkit`,
            )

          return [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${generatedAt}`,
            `DTSTART;VALUE=DATE:${start}`,
            `DTEND;VALUE=DATE:${end}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            'CATEGORIES:ChemE Toolkit,Project Review',
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT',
          ].join(
            '\r\n',
          )
        },
      )
      .filter(Boolean)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChemE Toolkit//Scientific Notebook Reviews//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ChemE Toolkit Project Reviews',
    ...events,
    'END:VCALENDAR',
    '',
  ].join(
    '\r\n',
  )
}

export function downloadProjectReviewCalendar(
  projectSets:
    NotebookProjectSet[],
) {
  const content =
    buildProjectReviewCalendar(
      projectSets,
    )

  const blob =
    new Blob(
      [
        content,
      ],
      {
        type:
          'text/calendar;charset=utf-8',
      },
    )

  const url =
    URL.createObjectURL(
      blob,
    )

  const anchor =
    document.createElement(
      'a',
    )

  anchor.href =
    url

  anchor.download =
    'cheme-toolkit-project-reviews.ics'

  document.body.append(
    anchor,
  )

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(
    url,
  )
}
