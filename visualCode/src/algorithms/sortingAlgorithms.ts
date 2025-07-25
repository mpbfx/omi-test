/**
 * 排序算法核心实现
 * 包含各种排序算法的具体实现逻辑
 */

import { AppState } from '../types'
import { swapArrayElements } from '../utils/helpers'

/**
 * 排序算法基类
 * 提供排序算法的通用接口和方法
 */
export abstract class SortingAlgorithm {
  protected state: AppState
  protected shouldStop: boolean = false
  protected stepResolve: (() => void) | null = null
  protected updateCallback: (step: string, codeLine: number) => void
  protected delayCallback: () => Promise<void>
  protected pauseCallback: () => Promise<void>

  constructor(
    state: AppState,
    updateCallback: (step: string, codeLine: number) => void,
    delayCallback: () => Promise<void>,
    pauseCallback: () => Promise<void>
  ) {
    this.state = state
    this.updateCallback = updateCallback
    this.delayCallback = delayCallback
    this.pauseCallback = pauseCallback
  }

  /**
   * 设置停止标志
   */
  public stop(): void {
    this.shouldStop = true
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
  }

  /**
   * 执行下一步
   */
  public nextStep(): void {
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
  }

  /**
   * 抽象排序方法，由子类实现
   */
  public abstract sort(arr: number[]): Promise<void>

  /**
   * 交换数组元素并更新状态
   */
  protected async swap(arr: number[], indexA: number, indexB: number): Promise<void> {
    swapArrayElements(arr, indexA, indexB)
    this.state.arr = [...arr]
    this.state.swaps = (this.state.swaps || 0) + 1
  }

  /**
   * 更新执行步骤
   */
  protected updateStep(step: string, codeLine: number): void {
    this.updateCallback(step, codeLine)
  }
}

/**
 * 冒泡排序算法实现
 */
export class BubbleSort extends SortingAlgorithm {
  public async sort(arr: number[]): Promise<void> {
    const max = arr.length - 1
    this.updateStep('开始冒泡排序', 1)
    
    for (let j = 0; j < max && !this.shouldStop; j++) {
      this.updateStep(`第 ${j + 1} 轮排序开始`, 2)
      let swapped = false
      
      for (let i = 0; i < max - j && !this.shouldStop; i++) {
        await this.pauseCallback()
        if (this.shouldStop) return
        
        this.state.indexA = i
        this.state.indexB = i + 1
        this.updateStep(`比较 arr[${i}]=${arr[i]} 和 arr[${i + 1}]=${arr[i + 1]}`, 3)
        this.state.comparisons = (this.state.comparisons || 0) + 1
        
        await this.delayCallback()
        
        if (arr[i] > arr[i + 1]) {
          this.updateStep(`${arr[i]} > ${arr[i + 1]}，交换位置`, 4)
          await this.swap(arr, i, i + 1)
          swapped = true
        } else {
          this.updateStep(`${arr[i]} <= ${arr[i + 1]}，不需要交换`, 5)
        }
        
        await this.delayCallback()
      }
      
      // 标记本轮最后一个元素为已排序
      this.state.sortedIndices?.add(max - j)
      this.updateStep(`第 ${j + 1} 轮完成，位置 ${max - j} 已确定`, 6)
      
      if (!swapped) {
        this.updateStep('没有发生交换，排序提前完成', 7)
        break
      }
    }
  }
}

/**
 * 快速排序算法实现
 */
export class QuickSort extends SortingAlgorithm {
  public async sort(arr: number[]): Promise<void> {
    await this.quickSort(arr, 0, arr.length - 1)
  }

  private async quickSort(arr: number[], low: number, high: number): Promise<void> {
    if (low < high && !this.shouldStop) {
      this.updateStep(`快速排序区间 [${low}, ${high}]`, 1)
      const pi = await this.partition(arr, low, high)
      if (!this.shouldStop) {
        this.updateStep(`基准位置确定为 ${pi}`, 2)
        await this.quickSort(arr, low, pi - 1)
        await this.quickSort(arr, pi + 1, high)
      }
    }
  }

  private async partition(arr: number[], low: number, high: number): Promise<number> {
    const pivot = arr[high]
    let i = low - 1

    this.state.indexC = high
    this.updateStep(`选择基准元素 arr[${high}]=${pivot}`, 3)
    await this.delayCallback()

    for (let j = low; j < high && !this.shouldStop; j++) {
      await this.pauseCallback()
      if (this.shouldStop) return i + 1
      
      this.state.indexA = i + 1
      this.state.indexB = j
      this.updateStep(`比较 arr[${j}]=${arr[j]} 与基准 ${pivot}`, 4)
      this.state.comparisons = (this.state.comparisons || 0) + 1
      await this.delayCallback()
      
      if (arr[j] < pivot) {
        i++
        this.updateStep(`${arr[j]} < ${pivot}，移动到左侧`, 5)
        if (i !== j) {
          await this.swap(arr, i, j)
        }
      }
      
      await this.delayCallback()
    }
    
    if (!this.shouldStop) {
      this.updateStep(`将基准元素放到正确位置`, 6)
      await this.swap(arr, i + 1, high)
      this.state.sortedIndices?.add(i + 1)
    }
    
    return i + 1
  }
}

/**
 * 归并排序算法实现
 */
export class MergeSort extends SortingAlgorithm {
  public async sort(arr: number[]): Promise<void> {
    await this.mergeSort(arr, 0, arr.length - 1)
  }

  private async mergeSort(arr: number[], left: number, right: number): Promise<void> {
    if (left < right && !this.shouldStop) {
      const mid = Math.floor((left + right) / 2)
      this.updateStep(`分割区间 [${left}, ${right}] 为 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`, 1)
      await this.delayCallback()
      
      await this.mergeSort(arr, left, mid)
      await this.mergeSort(arr, mid + 1, right)
      await this.merge(arr, left, mid, right)
    }
  }

  private async merge(arr: number[], left: number, mid: number, right: number): Promise<void> {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    
    this.updateStep(`合并区间 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`, 2)
    await this.delayCallback()
    
    let i = 0, j = 0, k = left
    
    while (i < leftArr.length && j < rightArr.length && !this.shouldStop) {
      await this.pauseCallback()
      if (this.shouldStop) return
      
      this.state.indexA = k
      this.state.indexB = left + i
      this.state.indexC = mid + 1 + j
      this.updateStep(`比较 ${leftArr[i]} 和 ${rightArr[j]}`, 3)
      this.state.comparisons = (this.state.comparisons || 0) + 1
      await this.delayCallback()
      
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        this.updateStep(`选择 ${leftArr[i]} 放入位置 ${k}`, 4)
        i++
      } else {
        arr[k] = rightArr[j]
        this.updateStep(`选择 ${rightArr[j]} 放入位置 ${k}`, 5)
        j++
      }
      k++
      
      this.state.arr = [...arr]
      await this.delayCallback()
    }
    
    while (i < leftArr.length && !this.shouldStop) {
      await this.pauseCallback()
      if (this.shouldStop) return
      
      this.state.indexA = k
      this.updateStep(`复制剩余元素 ${leftArr[i]} 到位置 ${k}`, 6)
      arr[k] = leftArr[i]
      i++
      k++
      
      this.state.arr = [...arr]
      await this.delayCallback()
    }
    
    while (j < rightArr.length && !this.shouldStop) {
      await this.pauseCallback()
      if (this.shouldStop) return
      
      this.state.indexA = k
      this.updateStep(`复制剩余元素 ${rightArr[j]} 到位置 ${k}`, 7)
      arr[k] = rightArr[j]
      j++
      k++
      
      this.state.arr = [...arr]
      await this.delayCallback()
    }
    
    // 标记合并区间为已排序
    for (let idx = left; idx <= right; idx++) {
      this.state.sortedIndices?.add(idx)
    }
  }
}