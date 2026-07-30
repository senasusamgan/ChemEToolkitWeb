export interface ProblemSolverCalculator {
  id: string
  title: string
  category: string
  available: boolean
}

export type ProblemSolverConfidence =
  | 'high'
  | 'medium'
  | 'low'

export interface ProblemSolverMatch {
  calculatorId: string
  title: string
  category: string
  score: number
  confidence: ProblemSolverConfidence
  reasons: string[]
}

interface IntentProfile {
  label: string
  categories: string[]
  signals: string[]
  titleTerms: string[]
  score: number
}

const CATEGORY_SIGNALS:
  Record<string, string[]> = {
    'Engineering Fundamentals': [
      'unit conversion',
      'convert units',
      'molecular weight',
      'mole fraction',
      'mass fraction',
      'density',
      'specific gravity',
      'interpolation',
      'weighted average',
      'birim donusumu',
      'molekul agirligi',
      'yogunluk',
    ],

    'Material & Energy Balances': [
      'mass balance',
      'material balance',
      'energy balance',
      'mixer',
      'splitter',
      'recycle',
      'purge',
      'evaporator',
      'dryer',
      'kutle dengesi',
      'enerji dengesi',
      'geri devir',
    ],

    Thermodynamics: [
      'ideal gas',
      'real gas',
      'entropy',
      'enthalpy',
      'vapor pressure',
      'bubble point',
      'dew point',
      'phase equilibrium',
      'ideal gaz',
      'entropi',
      'entalpi',
      'buhar basinci',
    ],

    'Fluid Mechanics': [
      'pipe flow',
      'pressure drop',
      'reynolds',
      'bernoulli',
      'pump',
      'friction factor',
      'head loss',
      'flow regime',
      'boru akisi',
      'basinc dusum',
      'reynolds sayisi',
      'pompa',
    ],

    'Heat Transfer': [
      'heat transfer',
      'conduction',
      'convection',
      'radiation',
      'heat exchanger',
      'lmtd',
      'ntu',
      'biot',
      'fin',
      'boiling',
      'condensation',
      'isi transferi',
      'isi degistirici',
      'iletim',
      'tasinim',
    ],

    'Mass Transfer': [
      'mass transfer',
      'diffusion',
      'fick',
      'diffusivity',
      'membrane',
      'stagnant film',
      'kutle transferi',
      'difüzyon',
      'difuzyon',
      'membran',
    ],

    'Reaction Engineering': [
      'reaction rate',
      'reactor',
      'cstr',
      'pfr',
      'batch reactor',
      'arrhenius',
      'activation energy',
      'conversion',
      'selectivity',
      'reaktor',
      'reaksiyon hizi',
      'aktivasyon enerjisi',
      'donusum',
    ],

    'Separation Processes': [
      'distillation',
      'absorption',
      'stripping',
      'extraction',
      'filtration',
      'drying',
      'adsorption',
      'crystallization',
      'cyclone',
      'distilasyon',
      'absorpsiyon',
      'ekstraksiyon',
      'filtrasyon',
      'kurutma',
    ],

    'Process Control': [
      'process control',
      'pid',
      'controller',
      'control valve',
      'transfer function',
      'tank dynamics',
      'closed loop',
      'tuning',
      'proses kontrol',
      'kontrolor',
      'pid ayar',
      'transfer fonksiyonu',
    ],

    'Numerical Methods': [
      'root finding',
      'numerical integration',
      'numerical differentiation',
      'differential equation',
      'linear system',
      'regression',
      'optimization',
      'finite difference',
      'kok bulma',
      'sayisal integral',
      'sayisal turev',
      'diferansiyel denklem',
    ],

    'Process Safety & Economics': [
      'process safety',
      'risk',
      'leak',
      'relief',
      'equipment cost',
      'npv',
      'irr',
      'payback',
      'roi',
      'break even',
      'proses guvenligi',
      'sizinti',
      'ekipman maliyeti',
      'geri odeme',
    ],
  }

const INTENT_PROFILES:
  IntentProfile[] = [
    {
      label:
        'Pipe pressure-drop calculation',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'pressure drop',
        'pipe pressure loss',
        'darcy weisbach',
        'basinc dusum',
        'boru basinc kaybi',
      ],
      titleTerms: [
        'pressure',
        'drop',
      ],
      score: 160,
    },

    {
      label:
        'Reynolds number and flow regime',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'reynolds number',
        'flow regime',
        'laminar or turbulent',
        'reynolds sayisi',
        'laminer veya turbulent',
      ],
      titleTerms: [
        'reynolds',
      ],
      score: 160,
    },

    {
      label:
        'Pump power calculation',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'pump power',
        'hydraulic power',
        'pompa gucu',
      ],
      titleTerms: [
        'pump',
        'power',
      ],
      score: 145,
    },

    {
      label:
        'Heat-exchanger area sizing',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'required heat exchanger area',
        'size the heat exchanger',
        'heat exchanger area',
        'isi degistirici alani',
        'isi degistirici boyutlandir',
      ],
      titleTerms: [
        'heat',
        'exchanger',
        'area',
      ],
      score: 165,
    },

    {
      label:
        'LMTD calculation',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'lmtd',
        'log mean temperature difference',
        'logaritmik ortalama sicaklik farki',
      ],
      titleTerms: [
        'lmtd',
      ],
      score: 135,
    },

    {
      label:
        'Biot-number calculation',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'biot number',
        'lumped capacitance',
        'biot sayisi',
      ],
      titleTerms: [
        'biot',
      ],
      score: 145,
    },

    {
      label:
        'Ideal-gas calculation',
      categories: [
        'Thermodynamics',
      ],
      signals: [
        'ideal gas law',
        'pv nrt',
        'ideal gaz denklemi',
      ],
      titleTerms: [
        'ideal',
        'gas',
      ],
      score: 145,
    },

    {
      label:
        'CSTR reactor design',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'cstr volume',
        'cstr design',
        'continuous stirred tank reactor',
        'cstr hacmi',
        'surekli karistirmali tank reaktoru',
      ],
      titleTerms: [
        'cstr',
      ],
      score: 160,
    },

    {
      label:
        'PFR reactor design',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'pfr volume',
        'pfr design',
        'plug flow reactor',
        'pfr hacmi',
        'tapa akisli reaktor',
      ],
      titleTerms: [
        'pfr',
      ],
      score: 160,
    },

    {
      label:
        'Batch-reactor calculation',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'batch reactor',
        'batch reaction time',
        'kesikli reaktor',
        'reaksiyon suresi',
      ],
      titleTerms: [
        'batch',
      ],
      score: 145,
    },

    {
      label:
        'PID-controller calculation',
      categories: [
        'Process Control',
      ],
      signals: [
        'pid controller',
        'pid tuning',
        'tune a pid',
        'pid kontrolor',
        'pid ayar',
      ],
      titleTerms: [
        'pid',
      ],
      score: 160,
    },

    {
      label:
        'Numerical root finding',
      categories: [
        'Numerical Methods',
      ],
      signals: [
        'find the root',
        'solve nonlinear equation',
        'root finding',
        'kok bul',
        'dogrusal olmayan denklem',
      ],
      titleTerms: [
        'root',
      ],
      score: 145,
    },

    {
      label:
        'Numerical integration',
      categories: [
        'Numerical Methods',
      ],
      signals: [
        'numerical integration',
        'simpson rule',
        'trapezoidal rule',
        'area under the curve',
        'sayisal integral',
        'simpson kurali',
        'yamuk kurali',
      ],
      titleTerms: [
        'integration',
      ],
      score: 145,
    },

    {
      label:
        'Bubble-point calculation',
      categories: [
        'Thermodynamics',
      ],
      signals: [
        'bubble point',
        'bubble point pressure',
        'kabarcik noktasi',
      ],
      titleTerms: [
        'bubble',
        'point',
      ],
      score: 150,
    },

    {
      label:
        'Net-present-value analysis',
      categories: [
        'Process Safety & Economics',
      ],
      signals: [
        'net present value',
        'npv',
        'net bugunku deger',
      ],
      titleTerms: [
        'net',
        'present',
        'value',
      ],
      score: 150,
    },
  ]

function normalize(
  value: string,
): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ç', 'c')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9\s-]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function phraseMatches(
  query: string,
  phrase: string,
): boolean {
  const cleanPhrase =
    normalize(phrase)

  return (
    cleanPhrase.length > 1 &&
    query.includes(
      cleanPhrase,
    )
  )
}

function confidenceForScore(
  score: number,
): ProblemSolverConfidence {
  if (score >= 120) {
    return 'high'
  }

  if (score >= 55) {
    return 'medium'
  }

  return 'low'
}

export function rankProblemSolvers(
  query: string,
  calculators:
    ProblemSolverCalculator[],
  limit = 8,
): ProblemSolverMatch[] {
  const cleanQuery =
    normalize(query)

  if (
    cleanQuery.length < 3 ||
    limit <= 0
  ) {
    return []
  }

  const queryTokens =
    cleanQuery
      .split(' ')
      .filter(
        (token) =>
          token.length > 1,
      )

  return calculators
    .filter(
      (calculator) =>
        calculator.available,
    )
    .map((calculator) => {
      const cleanTitle =
        normalize(
          calculator.title,
        )

      const cleanCategory =
        normalize(
          calculator.category,
        )

      const reasons =
        new Set<string>()

      let score = 0

      if (cleanTitle === cleanQuery) {
        score += 180

        reasons.add(
          'Exact calculator-title match',
        )
      } else if (
        cleanQuery.includes(
          cleanTitle,
        )
      ) {
        score += 110

        reasons.add(
          'Calculator title appears in the problem',
        )
      }

      const titleTokens =
        cleanTitle
          .split(' ')
          .filter(
            (token) =>
              token.length > 1,
          )

      for (
        const token
        of queryTokens
      ) {
        if (
          titleTokens.includes(
            token,
          )
        ) {
          score += 18

          reasons.add(
            `Title term matched: ${token}`,
          )
        } else if (
          cleanCategory.includes(
            token,
          )
        ) {
          score += 5
        }
      }

      const categorySignals =
        CATEGORY_SIGNALS[
          calculator.category
        ] ?? []

      for (
        const signal
        of categorySignals
      ) {
        if (
          phraseMatches(
            cleanQuery,
            signal,
          )
        ) {
          score += 24

          reasons.add(
            `Discipline signal matched: ${signal}`,
          )
        }
      }

      for (
        const profile
        of INTENT_PROFILES
      ) {
        const signalMatched =
          profile.signals.some(
            (signal) =>
              phraseMatches(
                cleanQuery,
                signal,
              ),
          )

        if (!signalMatched) {
          continue
        }

        if (
          !profile.categories.includes(
            calculator.category,
          )
        ) {
          continue
        }

        const titleMatched =
          profile.titleTerms.every(
            (term) =>
              cleanTitle.includes(
                normalize(term),
              ),
          )

        if (!titleMatched) {
          continue
        }

        score += profile.score

        reasons.add(
          profile.label,
        )
      }

      return {
        calculatorId:
          calculator.id,
        title:
          calculator.title,
        category:
          calculator.category,
        score,
        confidence:
          confidenceForScore(
            score,
          ),
        reasons:
          Array.from(
            reasons,
          ).slice(
            0,
            3,
          ),
      }
    })
    .filter(
      (match) =>
        match.score > 0,
    )
    .sort(
      (first, second) =>
        second.score -
          first.score ||
        first.title.localeCompare(
          second.title,
        ),
    )
    .slice(
      0,
      Math.max(
        1,
        limit,
      ),
    )
}
