import {
  startTransition,
  useEffect,
  useState,
} from 'react'

import type {
  ProblemSolverMatch,
} from './problemSolverEngine'
import {
  requestProblemSolverMatches,
} from './problemSolverWorkerClient'
import type {
  ProblemSolverWorkerExecutionMode,
} from './problemSolverWorkerClient'

interface UseProblemSolverWorkerOptions {
  query: string
  limit: number
  enabled?: boolean
}

interface ProblemSolverWorkerHookState {
  resolvedQuery: string
  resultQuery: string
  matches:
    ProblemSolverMatch[]
  isLoading: boolean
  errorMessage: string
  elapsedMs:
    number | null
  executionMode:
    ProblemSolverWorkerExecutionMode | null
}

export interface UseProblemSolverWorkerResult {
  matches:
    ProblemSolverMatch[]
  isLoading: boolean
  isStale: boolean
  errorMessage: string
  elapsedMs:
    number | null
  executionMode:
    ProblemSolverWorkerExecutionMode | null
}

export const
  PROBLEM_SOLVER_RESULT_RENDER_MODE =
    'deferred-worker-result-render-v5' as const

export const
  PROBLEM_SOLVER_STABLE_RESULT_MODE =
    'keep-last-confirmed-result-v7' as const

export function useProblemSolverWorker({
  query,
  limit,
  enabled = true,
}: UseProblemSolverWorkerOptions):
  UseProblemSolverWorkerResult {
  const [
    state,
    setState,
  ] =
    useState<
      ProblemSolverWorkerHookState
    >({
      resolvedQuery:
        '',
      resultQuery:
        '',
      matches: [],
      isLoading:
        false,
      errorMessage:
        '',
      elapsedMs:
        null,
      executionMode:
        null,
    })

  const cleanQuery =
    query.trim()

  const isEligible =
    enabled &&
    cleanQuery.length >=
      3

  useEffect(
    () => {
      if (!isEligible) {
        setState({
          resolvedQuery:
            query,
          resultQuery:
            query,
          matches: [],
          isLoading:
            false,
          errorMessage:
            '',
          elapsedMs:
            null,
          executionMode:
            null,
        })

        return
      }

      let isCurrent =
        true

      /*
       * Preserve the previously confirmed result while
       * the next worker request is running. Clearing the
       * array here would unmount the entire result tree
       * on every edit.
       */
      setState(
        (
          currentState,
        ) => ({
          ...currentState,
          resolvedQuery:
            query,
          matches:
            currentState.matches,
          isLoading:
            true,
          errorMessage:
            '',
          elapsedMs:
            null,
          executionMode:
            null,
        }),
      )

      void requestProblemSolverMatches(
        query,
        limit,
      )
        .then(
          (
            result,
          ) => {
            if (!isCurrent) {
              return
            }

            startTransition(
              () => {
                setState({
                  resolvedQuery:
                    query,
                  resultQuery:
                    query,
                  matches:
                    result.matches,
                  isLoading:
                    false,
                  errorMessage:
                    '',
                  elapsedMs:
                    result.elapsedMs,
                  executionMode:
                    result.executionMode,
                })
              },
            )
          },
        )
        .catch(
          (
            error:
              unknown,
          ) => {
            if (!isCurrent) {
              return
            }

            /*
             * Keep the last confirmed result visible after
             * a failed refresh. The error belongs to the
             * new query, not to the previous valid result.
             */
            startTransition(
              () => {
                setState(
                  (
                    currentState,
                  ) => ({
                    ...currentState,
                    resolvedQuery:
                      query,
                    matches:
                      currentState.matches,
                    isLoading:
                      false,
                    errorMessage:
                      error instanceof
                      Error
                        ? error.message
                        : 'Background Solver analysis failed.',
                    elapsedMs:
                      null,
                    executionMode:
                      null,
                  }),
                )
              },
            )
          },
        )

      return () => {
        isCurrent =
          false
      }
    },
    [
      isEligible,
      limit,
      query,
    ],
  )

  const isRequestPending =
    isEligible &&
    state.resolvedQuery !==
      query

  const isStale =
    isEligible &&
    state.matches.length >
      0 &&
    state.resultQuery !==
      query

  return {
    matches:
      isEligible
        ? state.matches
        : [],
    isLoading:
      isEligible &&
      (
        state.isLoading ||
        isRequestPending
      ),
    isStale,
    errorMessage:
      isRequestPending
        ? ''
        : state.errorMessage,
    elapsedMs:
      isRequestPending ||
      isStale
        ? null
        : state.elapsedMs,
    executionMode:
      isRequestPending ||
      isStale
        ? null
        : state.executionMode,
  }
}
