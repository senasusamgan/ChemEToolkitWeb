import {
  useState,
} from 'react'

import '../styles/engineering-validation-gate.css'

interface ValidationAssignment {
  symbol: string
  canonicalName: string
  value: number
  unit: string
}

interface ValidationQuickSolution {
  resultLabel: string
  resultValue: string
  numericValue: number
  unit: string
  equation: string
}

interface EngineeringValidationGateProps {
  calculatorTitle: string
  category: string
  targetName:
    string | null
  readinessPercent: number
  status: string
  missingVariables: string[]
  diagnostics: string[]
  assignments:
    ValidationAssignment[]
  quickSolution:
    ValidationQuickSolution | null
}

type ValidationLevel =
  | 'pass'
  | 'review'
  | 'block'

interface ValidationFinding {
  level: ValidationLevel
  title: string
  detail: string
}

interface ValidationCheck {
  label: string
  value: string
  state: ValidationLevel
}

const DIMENSIONLESS_SYMBOLS =
  new Set([
    'Re',
    'Pr',
    'Sc',
    'Nu',
    'Sh',
    'Bi',
    'Fo',
    'Pe',
    'Da',
    'f',
    'x',
    'y',
    'z',
  ])

function levelLabel(
  level: ValidationLevel,
): string {
  if (level === 'pass') {
    return 'Pass'
  }

  if (level === 'review') {
    return 'Review'
  }

  return 'Blocked'
}

function checkPhysicalPlausibility(
  assignment:
    ValidationAssignment,
): ValidationFinding[] {
  const findings:
    ValidationFinding[] = []

  const descriptor =
    [
      assignment.symbol,
      assignment.canonicalName,
      assignment.unit,
    ]
      .join(' ')
      .toLocaleLowerCase(
        'en-US',
      )

  if (
    !Number.isFinite(
      assignment.value,
    )
  ) {
    findings.push({
      level:
        'block',
      title:
        `${assignment.symbol} is not finite`,
      detail:
        'Replace NaN or infinite values with a finite engineering input.',
    })

    return findings
  }

  const absoluteTemperature =
    (
      assignment.symbol ===
        'T' ||
      descriptor.includes(
        'absolute temperature',
      )
    ) &&
    assignment.unit
      .trim()
      .toLocaleLowerCase(
        'en-US',
      ) ===
      'k'

  if (
    absoluteTemperature &&
    assignment.value <=
      0
  ) {
    findings.push({
      level:
        'block',
      title:
        'Absolute temperature is not physically valid',
      detail:
        `${assignment.symbol} must be greater than 0 K.`,
    })
  }

  const positiveQuantity =
    [
      'density',
      'viscosity',
      'diameter',
      'pipe length',
      'surface roughness',
      'area',
      'volume',
      'amount of gas',
      'thermal conductivity',
      'diffusivity',
      'heat transfer coefficient',
      'mass transfer coefficient',
    ].some(
      (keyword) =>
        descriptor.includes(
          keyword,
        ),
    )

  if (
    positiveQuantity &&
    assignment.value <=
      0
  ) {
    findings.push({
      level:
        'block',
      title:
        `${assignment.canonicalName} must be positive`,
      detail:
        `${assignment.symbol} = ${assignment.value} is outside the valid physical domain.`,
    })
  }

  const boundedFraction =
    [
      'fraction',
      'conversion',
      'efficiency',
      'yield',
      'selectivity',
      'effectiveness',
    ].some(
      (keyword) =>
        descriptor.includes(
          keyword,
        ),
    )

  if (
    boundedFraction &&
    (
      assignment.value <
        0 ||
      assignment.value >
        1
    )
  ) {
    findings.push({
      level:
        'review',
      title:
        `${assignment.canonicalName} is outside 0–1`,
      detail:
        'Confirm whether this value is expressed as a fraction or as a percentage.',
    })
  }

  return findings
}

function createValidationSummary(
  calculatorTitle: string,
  category: string,
  score: number,
  overallStatus: string,
  checks: ValidationCheck[],
  findings: ValidationFinding[],
): string {
  return [
    'ChemE Toolkit Engineering Validation',
    '',
    `Calculator: ${calculatorTitle}`,
    `Category: ${category}`,
    `Quality score: ${score}/100`,
    `Status: ${overallStatus}`,
    '',
    'VALIDATION CHECKS',
    ...checks.map(
      (check) =>
        `- ${check.label}: ${check.value} [${levelLabel(check.state)}]`,
    ),
    '',
    'ENGINEERING FINDINGS',
    ...(
      findings.length >
      0
        ? findings.map(
            (finding) =>
              `- ${finding.title}: ${finding.detail}`,
          )
        : [
            '- No blocking engineering issues detected.',
          ]
    ),
    '',
    'Always confirm assumptions, units and physical plausibility before design use.',
  ].join(
    '\n',
  )
}

export function EngineeringValidationGate({
  calculatorTitle,
  category,
  targetName,
  readinessPercent,
  status,
  missingVariables,
  diagnostics,
  assignments,
  quickSolution,
}: EngineeringValidationGateProps) {
  const [
    copyMessage,
    setCopyMessage,
  ] = useState('')

  const assignmentsWithoutUnits =
    assignments.filter(
      (assignment) =>
        assignment.unit
          .trim()
          .length ===
          0 &&
        !DIMENSIONLESS_SYMBOLS.has(
          assignment.symbol,
        ),
    )

  const physicalFindings =
    assignments.flatMap(
      checkPhysicalPlausibility,
    )

  const findings:
    ValidationFinding[] = [
      ...(
        missingVariables.length >
        0
          ? [
              {
                level:
                  'block' as const,
                title:
                  'Required inputs are missing',
                detail:
                  missingVariables.join(
                    ', ',
                  ),
              },
            ]
          : []
      ),
      ...(
        !targetName
          ? [
              {
                level:
                  'review' as const,
                title:
                  'Requested unknown is not explicit',
                detail:
                  'Add “solve for …” or mark the target variable with ?.',
              },
            ]
          : []
      ),
      ...(
        assignmentsWithoutUnits.length >
        0
          ? [
              {
                level:
                  'review' as const,
                title:
                  'Some inputs have no recognized unit',
                detail:
                  assignmentsWithoutUnits
                    .map(
                      (assignment) =>
                        assignment.symbol,
                    )
                    .join(
                      ', ',
                    ),
              },
            ]
          : []
      ),
      ...diagnostics.map(
        (
          diagnostic,
        ): ValidationFinding => ({
          level:
            'review',
          title:
            'Equation context diagnostic',
          detail:
            diagnostic,
        }),
      ),
      ...physicalFindings,
      ...(
        !quickSolution
          ? [
              {
                level:
                  'block' as const,
                title:
                  'Quick Solve result is not available',
                detail:
                  'Complete the required variables or open the matched calculator.',
              },
            ]
          : []
      ),
    ]

  const unitCoverage =
    assignments.length ===
    0
      ? 0
      : Math.round(
          (
            (
              assignments.length -
              assignmentsWithoutUnits.length
            ) /
            assignments.length
          ) *
            100,
        )

  const checks:
    ValidationCheck[] = [
      {
        label:
          'Model recognition',
        value:
          calculatorTitle,
        state:
          calculatorTitle
            .trim()
            .length >
          0
            ? 'pass'
            : 'block',
      },
      {
        label:
          'Requested unknown',
        value:
          targetName ??
          'Not explicit',
        state:
          targetName
            ? 'pass'
            : 'review',
      },
      {
        label:
          'Input completeness',
        value:
          missingVariables.length ===
          0
            ? 'All required inputs available'
            : `Missing ${missingVariables.join(', ')}`,
        state:
          missingVariables.length ===
          0
            ? 'pass'
            : 'block',
      },
      {
        label:
          'Unit coverage',
        value:
          assignments.length ===
          0
            ? 'No parsed inputs'
            : `${unitCoverage}% of parsed inputs`,
        state:
          assignments.length ===
          0
            ? 'review'
            : assignmentsWithoutUnits.length ===
                0
              ? 'pass'
              : 'review',
      },
      {
        label:
          'Equation diagnostics',
        value:
          diagnostics.length ===
          0
            ? 'No contextual conflicts'
            : `${diagnostics.length} item(s) require review`,
        state:
          diagnostics.length ===
          0
            ? 'pass'
            : 'review',
      },
      {
        label:
          'Numerical result',
        value:
          quickSolution
            ? `${quickSolution.resultLabel} = ${quickSolution.resultValue}`
            : 'Not available',
        state:
          quickSolution
            ? 'pass'
            : 'block',
      },
    ]

  let qualityScore =
    0

  if (
    calculatorTitle
      .trim()
      .length >
    0
  ) {
    qualityScore +=
      15
  }

  if (targetName) {
    qualityScore +=
      15
  }

  if (
    missingVariables.length ===
    0
  ) {
    qualityScore +=
      25
  }

  if (quickSolution) {
    qualityScore +=
      25
  }

  if (
    diagnostics.length ===
    0
  ) {
    qualityScore +=
      10
  }

  if (
    assignments.length >
      0 &&
    assignmentsWithoutUnits.length ===
      0
  ) {
    qualityScore +=
      10
  }

  const hasBlocker =
    findings.some(
      (finding) =>
        finding.level ===
        'block',
    )

  const hasReview =
    findings.some(
      (finding) =>
        finding.level ===
        'review',
    )

  const overallLevel:
    ValidationLevel =
      hasBlocker
        ? 'block'
        : hasReview
          ? 'review'
          : 'pass'

  const overallStatus =
    overallLevel ===
    'pass'
      ? 'Verified'
      : overallLevel ===
          'review'
        ? 'Engineering review required'
        : 'Blocked by missing or invalid inputs'

  async function copyValidationSummary() {
    const summary =
      createValidationSummary(
        calculatorTitle,
        category,
        qualityScore,
        overallStatus,
        checks,
        findings,
      )

    try {
      if (
        navigator.clipboard &&
        typeof navigator
          .clipboard
          .writeText ===
          'function'
      ) {
        await navigator
          .clipboard
          .writeText(
            summary,
          )
      } else {
        const textArea =
          document.createElement(
            'textarea',
          )

        textArea.value =
          summary

        textArea.setAttribute(
          'readonly',
          '',
        )

        textArea.style.position =
          'fixed'

        textArea.style.opacity =
          '0'

        document.body.appendChild(
          textArea,
        )

        textArea.select()

        const copied =
          document.execCommand(
            'copy',
          )

        textArea.remove()

        if (!copied) {
          throw new Error(
            'Copy command failed.',
          )
        }
      }

      setCopyMessage(
        'Validation summary copied.',
      )
    } catch {
      setCopyMessage(
        'Validation summary could not be copied.',
      )
    }
  }

  return (
    <section
      className="engineering-validation-gate"
      data-status={
        overallLevel
      }
      aria-labelledby="engineering-validation-title"
    >
      <header className="engineering-validation-header">
        <div>
          <span>
            Engineering quality gate
          </span>

          <h4 id="engineering-validation-title">
            Engineering validation
          </h4>

          <p>
            Automated checks for completeness, units,
            equation context and physical plausibility.
          </p>
        </div>

        <div className="engineering-validation-score">
          <strong>
            {qualityScore}
          </strong>

          <span>
            / 100
          </span>
        </div>
      </header>

      <div className="engineering-validation-status">
        <div>
          <span>
            Validation status
          </span>

          <strong>
            {overallStatus}
          </strong>
        </div>

        <div>
          <span>
            Solver readiness
          </span>

          <strong>
            {readinessPercent}%
          </strong>
        </div>

        <div>
          <span>
            Equation state
          </span>

          <strong>
            {status}
          </strong>
        </div>

        <div>
          <span>
            Physical findings
          </span>

          <strong>
            {physicalFindings.length}
          </strong>
        </div>
      </div>

      <div className="engineering-validation-checks">
        {checks.map(
          (
            check,
            index,
          ) => (
            <article
              key={
                check.label +
                index
              }
              data-state={
                check.state
              }
            >
              <span>
                {check.label}
              </span>

              <strong>
                {check.value}
              </strong>

              <small>
                {
                  levelLabel(
                    check.state,
                  )
                }
              </small>
            </article>
          ),
        )}
      </div>

      <div className="engineering-validation-findings">
        <span>
          Validation findings
        </span>

        {findings.length > 0 ? (
          <div>
            {findings.map(
              (
                finding,
                index,
              ) => (
                <article
                  key={
                    finding.title +
                    index
                  }
                  data-level={
                    finding.level
                  }
                >
                  <div>
                    <strong>
                      {finding.title}
                    </strong>

                    <small>
                      {
                        levelLabel(
                          finding.level,
                        )
                      }
                    </small>
                  </div>

                  <p>
                    {finding.detail}
                  </p>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="engineering-validation-clear">
            <strong>
              No blocking engineering issues detected
            </strong>

            <p>
              Parsed inputs, units and Quick Solve result
              passed the current automated checks.
            </p>
          </div>
        )}
      </div>

      <footer className="engineering-validation-footer">
        <div>
          <strong>
            Engineering judgment remains required
          </strong>

          <span>
            Confirm assumptions, correlations and valid
            operating ranges before design use.
          </span>
        </div>

        <button
          type="button"
          onClick={
            copyValidationSummary
          }
        >
          Copy validation summary
        </button>
      </footer>

      {copyMessage ? (
        <p
          className="engineering-validation-feedback"
          role="status"
        >
          {copyMessage}
        </p>
      ) : null}
    </section>
  )
}
