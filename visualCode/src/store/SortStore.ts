/**
 * 排序可视化应用状态管理
 * 负责管理应用的全局状态和业务逻辑
 */

import { bind, signal, SignalValue } from 'omi'
import { AppState, SortAlgorithm, ExecutionMode } from '../types'
import { generateRandomArray, calculateDelay, delay } from '../utils/helpers'
import { DEFAULT_CONFIG } from '../constants'
import { BubbleSort, QuickSort, MergeSort, SortingAlgorithm } from '../algorithms/sortingAlgorithms'

export class SortStore {
  public state: SignalValue<AppState>
  private currentAlgorithm: SortingAlgorithm | null = null
  private stepResolve: (() => void) | null = null

  constructor() {
    this.state = signal({})
    this.init()
  }

  /**
   * 初始化应用状态
   */
  init(): void {
    this.state.value = {
      arr: generateRandomArray(DEFAULT_CONFIG.ARRAY_LENGTH, DEFAULT_CONFIG.MIN_VALUE, DEFAULT_CONFIG.MAX_VALUE),
      indexA: -1,
      indexB: -1,
      indexC: -1,
      sorting: false,
      paused: false,
      algorithm: 'bubble',
      speed: DEFAULT_CONFIG.DEFAULT_SPEED,
      completed: false,
      sortedIndices: new Set(),
      currentStep: '',
      currentCodeLine: -1,
      executionMode: 'auto',
      stepCount: 0,
      comparisons: 0,
      swaps: 0
    }
    this.state.update()
  }

  /**
   * 重置应用状态
   */
  @bind
  reset(): void {
    if (this.currentAlgorithm) {
      this.currentAlgorithm.stop()
      this.currentAlgorithm = null
    }
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
    this.init()
  }

  /**
   * 切换暂停/继续状态
   */
  @bind
  togglePause(): void {
    this.state.value.paused = !this.state.value.paused
    this.state.update()
  }

  /**
   * 设置排序算法
   */
  @bind
  setAlgorithm(algorithm: SortAlgorithm): void {
    if (!this.state.value.sorting) {
      this.state.value.algorithm = algorithm
      this.state.update()
    }
  }

  /**
   * 设置排序速度
   */
  @bind
  setSpeed(speed: number): void {
    this.state.value.speed = speed
    this.state.update()
  }

  /**
   * 设置执行模式
   */
  @bind
  setExecutionMode(mode: ExecutionMode): void {
    if (!this.state.value.sorting) {
      this.state.value.executionMode = mode
      this.state.update()
    }
  }

  /**
   * 执行下一步（逐步模式）
   */
  @bind
  nextStep(): void {
    console.log('Store nextStep called, currentAlgorithm:', this.currentAlgorithm)
    console.log('stepResolve:', this.stepResolve)
    if (this.currentAlgorithm) {
      this.currentAlgorithm.nextStep()
    }
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
  }

  /**
   * 开始排序
   */
  @bind
  async sort(): Promise<void> {
    if (this.state.value.sorting) return
    
    // 初始化排序状态
    this.state.value.sorting = true
    this.state.value.paused = false
    this.state.value.completed = false
    this.state.value.sortedIndices = new Set()
    this.state.value.stepCount = 0
    this.state.value.comparisons = 0
    this.state.value.swaps = 0
    this.state.update()

    const arr = [...this.state.value.arr!]
    const algorithm = this.state.value.algorithm!

    try {
      // 创建对应的排序算法实例
      this.currentAlgorithm = this.createAlgorithmInstance(algorithm)
      
      // 执行排序
      await this.currentAlgorithm.sort(arr)
      
      // 排序完成处理
      if (!this.currentAlgorithm) return // 已被停止
      
      this.state.value.completed = true
      this.state.value.currentStep = '排序完成！'
      this.state.value.currentCodeLine = -1
      // 标记所有元素为已排序
      this.state.value.sortedIndices = new Set(Array.from({ length: arr.length }, (_, i) => i))
      
    } catch (error) {
      console.error('排序过程中出现错误:', error)
    } finally {
      // 清理状态
      this.state.value.indexA = -1
      this.state.value.indexB = -1
      this.state.value.indexC = -1
      this.state.value.sorting = false
      this.state.value.paused = false
      this.currentAlgorithm = null
      this.state.update()
    }
  }

  /**
   * 创建排序算法实例
   */
  private createAlgorithmInstance(algorithm: SortAlgorithm): SortingAlgorithm {
    const updateCallback = (step: string, codeLine: number) => {
      this.updateStep(step, codeLine)
    }
    
    const delayCallback = () => this.stepDelay()
    const pauseCallback = () => this.waitIfPaused()

    switch (algorithm) {
      case 'bubble':
        return new BubbleSort(this.state.value, updateCallback, delayCallback, pauseCallback)
      case 'quick':
        return new QuickSort(this.state.value, updateCallback, delayCallback, pauseCallback)
      case 'merge':
        return new MergeSort(this.state.value, updateCallback, delayCallback, pauseCallback)
      default:
        throw new Error(`不支持的排序算法: ${algorithm}`)
    }
  }

  /**
   * 更新执行步骤
   */
  private updateStep(step: string, codeLine: number): void {
    this.state.value.currentStep = step
    this.state.value.currentCodeLine = codeLine
    this.state.value.stepCount = (this.state.value.stepCount || 0) + 1
    this.state.update()
  }

  /**
   * 步骤延迟控制
   */
  private async stepDelay(): Promise<void> {
    if (this.state.value.executionMode === 'step') {
      return new Promise<void>((resolve) => {
        this.stepResolve = resolve
      })
    } else {
      const speed = this.state.value.speed || DEFAULT_CONFIG.DEFAULT_SPEED
      const delayTime = calculateDelay(speed)
      return delay(delayTime)
    }
  }

  /**
   * 暂停状态检查
   */
  private async waitIfPaused(): Promise<void> {
    while (this.state.value.paused && this.currentAlgorithm) {
      await delay(DEFAULT_CONFIG.PAUSE_CHECK_INTERVAL)
    }
  }
}

// 创建并导出全局store实例
export const store = new SortStore()