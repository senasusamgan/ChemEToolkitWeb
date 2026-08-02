import {
  calculators,
} from '../../data/calculators'
import {
  rankProblemSolvers,
} from './problemSolverEngine'
import type {
  ProblemSolverWorkerRequest,
  ProblemSolverWorkerResponse,
} from './problemSolverWorkerClient'

interface ProblemSolverWorkerScope {
  onmessage:
    | ((
        event:
          MessageEvent<
            ProblemSolverWorkerRequest
          >,
      ) => void)
    | null
  postMessage: (
    message:
      ProblemSolverWorkerResponse,
  ) => void
}

const workerScope =
  globalThis as unknown as
    ProblemSolverWorkerScope

workerScope.onmessage =
  (
    event:
      MessageEvent<
        ProblemSolverWorkerRequest
      >,
  ) => {
    const {
      requestId,
      query,
      limit,
    } = event.data

    const startedAt =
      performance.now()

    try {
      const matches =
        rankProblemSolvers(
          query,
          calculators,
          Math.min(
            8,
            Math.max(
              1,
              Math.trunc(
                limit,
              ),
            ),
          ),
        )

      workerScope.postMessage({
        requestId,
        matches,
        elapsedMs:
          performance.now() -
          startedAt,
      })
    } catch (
      error
    ) {
      workerScope.postMessage({
        requestId,
        matches: [],
        elapsedMs:
          performance.now() -
          startedAt,
        error:
          error instanceof
          Error
            ? error.message
            : 'Unknown Problem Solver worker error.',
      })
    }
  }
