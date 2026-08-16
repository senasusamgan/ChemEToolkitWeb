/**
 * HomeProblemSolverEntry
 * Compact Problem Solver entry point on homepage
 */

interface HomeProblemSolverEntryProps {
  onOpenProblemSolver: () => void
}

export function HomeProblemSolverEntry({
  onOpenProblemSolver,
}: HomeProblemSolverEntryProps) {
  return (
    <section className="home-problem-solver" aria-labelledby="home-solver-heading">
      <div className="home-problem-solver-content">
        <div className="home-problem-solver-icon" aria-hidden="true">
          ◇
        </div>

        <div className="home-problem-solver-copy">
          <h2 id="home-solver-heading">Problem Solver</h2>
          <p>
            Describe an engineering problem with known values, and ChemE Toolkit
            will identify the governing model and solve it locally.
          </p>
        </div>

        <button
          type="button"
          className="home-problem-solver-button"
          onClick={onOpenProblemSolver}
        >
          Open Problem Solver
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
