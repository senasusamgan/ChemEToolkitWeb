export type EngineeringReportStatus =
  | 'ready'
  | 'needs-inputs'
  | 'blocked'
  | 'review'

export type EngineeringReportDiagnosticSeverity =
  | 'error'
  | 'warning'

export interface EngineeringReportDiagnostic {
  severity:
    EngineeringReportDiagnosticSeverity
  message: string
}

export interface EngineeringReportSection {
  title: string
  items: string[]
}

export interface ProblemEngineeringReport {
  status:
    EngineeringReportStatus
  headline: string
  summary: string
  sections:
    EngineeringReportSection[]
}

export interface ProblemEngineeringReportContext {
  title: string
  category: string
  readinessPercent: number
  detectedInputs: string[]
  missingInputs: string[]
  diagnostics:
    EngineeringReportDiagnostic[]
  solutionPlan: string[]
  assumptions: string[]
  verificationChecklist: string[]
  hasQuickSolution: boolean
}

function deduplicate(
  values: string[],
): string[] {
  const seen =
    new Set<string>()

  return values.filter(
    (value) => {
      const cleanValue =
        value.trim()

      if (
        !cleanValue ||
        seen.has(
          cleanValue,
        )
      ) {
        return false
      }

      seen.add(
        cleanValue,
      )

      return true
    },
  )
}

function determineStatus(
  context:
    ProblemEngineeringReportContext,
): EngineeringReportStatus {
  if (
    context.diagnostics.some(
      (diagnostic) =>
        diagnostic.severity ===
        'error',
    )
  ) {
    return 'blocked'
  }

  if (
    context.missingInputs.length >
      0 ||
    context.readinessPercent <
      100
  ) {
    return 'needs-inputs'
  }

  if (
    context.diagnostics.some(
      (diagnostic) =>
        diagnostic.severity ===
        'warning',
    )
  ) {
    return 'review'
  }

  if (
    context.hasQuickSolution
  ) {
    return 'ready'
  }

  return 'review'
}

function buildHeadline(
  status:
    EngineeringReportStatus,
  title: string,
): string {
  if (
    status ===
    'blocked'
  ) {
    return (
      `${title}: calculation blocked by engineering input issues`
    )
  }

  if (
    status ===
    'needs-inputs'
  ) {
    return (
      `${title}: additional inputs are required`
    )
  }

  if (
    status ===
    'ready'
  ) {
    return (
      `${title}: calculation is ready for engineering review`
    )
  }

  return (
    `${title}: review assumptions and warnings before acceptance`
  )
}

function buildSummary(
  context:
    ProblemEngineeringReportContext,
  status:
    EngineeringReportStatus,
): string {
  const detectedCount =
    context.detectedInputs.length

  const missingCount =
    context.missingInputs.length

  const errorCount =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'error',
    ).length

  const warningCount =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'warning',
    ).length

  const resultState =
    context.hasQuickSolution
      ? 'A Quick Solve result is available.'
      : 'No Quick Solve result is currently available.'

  return [
    `${context.category} · ${context.readinessPercent}% input readiness.`,
    `${detectedCount} input${
      detectedCount === 1
        ? ''
        : 's'
    } detected and ${missingCount} missing.`,
    `${errorCount} blocking error${
      errorCount === 1
        ? ''
        : 's'
    } and ${warningCount} warning${
      warningCount === 1
        ? ''
        : 's'
    } identified.`,
    resultState,
    `Engineering status: ${status}.`,
  ].join(
    ' ',
  )
}

function buildInputSection(
  context:
    ProblemEngineeringReportContext,
): EngineeringReportSection {
  const items: string[] = []

  if (
    context.detectedInputs.length >
    0
  ) {
    items.push(
      `Detected inputs: ${
        context.detectedInputs.join(
          ', ',
        )
      }.`,
    )
  } else {
    items.push(
      'No required numerical inputs have been confidently detected.',
    )
  }

  if (
    context.missingInputs.length >
    0
  ) {
    items.push(
      `Missing inputs: ${
        context.missingInputs.join(
          ', ',
        )
      }.`,
    )
  } else {
    items.push(
      'No required inputs are currently marked as missing.',
    )
  }

  items.push(
    `Input readiness: ${context.readinessPercent}%.`,
  )

  return {
    title:
      'Input readiness',
    items:
      deduplicate(
        items,
      ),
  }
}

function buildDiagnosticSection(
  context:
    ProblemEngineeringReportContext,
): EngineeringReportSection {
  const items =
    context.diagnostics.map(
      (diagnostic) =>
        `${
          diagnostic.severity ===
            'error'
            ? 'Blocking error'
            : 'Warning'
        }: ${diagnostic.message}`,
    )

  if (
    items.length ===
    0
  ) {
    items.push(
      'No engineering input diagnostics were triggered.',
    )
  }

  return {
    title:
      'Engineering diagnostics',
    items:
      deduplicate(
        items,
      ),
  }
}

function createSection(
  title: string,
  values: string[],
  fallback: string,
): EngineeringReportSection {
  const items =
    deduplicate(
      values,
    )

  return {
    title,
    items:
      items.length > 0
        ? items
        : [
            fallback,
          ],
  }
}

export function buildProblemEngineeringReport(
  context:
    ProblemEngineeringReportContext,
): ProblemEngineeringReport {
  const status =
    determineStatus(
      context,
    )

  const sections = [
    buildInputSection(
      context,
    ),
    buildDiagnosticSection(
      context,
    ),
    createSection(
      'Solution blueprint',
      context.solutionPlan,
      'No solution blueprint is currently available.',
    ),
    createSection(
      'Engineering assumptions',
      context.assumptions,
      'Review the selected calculator documentation for model assumptions.',
    ),
    createSection(
      'Verification checklist',
      context.verificationChecklist,
      'Verify units, dimensions and physical plausibility.',
    ),
  ]

  return {
    status,
    headline:
      buildHeadline(
        status,
        context.title,
      ),
    summary:
      buildSummary(
        context,
        status,
      ),
    sections,
  }
}
