/**
 * 排序算法可视化应用的类型定义
 * 定义了应用中使用的所有类型接口
 */

// 支持的排序算法类型
export type SortAlgorithm = 'bubble' | 'quick' | 'merge'

// 执行模式类型
export type ExecutionMode = 'auto' | 'step'

// 应用状态接口
export interface AppState {
  arr?: number[]
  indexA?: number
  indexB?: number
  indexC?: number
  sorting?: boolean
  paused?: boolean
  algorithm?: SortAlgorithm
  speed?: number
  completed?: boolean
  sortedIndices?: Set<number>
  currentStep?: string
  currentCodeLine?: number
  executionMode?: ExecutionMode
  stepCount?: number
  comparisons?: number
  swaps?: number
}

// 排序算法名称映射
export interface AlgorithmNames {
  bubble: string
  quick: string
  merge: string
}

// 排序选项接口
export interface SortOptions {
  done: () => void
  check: (indexA: number, indexB: number) => void
}