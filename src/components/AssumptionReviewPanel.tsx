import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import '../styles/assumption-review-panel.css'

interface ReviewAssignment {
  symbol: string
  canonicalName: string
  value: number
  unit: string
}

interface ReviewQuickSolution {
  resultLabel: string
  resultValue: string
  numericValue: number
  unit: string
}

interface AssumptionReviewPanelProps {
  baseQuery: string
  calculatorTitle: string
  equationLabel: string
  equation: string
  targetName:
    string | null
  assignments:
    ReviewAssignment[]
  quickSolution:
    ReviewQuickSolution | null
}

type AssumptionStatus =
  | 'pending'
  | 'confirmed'
  | 'review'
  | 'not-applicable'

interface AssumptionItem {
  id: string
  category: string
  title: string
  detail: string
  evidence: string
}

interface AssumptionProfile {
  id: string
  modelName: string
  keywords: string[]
  assumptions:
    Array<
      Omit<
        AssumptionItem,
        'id'
      >
    >
}

interface PersistedReview {
  statuses?:
    Record<
      string,
      unknown
    >
  notes?: unknown
}

const STORAGE_PREFIX =
  'cheme-toolkit.assumption-review.v1.'

const ASSUMPTION_PROFILES:
  AssumptionProfile[] = [
    {
      id:
        'ideal-gas',
      modelName:
        'Ideal Gas Law',
      keywords: [
        'ideal gas',
        'pv=nrt',
        'pv = nrt',
      ],
      assumptions: [
        {
          category:
            'Thermodynamic model',
          title:
            'Ideal-gas behavior is acceptable',
          detail:
            'Gas molecules are treated as having negligible volume and intermolecular forces.',
          evidence:
            'Review pressure, temperature and gas identity before relying on the ideal-gas approximation.',
        },
        {
          category:
            'Phase condition',
          title:
            'The system remains in a single gas phase',
          detail:
            'No condensation, two-phase behavior or liquid formation occurs at the stated conditions.',
          evidence:
            'Compare the operating state with saturation or phase-equilibrium information.',
        },
        {
          category:
            'Measurement basis',
          title:
            'Pressure and temperature are absolute',
          detail:
            'The equation requires absolute pressure and thermodynamic temperature.',
          evidence:
            'Gauge pressure and Celsius values must be converted before substitution.',
        },
        {
          category:
            'System condition',
          title:
            'The evaluated state is uniform and at equilibrium',
          detail:
            'A single pressure and temperature adequately represent the complete gas system.',
          evidence:
            'Confirm that strong spatial gradients or rapid transients are absent.',
        },
      ],
    },
    {
      id:
        'reynolds',
      modelName:
        'Reynolds Number',
      keywords: [
        'reynolds',
        're=ρvd/μ',
        're=rhovd/mu',
      ],
      assumptions: [
        {
          category:
            'Fluid model',
          title:
            'The fluid is Newtonian',
          detail:
            'Dynamic viscosity is independent of shear rate over the evaluated operating range.',
          evidence:
            'Non-Newtonian slurries and polymer solutions may require a generalized Reynolds number.',
        },
        {
          category:
            'Property basis',
          title:
            'Density and viscosity use the same state',
          detail:
            'Fluid properties correspond to the same temperature, pressure and composition.',
          evidence:
            'Property values taken at different temperatures can distort the predicted flow regime.',
        },
        {
          category:
            'Characteristic scale',
          title:
            'The selected diameter is physically appropriate',
          detail:
            'Internal diameter or hydraulic diameter represents the actual flow passage.',
          evidence:
            'Use hydraulic diameter for non-circular channels.',
        },
        {
          category:
            'Flow representation',
          title:
            'Velocity represents the bulk average',
          detail:
            'The entered velocity is the cross-sectional mean rather than a local peak value.',
          evidence:
            'Maximum centerline velocity should not be substituted directly.',
        },
      ],
    },
    {
      id:
        'continuity',
      modelName:
        'Flow Continuity',
      keywords: [
        'continuity',
        'q=av',
        'q = av',
        'flow velocity',
      ],
      assumptions: [
        {
          category:
            'Conservation basis',
          title:
            'The evaluated flow is steady',
          detail:
            'Accumulation inside the selected control volume is negligible.',
          evidence:
            'Transient filling or draining requires an accumulation term.',
        },
        {
          category:
            'Flow field',
          title:
            'Velocity is represented by a cross-sectional average',
          detail:
            'The relation Q=A·v uses average bulk velocity.',
          evidence:
            'Local velocities should be integrated over the area when the profile is strongly non-uniform.',
        },
        {
          category:
            'Geometry',
          title:
            'Area and velocity refer to the same section',
          detail:
            'The selected flow area corresponds directly to the stated velocity.',
          evidence:
            'Avoid combining an upstream area with a downstream velocity.',
        },
        {
          category:
            'Phase behavior',
          title:
            'The volumetric-flow basis is valid',
          detail:
            'Density changes, compressibility or phase generation do not invalidate the selected volume basis.',
          evidence:
            'Use mass continuity when density varies significantly.',
        },
      ],
    },
    {
      id:
        'darcy',
      modelName:
        'Darcy–Weisbach',
      keywords: [
        'darcy',
        'weisbach',
        'pressure difference',
        'pressure drop',
      ],
      assumptions: [
        {
          category:
            'Friction convention',
          title:
            'The entered factor is the Darcy friction factor',
          detail:
            'The Darcy factor is four times the Fanning friction factor.',
          evidence:
            'Confirm the convention used by the selected correlation or chart.',
        },
        {
          category:
            'Flow development',
          title:
            'Internal flow is sufficiently developed',
          detail:
            'The equation represents distributed wall-friction loss in an established flow region.',
          evidence:
            'Entrance effects may require a separate correction.',
        },
        {
          category:
            'Property basis',
          title:
            'Fluid properties remain approximately constant',
          detail:
            'Density and viscosity changes along the pipe do not materially alter the calculation.',
          evidence:
            'Large temperature or pressure changes may require segment-by-segment evaluation.',
        },
        {
          category:
            'Loss accounting',
          title:
            'Minor losses are handled separately',
          detail:
            'Valves, fittings, contractions and expansions are not included unless explicitly added.',
          evidence:
            'Add K·ρv²/2 terms or equivalent lengths where appropriate.',
        },
      ],
    },
    {
      id:
        'pump',
      modelName:
        'Pump Power',
      keywords: [
        'pump power',
        'pump',
        'ρgqh',
      ],
      assumptions: [
        {
          category:
            'Flow condition',
          title:
            'The pumped fluid is effectively incompressible',
          detail:
            'Density remains sufficiently constant through the pump.',
          evidence:
            'Gas compression requires a different energy model.',
        },
        {
          category:
            'Efficiency basis',
          title:
            'Efficiency is entered as a decimal fraction',
          detail:
            'For example, 80% efficiency must be entered as 0.80.',
          evidence:
            'Using 80 instead of 0.80 produces a two-order-of-magnitude error.',
        },
        {
          category:
            'Head definition',
          title:
            'Total head includes all intended contributions',
          detail:
            'Static, pressure, velocity and friction-head requirements are consistently represented.',
          evidence:
            'Confirm whether the entered head is pump head or only elevation difference.',
        },
        {
          category:
            'Power definition',
          title:
            'The required power basis is understood',
          detail:
            'Hydraulic power, shaft power and electrical input power are distinct quantities.',
          evidence:
            'Additional motor or drive efficiency may be required.',
        },
      ],
    },
    {
      id:
        'heat-exchanger',
      modelName:
        'Heat Exchanger',
      keywords: [
        'heat exchanger',
        'heat-transfer rate',
        'heat transfer rate',
        'lmtd',
        'uat',
      ],
      assumptions: [
        {
          category:
            'Operating condition',
          title:
            'The exchanger operates at steady state',
          detail:
            'Thermal accumulation in the equipment and fluids is negligible.',
          evidence:
            'Startup and shutdown calculations require transient energy balances.',
        },
        {
          category:
            'Heat-loss basis',
          title:
            'External heat losses are negligible or included',
          detail:
            'The heat duty transferred between process streams matches the modeled duty.',
          evidence:
            'Poor insulation may require an environmental-loss term.',
        },
        {
          category:
            'Overall coefficient',
          title:
            'The overall coefficient is appropriate for the area basis',
          detail:
            'U is referenced to the same surface area used in Q=U·A·ΔTlm.',
          evidence:
            'Inside-area and outside-area coefficients cannot be mixed without conversion.',
        },
        {
          category:
            'Temperature driving force',
          title:
            'The LMTD method is applicable',
          detail:
            'Terminal temperature differences and flow arrangement support the selected LMTD expression.',
          evidence:
            'Multipass or crossflow exchangers may require a correction factor.',
        },
      ],
    },
    {
      id:
        'fick',
      modelName:
        'Fickian Diffusion',
      keywords: [
        'fick',
        'diffusion',
        'molar flux',
      ],
      assumptions: [
        {
          category:
            'Transport model',
          title:
            'Fickian diffusion is an appropriate representation',
          detail:
            'The flux is proportional to the concentration gradient.',
          evidence:
            'Strong multicomponent coupling may require Stefan–Maxwell equations.',
        },
        {
          category:
            'Dimensionality',
          title:
            'Transport is adequately one-dimensional',
          detail:
            'Concentration variation in other directions is negligible.',
          evidence:
            'Complex geometries may require cylindrical, spherical or multidimensional treatment.',
        },
        {
          category:
            'Property basis',
          title:
            'Diffusivity is approximately constant',
          detail:
            'Temperature, pressure and composition changes do not strongly vary the diffusion coefficient.',
          evidence:
            'Variable diffusivity requires integration or numerical solution.',
        },
        {
          category:
            'Reaction coupling',
          title:
            'Chemical reaction does not alter the selected balance',
          detail:
            'No significant generation or consumption occurs inside the diffusion path.',
          evidence:
            'Reactive diffusion requires a reaction source term.',
        },
      ],
    },
  ]

const GENERAL_ASSUMPTIONS:
  Array<
    Omit<
      AssumptionItem,
      'id'
    >
  > = [
    {
      category:
        'Units and basis',
      title:
        'All values use a consistent engineering basis',
      detail:
        'Units, reference states and extensive or intensive bases are mutually compatible.',
      evidence:
        'Review every parsed unit and normalize values before calculation.',
    },
    {
      category:
        'Operating point',
      title:
        'All inputs describe the same operating condition',
      detail:
        'Measurements and properties correspond to the same stream, location and time basis.',
      evidence:
        'Do not combine nominal, design and measured values without documenting the difference.',
    },
    {
      category:
        'Result interpretation',
      title:
        'The calculated result is physically plausible',
      detail:
        'Magnitude, sign and unit agree with expected engineering behavior.',
      evidence:
        'Compare with an independent estimate, limiting case or trusted reference.',
    },
  ]

function normalizeText(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'en-US',
    )
    .replace(
      /[–—−]/g,
      '-',
    )
    .replace(
      /\s+/g,
      ' ',
    )
}

function createAssumptions(
  calculatorTitle: string,
  equationLabel: string,
  equation: string,
): {
  modelName: string
  items:
    AssumptionItem[]
} {
  const modelText =
    normalizeText(
      [
        calculatorTitle,
        equationLabel,
        equation,
      ].join(
        ' ',
      ),
    )

  const profile =
    ASSUMPTION_PROFILES.find(
      (candidate) =>
        candidate
          .keywords
          .some(
            (keyword) =>
              modelText.includes(
                normalizeText(
                  keyword,
                ),
              ),
          ),
    )

  const profileItems =
    profile
      ?.assumptions ??
    [
      {
        category:
          'Model selection',
        title:
          'The selected equation matches the physical mechanism',
        detail:
          'The matched calculator represents the dominant engineering behavior.',
        evidence:
          'Confirm geometry, phase, regime and boundary conditions.',
      },
      {
        category:
          'Correlation range',
        title:
          'The model is used inside its valid operating range',
        detail:
          'Dimensionless groups and property ranges remain within published limits.',
        evidence:
          'Consult the calculator reference or original correlation.',
      },
    ]

  const combinedItems = [
    ...profileItems,
    ...GENERAL_ASSUMPTIONS,
  ]

  return {
    modelName:
      profile
        ?.modelName ??
      calculatorTitle,
    items:
      combinedItems.map(
        (
          assumption,
          index,
        ) => ({
          ...assumption,
          id:
            `${
              profile
                ?.id ??
              'general'
            }-${index + 1}`,
        }),
      ),
  }
}

function createStorageHash(
  value: string,
): string {
  let hash =
    2166136261

  for (
    let index =
      0;
    index <
    value.length;
    index +=
      1
  ) {
    hash ^=
      value.charCodeAt(
        index,
      )

    hash =
      Math.imul(
        hash,
        16777619,
      )
  }

  return (
    hash >>>
    0
  ).toString(
    16,
  )
}

function isAssumptionStatus(
  value: unknown,
): value is AssumptionStatus {
  return (
    value ===
      'pending' ||
    value ===
      'confirmed' ||
    value ===
      'review' ||
    value ===
      'not-applicable'
  )
}

function statusLabel(
  status:
    AssumptionStatus,
): string {
  if (
    status ===
    'confirmed'
  ) {
    return 'Confirmed'
  }

  if (
    status ===
    'review'
  ) {
    return 'Review'
  }

  if (
    status ===
    'not-applicable'
  ) {
    return 'N/A'
  }

  return 'Pending'
}

function formatEngineeringNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  const absoluteValue =
    Math.abs(
      value,
    )

  if (
    absoluteValue !==
      0 &&
    (
      absoluteValue >=
        1e6 ||
      absoluteValue <
        1e-4
    )
  ) {
    return value
      .toExponential(
        5,
      )
  }

  return Number(
    value.toPrecision(
      8,
    ),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        9,
    },
  )
}

async function copyText(
  value: string,
): Promise<void> {
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
        value,
      )

    return
  }

  const textArea =
    document.createElement(
      'textarea',
    )

  textArea.value =
    value

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
      'Browser copy command failed.',
    )
  }
}

export function AssumptionReviewPanel({
  baseQuery,
  calculatorTitle,
  equationLabel,
  equation,
  targetName,
  assignments,
  quickSolution,
}: AssumptionReviewPanelProps) {
  const reviewDefinition =
    useMemo(
      () =>
        createAssumptions(
          calculatorTitle,
          equationLabel,
          equation,
        ),
      [
        calculatorTitle,
        equation,
        equationLabel,
      ],
    )

  const assumptions =
    reviewDefinition.items

  const assumptionSignature =
    assumptions
      .map(
        (assumption) =>
          assumption.id,
      )
      .join(
        '|',
      )

  const storageKey =
    useMemo(
      () =>
        STORAGE_PREFIX +
        createStorageHash(
          normalizeText(
            baseQuery,
          ),
        ),
      [
        baseQuery,
      ],
    )

  const [
    statuses,
    setStatuses,
  ] = useState<
    Record<
      string,
      AssumptionStatus
    >
  >({})

  const [
    engineeringNotes,
    setEngineeringNotes,
  ] = useState('')

  const [
    hydratedStorageKey,
    setHydratedStorageKey,
  ] = useState('')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  useEffect(
    () => {
      const nextStatuses:
        Record<
          string,
          AssumptionStatus
        > = {}

      let nextNotes =
        ''

      try {
        const rawValue =
          window.localStorage.getItem(
            storageKey,
          )

        if (rawValue) {
          const parsed =
            JSON.parse(
              rawValue,
            ) as PersistedReview

          const validIds =
            new Set(
              assumptionSignature
                .split(
                  '|',
                )
                .filter(
                  Boolean,
                ),
            )

          if (
            parsed.statuses &&
            typeof parsed.statuses ===
              'object'
          ) {
            for (
              const [
                assumptionId,
                status,
              ]
              of Object.entries(
                parsed.statuses,
              )
            ) {
              if (
                validIds.has(
                  assumptionId,
                ) &&
                isAssumptionStatus(
                  status,
                )
              ) {
                nextStatuses[
                  assumptionId
                ] =
                  status
              }
            }
          }

          if (
            typeof parsed.notes ===
            'string'
          ) {
            nextNotes =
              parsed.notes
          }
        }
      } catch {
        nextNotes =
          ''
      }

      setStatuses(
        nextStatuses,
      )

      setEngineeringNotes(
        nextNotes,
      )

      setFeedbackMessage(
        '',
      )

      setHydratedStorageKey(
        storageKey,
      )
    },
    [
      assumptionSignature,
      storageKey,
    ],
  )

  useEffect(
    () => {
      if (
        hydratedStorageKey !==
        storageKey
      ) {
        return
      }

      const payload = {
        statuses,
        notes:
          engineeringNotes,
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify(
          payload,
        ),
      )
    },
    [
      engineeringNotes,
      hydratedStorageKey,
      statuses,
      storageKey,
    ],
  )

  const statusCounts =
    useMemo(
      () => {
        const counts = {
          pending:
            0,
          confirmed:
            0,
          review:
            0,
          notApplicable:
            0,
        }

        for (
          const assumption
          of assumptions
        ) {
          const status =
            statuses[
              assumption.id
            ] ??
            'pending'

          if (
            status ===
            'confirmed'
          ) {
            counts.confirmed +=
              1
          } else if (
            status ===
            'review'
          ) {
            counts.review +=
              1
          } else if (
            status ===
            'not-applicable'
          ) {
            counts.notApplicable +=
              1
          } else {
            counts.pending +=
              1
          }
        }

        return counts
      },
      [
        assumptions,
        statuses,
      ],
    )

  const addressedCount =
    assumptions.length -
    statusCounts.pending

  const reviewScore =
    assumptions.length ===
    0
      ? 0
      : Math.round(
          (
            statusCounts.confirmed +
            statusCounts.notApplicable +
            statusCounts.review *
              0.5
          ) /
            assumptions.length *
            100,
        )

  const overallState =
    statusCounts.pending >
    0
      ? 'pending'
      : statusCounts.review >
          0
        ? 'review'
        : 'verified'

  const overallLabel =
    overallState ===
    'verified'
      ? 'Assumptions verified'
      : overallState ===
          'review'
        ? 'Engineering review required'
        : 'Assumption review incomplete'

  function changeStatus(
    assumptionId: string,
    nextStatus:
      AssumptionStatus,
  ) {
    setStatuses(
      (
        currentStatuses,
      ) => {
        const currentStatus =
          currentStatuses[
            assumptionId
          ] ??
          'pending'

        return {
          ...currentStatuses,
          [assumptionId]:
            currentStatus ===
            nextStatus
              ? 'pending'
              : nextStatus,
        }
      },
    )

    setFeedbackMessage(
      '',
    )
  }

  function confirmAllAssumptions() {
    setStatuses(
      Object.fromEntries(
        assumptions.map(
          (assumption) => [
            assumption.id,
            'confirmed' as const,
          ],
        ),
      ),
    )

    setFeedbackMessage(
      'All assumptions marked as confirmed.',
    )
  }

  function resetAssumptionReview() {
    setStatuses({})
    setEngineeringNotes('')

    window.localStorage.removeItem(
      storageKey,
    )

    setFeedbackMessage(
      'Assumption review reset.',
    )
  }

  async function copyAssumptionRegister() {
    const inputLines =
      assignments.length >
      0
        ? assignments.map(
            (assignment) =>
              `- ${assignment.symbol} = ${formatEngineeringNumber(assignment.value)}${assignment.unit ? ` ${assignment.unit}` : ''} (${assignment.canonicalName})`,
          )
        : [
            '- No parsed assignments.',
          ]

    const assumptionLines =
      assumptions.flatMap(
        (
          assumption,
          index,
        ) => {
          const status =
            statuses[
              assumption.id
            ] ??
            'pending'

          return [
            `${index + 1}. ${assumption.title} [${statusLabel(status)}]`,
            `   Category: ${assumption.category}`,
            `   Basis: ${assumption.detail}`,
            `   Verification: ${assumption.evidence}`,
          ]
        },
      )

    const register = [
      'ChemE Toolkit Engineering Assumption Register',
      '',
      `Calculator: ${calculatorTitle}`,
      `Model: ${reviewDefinition.modelName}`,
      `Equation: ${equation || equationLabel}`,
      `Target: ${targetName ?? quickSolution?.resultLabel ?? 'Not explicit'}`,
      `Review score: ${reviewScore}/100`,
      `Status: ${overallLabel}`,
      '',
      'INPUT EVIDENCE',
      ...inputLines,
      '',
      'ASSUMPTIONS',
      ...assumptionLines,
      '',
      'CALCULATED RESULT',
      quickSolution
        ? `${quickSolution.resultLabel} = ${quickSolution.resultValue}`
        : 'Quick Solve result is not available.',
      '',
      'ENGINEERING NOTES',
      engineeringNotes.trim() ||
        'No additional engineering notes.',
      '',
      'Final design use requires independent engineering judgment.',
    ].join(
      '\n',
    )

    try {
      await copyText(
        register,
      )

      setFeedbackMessage(
        'Engineering assumption register copied.',
      )
    } catch {
      setFeedbackMessage(
        'Assumption register could not be copied.',
      )
    }
  }

  return (
    <section
      className="assumption-review-panel"
      data-state={
        overallState
      }
      data-expanded={
        isExpanded
          ? 'true'
          : 'false'
      }
      aria-labelledby="assumption-review-title"
    >
      <header className="assumption-review-launcher">
        <div>
          <span>
            Engineering decision control
          </span>

          <h4 id="assumption-review-title">
            Engineering assumption review
          </h4>

          <p>
            {
              reviewDefinition
                .modelName
            }
            {' · '}
            {
              assumptions.length
            }
            {' model and basis assumptions'}
          </p>
        </div>

        <div className="assumption-review-launcher-actions">
          <div>
            <span>
              Review score
            </span>

            <strong>
              {reviewScore}
              /100
            </strong>

            <small>
              {overallLabel}
            </small>
          </div>

          <button
            type="button"
            aria-expanded={
              isExpanded
            }
            onClick={() => {
              setIsExpanded(
                (current) =>
                  !current,
              )

              setFeedbackMessage(
                '',
              )
            }}
          >
            {
              isExpanded
                ? 'Hide assumptions'
                : 'Review assumptions'
            }
          </button>
        </div>
      </header>

      {isExpanded ? (
        <div className="assumption-review-content">
          <div className="assumption-review-summary">
            <article>
              <span>
                Addressed
              </span>

              <strong>
                {addressedCount}
                {' / '}
                {
                  assumptions.length
                }
              </strong>
            </article>

            <article data-state="confirmed">
              <span>
                Confirmed
              </span>

              <strong>
                {
                  statusCounts.confirmed
                }
              </strong>
            </article>

            <article data-state="review">
              <span>
                Review
              </span>

              <strong>
                {
                  statusCounts.review
                }
              </strong>
            </article>

            <article data-state="pending">
              <span>
                Pending
              </span>

              <strong>
                {
                  statusCounts.pending
                }
              </strong>
            </article>

            <article>
              <span>
                Not applicable
              </span>

              <strong>
                {
                  statusCounts.notApplicable
                }
              </strong>
            </article>
          </div>

          <div className="assumption-review-progress">
            <div>
              <span>
                Review completion
              </span>

              <strong>
                {
                  Math.round(
                    addressedCount /
                      Math.max(
                        1,
                        assumptions.length,
                      ) *
                      100,
                  )
                }%
              </strong>
            </div>

            <progress
              max={
                Math.max(
                  1,
                  assumptions.length,
                )
              }
              value={
                addressedCount
              }
            />
          </div>

          <div className="assumption-review-list">
            {assumptions.map(
              (
                assumption,
                index,
              ) => {
                const status =
                  statuses[
                    assumption.id
                  ] ??
                  'pending'

                return (
                  <article
                    key={
                      assumption.id
                    }
                    data-status={
                      status
                    }
                  >
                    <header>
                      <div className="assumption-review-number">
                        {
                          index +
                          1
                        }
                      </div>

                      <div>
                        <span>
                          {
                            assumption.category
                          }
                        </span>

                        <h5>
                          {
                            assumption.title
                          }
                        </h5>
                      </div>

                      <strong>
                        {
                          statusLabel(
                            status,
                          )
                        }
                      </strong>
                    </header>

                    <p>
                      {
                        assumption.detail
                      }
                    </p>

                    <div className="assumption-review-evidence">
                      <span>
                        Verification basis
                      </span>

                      <p>
                        {
                          assumption.evidence
                        }
                      </p>
                    </div>

                    <footer>
                      <button
                        type="button"
                        className={
                          status ===
                          'confirmed'
                            ? 'is-active'
                            : undefined
                        }
                        onClick={() =>
                          changeStatus(
                            assumption.id,
                            'confirmed',
                          )
                        }
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        className={
                          status ===
                          'review'
                            ? 'is-active is-review'
                            : undefined
                        }
                        onClick={() =>
                          changeStatus(
                            assumption.id,
                            'review',
                          )
                        }
                      >
                        Needs review
                      </button>

                      <button
                        type="button"
                        className={
                          status ===
                          'not-applicable'
                            ? 'is-active is-na'
                            : undefined
                        }
                        onClick={() =>
                          changeStatus(
                            assumption.id,
                            'not-applicable',
                          )
                        }
                      >
                        Not applicable
                      </button>
                    </footer>
                  </article>
                )
              },
            )}
          </div>

          <div className="assumption-review-evidence-snapshot">
            <div>
              <span>
                Model evidence
              </span>

              <strong>
                {equation ||
                  equationLabel}
              </strong>
            </div>

            <div>
              <span>
                Requested target
              </span>

              <strong>
                {
                  targetName ??
                  quickSolution
                    ?.resultLabel ??
                  'Not explicit'
                }
              </strong>
            </div>

            <div>
              <span>
                Parsed inputs
              </span>

              <strong>
                {
                  assignments.length
                }
              </strong>
            </div>

            <div>
              <span>
                Result
              </span>

              <strong>
                {
                  quickSolution
                    ? `${quickSolution.resultLabel} = ${quickSolution.resultValue}`
                    : 'Not available'
                }
              </strong>
            </div>
          </div>

          <label className="assumption-review-notes">
            <span>
              Engineering notes and exceptions
            </span>

            <textarea
              rows={4}
              value={
                engineeringNotes
              }
              placeholder="Document property sources, model limitations, safety factors, operating constraints or assumptions requiring follow-up."
              onChange={(event) => {
                setEngineeringNotes(
                  event.target.value,
                )

                setFeedbackMessage(
                  '',
                )
              }}
            />
          </label>

          {feedbackMessage ? (
            <p
              className="assumption-review-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          <footer className="assumption-review-actions">
            <div>
              <button
                type="button"
                onClick={
                  confirmAllAssumptions
                }
              >
                Confirm all assumptions
              </button>

              <button
                type="button"
                className="is-reset"
                onClick={
                  resetAssumptionReview
                }
              >
                Reset review
              </button>
            </div>

            <button
              type="button"
              className="is-primary"
              onClick={
                copyAssumptionRegister
              }
            >
              Copy assumption register
            </button>
          </footer>

          <div
            className="assumption-review-final-state"
            data-state={
              overallState
            }
          >
            <strong>
              {overallLabel}
            </strong>

            <span>
              {
                overallState ===
                'verified'
                  ? 'Every assumption has been confirmed or marked not applicable.'
                  : overallState ===
                      'review'
                    ? 'At least one assumption requires engineering follow-up.'
                    : 'Address every pending assumption before final report use.'
              }
            </span>
          </div>
        </div>
      ) : null}
    </section>
  )
}
