import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import './styles/calculator-polish.css'
import './styles/mobile-v1.css'
import './styles/personal-toolkit.css'
import { Brand } from './components/Brand'
import { FeedbackPanel } from './components/FeedbackPanel'
import { CalculatorStage } from './components/CalculatorStage'
const HomepageProblemSolverPanel =
  lazy(() =>
    import(
      './components/HomepageProblemSolverPanel'
    ).then((module) => ({
      default:
        module.HomepageProblemSolverPanel,
    })),
  )

const EngineeringWorkspace =
  lazy(() =>
    import(
      './components/EngineeringWorkspace'
    ).then((module) => ({
      default:
        module.EngineeringWorkspace,
    })),
  )

import { calculators } from './data/calculators'
import { categories } from './data/categories'

const defaultCalculator =
  calculators.find((calculator) => calculator.id === 'reynoldsNumber') ??
  calculators.find((calculator) => calculator.available) ??
  calculators[0]

const FAVORITES_STORAGE_KEY =
  'cheme-toolkit-favorites-v1'

const RECENT_STORAGE_KEY =
  'cheme-toolkit-recent-v1'

const PERSONAL_DATA_CHANGE_EVENT =
  'cheme-toolkit:personal-data-changed'

function readStoredIds(key: string): string[] {
  try {
    const storedValue =
      window.localStorage.getItem(key)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (value): value is string =>
        typeof value === 'string',
    )
  } catch {
    return []
  }
}

function App() {
  const liveCalculatorCount = calculators.filter(
    (calculator) => calculator.available,
  ).length

  const queuedCalculatorCount =
    calculators.length - liveCalculatorCount

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All disciplines')
  const [activeCalculatorId, setActiveCalculatorId] = useState(
    defaultCalculator.id,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [
    shouldLoadWorkspace,
    setShouldLoadWorkspace,
  ] = useState(false)

  const [
    shouldLoadProblemSolver,
    setShouldLoadProblemSolver,
  ] = useState(false)

  const [
    problemSolverOpenRequest,
    setProblemSolverOpenRequest,
  ] = useState(0)

  const workspaceSectionRef =
    useRef<HTMLElement | null>(
      null,
    )

  const problemSolverSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    )


  const [favoriteCalculatorIds, setFavoriteCalculatorIds] =
    useState<string[]>(() =>
      readStoredIds(FAVORITES_STORAGE_KEY),
    )

  const [recentCalculatorIds, setRecentCalculatorIds] =
    useState<string[]>(() =>
      readStoredIds(RECENT_STORAGE_KEY),
    )

  const activeCalculator =
    calculators.find((calculator) => calculator.id === activeCalculatorId) ??
    defaultCalculator


  const favoriteCalculators = useMemo(
    () =>
      favoriteCalculatorIds
        .map((calculatorId) =>
          calculators.find(
            (calculator) =>
              calculator.id === calculatorId &&
              calculator.available,
          ),
        )
        .filter(
          (
            calculator,
          ): calculator is (typeof calculators)[number] =>
            Boolean(calculator),
        ),
    [favoriteCalculatorIds],
  )

  const recentCalculators = useMemo(
    () =>
      recentCalculatorIds
        .map((calculatorId) =>
          calculators.find(
            (calculator) =>
              calculator.id === calculatorId &&
              calculator.available,
          ),
        )
        .filter(
          (
            calculator,
          ): calculator is (typeof calculators)[number] =>
            Boolean(calculator),
        ),
    [recentCalculatorIds],
  )

  const activeCalculatorIsFavorite =
    favoriteCalculatorIds.includes(
      activeCalculator.id,
    )

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteCalculatorIds),
    )
  }, [favoriteCalculatorIds])

  useEffect(() => {
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify(recentCalculatorIds),
    )
  }, [recentCalculatorIds])



  useEffect(() => {
    function refreshPersonalToolkit() {
      setFavoriteCalculatorIds(
        readStoredIds(
          FAVORITES_STORAGE_KEY,
        ),
      )

      setRecentCalculatorIds(
        readStoredIds(
          RECENT_STORAGE_KEY,
        ),
      )
    }

    window.addEventListener(
      PERSONAL_DATA_CHANGE_EVENT,
      refreshPersonalToolkit,
    )

    return () => {
      window.removeEventListener(
        PERSONAL_DATA_CHANGE_EVENT,
        refreshPersonalToolkit,
      )
    }
  }, [])

  useEffect(() => {
    const element =
      problemSolverSectionRef.current

    if (element === null) {
      return
    }

    function loadProblemSolver() {
      setShouldLoadProblemSolver(
        true,
      )
    }

    if (
      window.location.hash ===
      '#problem-solver'
    ) {
      loadProblemSolver()

      window.requestAnimationFrame(
        () => {
          element.scrollIntoView({
            block:
              'start',
          })
        },
      )

      return
    }

    if (
      !(
        'IntersectionObserver'
        in window
      )
    ) {
      loadProblemSolver()

      return
    }

    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          const shouldLoad =
            entries.some(
              (
                entry,
              ) =>
                entry.isIntersecting,
            )

          if (!shouldLoad) {
            return
          }

          loadProblemSolver()
          observer.disconnect()
        },
        {
          rootMargin:
            '320px 0px',
        },
      )

    observer.observe(
      element,
    )

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const element =
      workspaceSectionRef.current

    const fallbackTimer =
      window.setTimeout(
        () =>
          setShouldLoadWorkspace(
            true,
          ),
        2500,
      )

    if (
      element === null ||
      !(
        'IntersectionObserver'
        in window
      )
    ) {
      return () =>
        window.clearTimeout(
          fallbackTimer,
        )
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const shouldLoad =
            entries.some(
              (entry) =>
                entry.isIntersecting,
            )

          if (!shouldLoad) {
            return
          }

          window.clearTimeout(
            fallbackTimer,
          )

          setShouldLoadWorkspace(
            true,
          )

          observer.disconnect()
        },
        {
          rootMargin:
            '160px 0px',
        },
      )

    observer.observe(element)

    return () => {
      window.clearTimeout(
        fallbackTimer,
      )

      observer.disconnect()
    }
  }, [])

  const filteredCalculators = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return calculators.filter((calculator) => {
      const categoryMatches =
        selectedCategory === 'All disciplines' ||
        calculator.category === selectedCategory

      const searchMatches =
        normalizedSearch.length === 0 ||
        calculator.title.toLocaleLowerCase().includes(normalizedSearch) ||
        calculator.category.toLocaleLowerCase().includes(normalizedSearch)

      return categoryMatches && searchMatches
    })
  }, [search, selectedCategory])

  function openProblemSolver() {
    setShouldLoadProblemSolver(
      true,
    )

    setShouldLoadWorkspace(
      true,
    )

    setProblemSolverOpenRequest(
      (currentRequest) =>
        currentRequest + 1,
    )

    window.requestAnimationFrame(
      () => {
        problemSolverSectionRef
          .current
          ?.scrollIntoView({
            behavior:
              'smooth',
            block:
              'start',
          })
      },
    )
  }

  function openCategory(category: string) {
    setSelectedCategory(category)
    window.requestAnimationFrame(() => {
      document.querySelector('#calculators')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function openCalculator(calculatorId: string) {
    setActiveCalculatorId(calculatorId)

    setRecentCalculatorIds((currentIds) => [
      calculatorId,
      ...currentIds.filter(
        (currentId) =>
          currentId !== calculatorId,
      ),
    ].slice(0, 5))

    window.requestAnimationFrame(() => {
      document.querySelector('#workbench')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function toggleFavorite(calculatorId: string) {
    setFavoriteCalculatorIds((currentIds) =>
      currentIds.includes(calculatorId)
        ? currentIds.filter(
            (currentId) =>
              currentId !== calculatorId,
          )
        : [
            calculatorId,
            ...currentIds,
          ],
    )
  }

  function clearFavorites() {
    setFavoriteCalculatorIds([])
  }

  function clearRecentCalculators() {
    setRecentCalculatorIds([])
  }


  return (
    <main id="top">
      <a
        className="skip-link"
        href="#calculators"
      >
        Skip to calculator directory
      </a>
      <header
        className="site-header"
        data-menu-open={isMobileMenuOpen}
      >
        <Brand />

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          <a href="#calculators">Calculators</a>
          <a
            href="#problem-solver"
            onClick={(event) => {
              event.preventDefault()
              openProblemSolver()
            }}
          >
            Problem Solver
          </a>
          <a href="#categories">Categories</a>
          <a href="#method">Method</a>
          <a href="#references">References</a>
          <a href="#about">About</a>
        </nav>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={
            isMobileMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={isMobileMenuOpen}
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
        >
          <span aria-hidden="true">
            {isMobileMenuOpen ? '×' : '☰'}
          </span>
        </button>

        {isMobileMenuOpen ? (
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            <a
              href="#calculators"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Calculators
            </a>
            <a
              href="#problem-solver"
              onClick={(event) => {
                event.preventDefault()
                setIsMobileMenuOpen(false)
                openProblemSolver()
              }}
            >
              Problem Solver
            </a>

            <a
              href="#categories"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </a>
            <a
              href="#method"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Method
            </a>
            <a
              href="#references"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              References
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
          </nav>
        ) : null}
      </header>

      <section className="hero notebook-grid">
        <div className="ruler" aria-hidden="true" />

        <div className="category-ribbon">
          {categories
            .filter((category) =>
              [
                'Thermodynamics',
                'Fluid Mechanics',
                'Heat Transfer',
                'Mass Transfer',
                'Reaction Engineering',
              ].includes(category.name),
            )
            .map((category) => (
              <button
                type="button"
                className="category-pill"
                key={category.name}
                onClick={() => openCategory(category.name)}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
        </div>

        <div className="hero-copy">
          <p className="eyebrow">A verified chemical engineering workspace</p>
          <h1>
            Chemical engineering,
            <br />
            calculated clearly<span>.</span>
          </h1>
          <p className="hero-deck">
            440 verified calculators across 11 disciplines—built for study,
            design checks and everyday engineering work.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#calculators">
              ▦ Explore calculators
            </a>
            <a className="button button-secondary" href="#categories">
              □ Browse categories
            </a>

            <a
              className="button button-secondary"
              href="#problem-solver"
              onClick={(event) => {
                event.preventDefault()
                openProblemSolver()
              }}
            >
              ◇ Solve a problem
            </a>
          </div>

          <div className="status-strip">
            <strong>{liveCalculatorCount}</strong>
            <span>live calculators</span>
            <strong>{queuedCalculatorCount}</strong>
            <span>clean-source migrations queued</span>
          </div>
        </div>

        <div id="workbench" className="hero-workbench">
          <div className="active-calculator-tools">
            <button
              type="button"
              className="active-favorite-button"
              data-favorite={activeCalculatorIsFavorite}
              aria-pressed={activeCalculatorIsFavorite}
              onClick={() =>
                toggleFavorite(activeCalculator.id)
              }
            >
              <span aria-hidden="true">
                {activeCalculatorIsFavorite
                  ? '★'
                  : '☆'}
              </span>
              {activeCalculatorIsFavorite
                ? 'Saved to favorites'
                : 'Add to favorites'}
            </button>
          </div>

          <CalculatorStage
            activeCalculator={activeCalculator}
            liveCalculators={calculators.filter(
              (calculator) => calculator.available,
            )}
            onSelect={openCalculator}
          />
        </div>
      </section>

      <div
        ref={
          problemSolverSectionRef
        }
        className="problem-solver-lazy-shell"
        data-loaded={
          shouldLoadProblemSolver
            ? 'true'
            : 'false'
        }
      >
        {shouldLoadProblemSolver ? (
          <Suspense
            fallback={
              <div
                className="problem-solver-lazy-placeholder"
                role="status"
                aria-live="polite"
              >
                <strong>
                  Loading Problem Solver…
                </strong>

                <span>
                  Preparing the local equation engine and
                  engineering result workspace.
                </span>
              </div>
            }
          >
            <HomepageProblemSolverPanel
              onOpenCalculator={
                openCalculator
              }
            />
          </Suspense>
        ) : (
          <div
            className="problem-solver-lazy-placeholder"
            role="status"
            aria-live="polite"
          >
            <strong>
              Problem Solver loads on approach
            </strong>

            <span>
              The full Solver is kept out of the initial
              application bundle until this section is
              needed.
            </span>

            <button
              type="button"
              onClick={
                openProblemSolver
              }
            >
              Load Problem Solver
            </button>
          </div>
        )}
      </div>


      <section
        ref={workspaceSectionRef}
        id="engineering-workspace"
        className="workspace-page-section notebook-grid"
      >
        <div className="workspace-page-inner">
          {shouldLoadWorkspace ? (
            <Suspense
              fallback={
                <div
                  className="workspace-lazy-placeholder"
                  role="status"
                  aria-live="polite"
                >
                  Loading engineering workspace…
                </div>
              }
            >
              <EngineeringWorkspace
                calculator={
                  activeCalculator
                }
                onOpenCalculator={
                  openCalculator
                }
                openProblemSolverRequest={
                  problemSolverOpenRequest
                }
              />
            </Suspense>
          ) : (
            <div
              className="workspace-lazy-placeholder"
              role="status"
              aria-live="polite"
            >
              Preparing engineering workspace…
            </div>
          )}
        </div>
      </section>

      <section
        className="section personal-toolkit-section"
        id="your-toolkit"
      >
        <div className="personal-toolkit-header">
          <div>
            <p className="eyebrow">
              Your personal workspace
            </p>
            <h2>Your Toolkit</h2>
            <p>
              Keep your most useful calculators close
              and return to recently opened tools
              without searching again.
            </p>
          </div>

          <div className="personal-toolkit-summary">
            <span>
              {favoriteCalculators.length} favorites
            </span>
            <span>
              {recentCalculators.length} recent
            </span>
          </div>
        </div>

        <div className="personal-toolkit-grid">
          <article className="personal-toolkit-panel">
            <div className="personal-toolkit-panel-header">
              <h3>Favorites</h3>

              {favoriteCalculators.length > 0 ? (
                <button
                  type="button"
                  onClick={clearFavorites}
                >
                  Clear favorites
                </button>
              ) : null}
            </div>

            {favoriteCalculators.length > 0 ? (
              <ul className="personal-toolkit-list">
                {favoriteCalculators.map(
                  (calculator) => (
                    <li
                      className="personal-toolkit-item"
                      key={calculator.id}
                    >
                      <div className="personal-toolkit-item-copy">
                        <p>{calculator.category}</p>
                        <strong>
                          {calculator.title}
                        </strong>
                      </div>

                      <div className="personal-toolkit-item-actions">
                        <button
                          type="button"
                          aria-label={`Remove ${calculator.title} from favorites`}
                          onClick={() =>
                            toggleFavorite(
                              calculator.id,
                            )
                          }
                        >
                          ★
                        </button>

                        <button
                          type="button"
                          aria-label={`Open ${calculator.title}`}
                          onClick={() =>
                            openCalculator(
                              calculator.id,
                            )
                          }
                        >
                          →
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <div className="personal-toolkit-empty">
                Select the star beside a calculator
                to keep it here.
              </div>
            )}
          </article>

          <article className="personal-toolkit-panel">
            <div className="personal-toolkit-panel-header">
              <h3>Recently used</h3>

              {recentCalculators.length > 0 ? (
                <button
                  type="button"
                  onClick={clearRecentCalculators}
                >
                  Clear history
                </button>
              ) : null}
            </div>

            {recentCalculators.length > 0 ? (
              <ul className="personal-toolkit-list">
                {recentCalculators.map(
                  (calculator) => (
                    <li
                      className="personal-toolkit-item"
                      key={calculator.id}
                    >
                      <div className="personal-toolkit-item-copy">
                        <p>{calculator.category}</p>
                        <strong>
                          {calculator.title}
                        </strong>
                      </div>

                      <div className="personal-toolkit-item-actions">
                        <button
                          type="button"
                          aria-label={`Open ${calculator.title}`}
                          onClick={() =>
                            openCalculator(
                              calculator.id,
                            )
                          }
                        >
                          →
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <div className="personal-toolkit-empty">
                Calculators you open will appear here.
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="section categories-section" id="categories">
        <div className="section-heading">
          <p className="eyebrow">The complete curriculum</p>
          <h2>Eleven disciplines. One coherent toolkit.</h2>
          <p>
            Category selection filters the catalog so only the chosen
            discipline is shown.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <div className="category-number">
                {String(category.number).padStart(2, '0')}
              </div>
              <span className="category-mark">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>
                {category.total} verified · {category.live} live
              </p>
              <button
                type="button"
                onClick={() => openCategory(category.name)}
              >
                Explore <span>↗</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section calculators-section"
        id="calculators"
        tabIndex={-1}
        aria-labelledby="calculator-directory-title"
      >
        <div className="catalog-top">
          <div className="section-heading">
            <p className="eyebrow">Start with a calculation</p>
            <h2 id="calculator-directory-title">
              Find the right tool, quickly.
            </h2>
          </div>

          <div className="catalog-controls">
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                aria-label="Search calculators"
                placeholder="Search all 440 calculators"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              aria-label="Filter by discipline"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option>All disciplines</option>
              {categories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p
          className="result-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {filteredCalculators.length} matching calculators
        </p>

        <div className="calculator-list">
          {filteredCalculators.map((calculator, index) => (
            <article key={calculator.id}>
              <span className="list-index">
                {String(index + 1).padStart(3, '0')}
              </span>
              <div>
                <p>{calculator.category}</p>
                <h3>{calculator.title}</h3>
                <span>
                  {calculator.available
                    ? 'Live verified engine'
                    : 'Verified source · clean web migration queued'}
                </span>
              </div>

              {calculator.available ? (
                <div className="calculator-list-item-actions">
                  <button
                    type="button"
                    className="calculator-list-favorite"
                    data-favorite={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                    }
                    aria-label={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                        ? `Remove ${calculator.title} from favorites`
                        : `Add ${calculator.title} to favorites`
                    }
                    aria-pressed={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                    }
                    onClick={() =>
                      toggleFavorite(calculator.id)
                    }
                  >
                    {favoriteCalculatorIds.includes(
                      calculator.id,
                    )
                      ? '★'
                      : '☆'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCalculator(calculator.id)
                    }
                  >
                    Open calculator <span>→</span>
                  </button>
                </div>
              ) : (
                <span className="queued-badge">Catalogued</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="method-section" id="method">
        <div>
          <p className="eyebrow">Built like an engineering notebook</p>
          <h2>Traceable inputs. Visible formulas. Interpretable results.</h2>
        </div>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Enter known values</strong>
              Unit-aware fields keep the calculation basis explicit.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Calculate with context</strong>
              Verified engines apply the appropriate engineering model.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Read the engineering meaning</strong>
              Results retain formulas, regimes and reference context.
            </span>
          </li>
        </ol>
      </section>

      <section className="references-section section" id="references">
        <div className="section-heading">
          <p className="eyebrow">Reference shelf</p>
          <h2>Equations with a traceable basis.</h2>
          <p>
            Calculator engines are translated from verified ChemE Toolkit
            sources and checked against established engineering texts.
          </p>
        </div>

        <div className="reference-grid">
          <article>
            <span>01</span>
            <h3>Core chemical engineering</h3>
            <p>Perry’s Chemical Engineers’ Handbook.</p>
            <p>
              Felder, Rousseau &amp; Bullard — Elementary Principles of
              Chemical Processes.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Thermodynamics &amp; transport</h3>
            <p>
              Smith, Van Ness, Abbott &amp; Swihart — Introduction to Chemical
              Engineering Thermodynamics.
            </p>
            <p>Bird, Stewart &amp; Lightfoot — Transport Phenomena.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Heat &amp; fluid flow</h3>
            <p>
              Incropera et al. — Fundamentals of Heat and Mass Transfer.
            </p>
            <p>
              Çengel &amp; Cimbala — Fluid Mechanics: Fundamentals and
              Applications.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Reactors &amp; separations</h3>
            <p>Fogler — Elements of Chemical Reaction Engineering.</p>
            <p>Wankat — Separation Process Engineering.</p>
          </article>
          <article>
            <span>05</span>
            <h3>Control &amp; numerical methods</h3>
            <p>Seborg et al. — Process Dynamics and Control.</p>
            <p>Chapra &amp; Canale — Numerical Methods for Engineers.</p>
          </article>
          <article>
            <span>06</span>
            <h3>Safety &amp; economics</h3>
            <p>CCPS — Quantitative Risk Analysis guidance.</p>
            <p>Towler &amp; Sinnott — Chemical Engineering Design.</p>
          </article>
        </div>
        <aside
          className="engineering-use-note"
          role="note"
          aria-label="Engineering-use note"
        >
          <h3>
            Engineering-use
            <br />
            note
          </h3>
          <p>
            Results are intended for education, preliminary screening and
            independent design checks. Safety-critical or final design
            decisions must be verified against the applicable code, standard,
            property data and a qualified engineer’s review.
          </p>
        </aside>
      </section>

      <footer id="about">
        <Brand />
        <div className="footer-copy">
          <p>
            A growing chemical engineering calculation platform translated
            from a verified macOS toolkit.
          </p>
          <nav aria-label="Footer navigation">
            <a href="#calculators">Calculators</a>
            <a href="#categories">Categories</a>
            <a href="#method">Method</a>
            <a href="#references">References</a>
          </nav>
        </div>
        <span>
          {calculators.length} calculators · {liveCalculatorCount} live
          engines · 11 disciplines · 1,208 source tests
        </span>
      </footer>

      <FeedbackPanel
        calculatorTitle={activeCalculator.title}
        calculatorCategory={activeCalculator.category}
      />
    </main>
  )
}

export default App
