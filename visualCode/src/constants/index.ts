/**
 * 应用常量配置
 * 定义了应用中使用的各种常量
 */

import { AlgorithmNames } from '../types'

// 默认配置
export const DEFAULT_CONFIG = {
  ARRAY_LENGTH: 20,
  DEFAULT_SPEED: 50,
  MIN_VALUE: 1,
  MAX_VALUE: 50,
  PAUSE_CHECK_INTERVAL: 100
} as const

// 算法名称映射
export const ALGORITHM_NAMES: AlgorithmNames = {
  bubble: '冒泡排序',
  quick: '快速排序',
  merge: '归并排序'
}

// 算法代码模板
export const ALGORITHM_CODES = {
  bubble: [
    'for (let j = 0; j < max; j++) {',
    '  let swapped = false;',
    '  for (let i = 0; i < max - j; i++) {',
    '    if (arr[i] > arr[i + 1]) {',
    '      swap(arr, i, i + 1);',
    '      swapped = true;',
    '    }',
    '  }',
    '  if (!swapped) break;',
    '}'
  ],
  quick: [
    'function quickSort(arr, low, high) {',
    '  if (low < high) {',
    '    let pi = partition(arr, low, high);',
    '    quickSort(arr, low, pi - 1);',
    '    quickSort(arr, pi + 1, high);',
    '  }',
    '}'
  ],
  merge: [
    'function mergeSort(arr, left, right) {',
    '  if (left < right) {',
    '    let mid = Math.floor((left + right) / 2);',
    '    mergeSort(arr, left, mid);',
    '    mergeSort(arr, mid + 1, right);',
    '    merge(arr, left, mid, right);',
    '  }',
    '}'
  ]
} as const

// CSS类名常量
export const CSS_CLASSES = {
  BAR: {
    BASE: 'bar',
    UNSORTED: 'unsorted',
    SORTED: 'sorted',
    COMPARING_A: 'comparing-a',
    COMPARING_B: 'comparing-b',
    PIVOT: 'pivot'
  },
  STATUS: {
    BASE: 'status',
    COMPLETED: 'completed',
    SORTING: 'sorting'
  },
  BUTTON: {
    STEP: 'step',
    PAUSE: 'pause',
    RESET: 'reset'
  },
  MODE: {
    OPTION: 'mode-option',
    ACTIVE: 'active'
  }
} as const