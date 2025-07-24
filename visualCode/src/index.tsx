import {
  Component,
  bind,
  signal,
  tag,
  render,
  h,
  classNames,
  mixin,
  SignalValue,
} from 'omi'

type SortAlgorithm = 'bubble' | 'quick' | 'merge'
type ExecutionMode = 'auto' | 'step'

class Store {
  state: SignalValue<{
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
  }>

  private sortingPromise: Promise<void> | null = null
  private shouldStop = false
  private stepResolve: (() => void) | null = null

  constructor() {
    this.state = signal({})
    this.init()
  }

  init() {
    this.state.value.arr = Array.from({ length: 20 }, () => this.randomInt())
    this.state.value.indexA = -1
    this.state.value.indexB = -1
    this.state.value.indexC = -1
    this.state.value.sorting = false
    this.state.value.paused = false
    this.state.value.algorithm = 'bubble'
    this.state.value.speed = 50
    this.state.value.completed = false
    this.state.value.sortedIndices = new Set()
    this.state.value.currentStep = ''
    this.state.value.currentCodeLine = -1
    this.state.value.executionMode = 'auto'
    this.state.value.stepCount = 0
    this.state.value.comparisons = 0
    this.state.value.swaps = 0
    this.state.update()
  }

  randomInt() {
    return Math.ceil(Math.random() * 50)
  }

  @bind
  reset() {
    this.shouldStop = true
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
    this.init()
  }

  @bind
  togglePause() {
    this.state.value.paused = !this.state.value.paused
    this.state.update()
  }

  @bind
  setAlgorithm(algorithm: SortAlgorithm) {
    if (!this.state.value.sorting) {
      this.state.value.algorithm = algorithm
      this.state.update()
    }
  }

  @bind
  setSpeed(speed: number) {
    this.state.value.speed = speed
    this.state.update()
  }

  @bind
  setExecutionMode(mode: ExecutionMode) {
    if (!this.state.value.sorting) {
      this.state.value.executionMode = mode
      this.state.update()
    }
  }

  @bind
  nextStep() {
    if (this.stepResolve) {
      this.stepResolve()
      this.stepResolve = null
    }
  }

  @bind
  async sort() {
    if (this.state.value.sorting) return
    
    this.shouldStop = false
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
      switch (algorithm) {
        case 'bubble':
          await this.bubbleSort(arr)
          break
        case 'quick':
          await this.quickSort(arr, 0, arr.length - 1)
          break
        case 'merge':
          await this.mergeSort(arr, 0, arr.length - 1)
          break
      }
      
      if (!this.shouldStop) {
        this.state.value.completed = true
        this.state.value.currentStep = '排序完成！'
        this.state.value.currentCodeLine = -1
        // 标记所有元素为已排序
        this.state.value.sortedIndices = new Set(Array.from({ length: arr.length }, (_, i) => i))
      }
    } catch (error) {
      console.error('排序过程中出现错误:', error)
    } finally {
      this.state.value.indexA = -1
      this.state.value.indexB = -1
      this.state.value.indexC = -1
      this.state.value.sorting = false
      this.state.value.paused = false
      this.state.update()
    }
  }

  async bubbleSort(arr: number[]) {
    const max = arr.length - 1
    this.updateStep('开始冒泡排序', 1)
    
    for (let j = 0; j < max && !this.shouldStop; j++) {
      this.updateStep(`第 ${j + 1} 轮排序开始`, 2)
      let swapped = false
      
      for (let i = 0; i < max - j && !this.shouldStop; i++) {
        await this.waitIfPaused()
        if (this.shouldStop) return
        
        this.state.value.indexA = i
        this.state.value.indexB = i + 1
        this.updateStep(`比较 arr[${i}]=${arr[i]} 和 arr[${i + 1}]=${arr[i + 1]}`, 3)
        this.state.value.comparisons!++
        this.state.update()
        
        await this.stepDelay()
        
        if (arr[i] > arr[i + 1]) {
          this.updateStep(`${arr[i]} > ${arr[i + 1]}，交换位置`, 4)
          await this.swap(arr, i, i + 1)
          swapped = true
          this.state.value.swaps!++
        } else {
          this.updateStep(`${arr[i]} <= ${arr[i + 1]}，不需要交换`, 5)
        }
        
        await this.stepDelay()
      }
      
      // 标记本轮最后一个元素为已排序
      this.state.value.sortedIndices!.add(max - j)
      this.updateStep(`第 ${j + 1} 轮完成，位置 ${max - j} 已确定`, 6)
      
      if (!swapped) {
        this.updateStep('没有发生交换，排序提前完成', 7)
        break
      }
    }
  }

  async quickSort(arr: number[], low: number, high: number) {
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

  async partition(arr: number[], low: number, high: number): Promise<number> {
    const pivot = arr[high]
    let i = low - 1

    this.state.value.indexC = high
    this.updateStep(`选择基准元素 arr[${high}]=${pivot}`, 3)
    this.state.update()
    await this.stepDelay()

    for (let j = low; j < high && !this.shouldStop; j++) {
      await this.waitIfPaused()
      if (this.shouldStop) return i + 1
      
      this.state.value.indexA = i + 1
      this.state.value.indexB = j
      this.updateStep(`比较 arr[${j}]=${arr[j]} 与基准 ${pivot}`, 4)
      this.state.value.comparisons!++
      this.state.update()
      await this.stepDelay()
      
      if (arr[j] < pivot) {
        i++
        this.updateStep(`${arr[j]} < ${pivot}，移动到左侧`, 5)
        if (i !== j) {
          await this.swap(arr, i, j)
          this.state.value.swaps!++
        }
      }
      
      await this.stepDelay()
    }
    
    if (!this.shouldStop) {
      this.updateStep(`将基准元素放到正确位置`, 6)
      await this.swap(arr, i + 1, high)
      this.state.value.swaps!++
      this.state.value.sortedIndices!.add(i + 1)
    }
    
    return i + 1
  }

  async mergeSort(arr: number[], left: number, right: number) {
    if (left < right && !this.shouldStop) {
      const mid = Math.floor((left + right) / 2)
      this.updateStep(`分割区间 [${left}, ${right}] 为 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`, 1)
      await this.stepDelay()
      
      await this.mergeSort(arr, left, mid)
      await this.mergeSort(arr, mid + 1, right)
      await this.merge(arr, left, mid, right)
    }
  }

  async merge(arr: number[], left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    
    this.updateStep(`合并区间 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`, 2)
    await this.stepDelay()
    
    let i = 0, j = 0, k = left
    
    while (i < leftArr.length && j < rightArr.length && !this.shouldStop) {
      await this.waitIfPaused()
      if (this.shouldStop) return
      
      this.state.value.indexA = k
      this.state.value.indexB = left + i
      this.state.value.indexC = mid + 1 + j
      this.updateStep(`比较 ${leftArr[i]} 和 ${rightArr[j]}`, 3)
      this.state.value.comparisons!++
      this.state.update()
      await this.stepDelay()
      
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
      
      this.state.value.arr = [...arr]
      this.state.update()
      await this.stepDelay()
    }
    
    while (i < leftArr.length && !this.shouldStop) {
      await this.waitIfPaused()
      if (this.shouldStop) return
      
      this.state.value.indexA = k
      this.updateStep(`复制剩余元素 ${leftArr[i]} 到位置 ${k}`, 6)
      arr[k] = leftArr[i]
      i++
      k++
      
      this.state.value.arr = [...arr]
      this.state.update()
      await this.stepDelay()
    }
    
    while (j < rightArr.length && !this.shouldStop) {
      await this.waitIfPaused()
      if (this.shouldStop) return
      
      this.state.value.indexA = k
      this.updateStep(`复制剩余元素 ${rightArr[j]} 到位置 ${k}`, 7)
      arr[k] = rightArr[j]
      j++
      k++
      
      this.state.value.arr = [...arr]
      this.state.update()
      await this.stepDelay()
    }
    
    // 标记合并区间为已排序
    for (let idx = left; idx <= right; idx++) {
      this.state.value.sortedIndices!.add(idx)
    }
  }

  updateStep(step: string, codeLine: number) {
    this.state.value.currentStep = step
    this.state.value.currentCodeLine = codeLine
    this.state.value.stepCount!++
    this.state.update()
  }

  async swap(arr: number[], indexA: number, indexB: number) {
    const temp = arr[indexA]
    arr[indexA] = arr[indexB]
    arr[indexB] = temp
    this.state.value.arr = [...arr]
    this.state.update()
  }

  async stepDelay() {
    if (this.state.value.executionMode === 'step') {
      return new Promise<void>((resolve) => {
        this.stepResolve = resolve
      })
    } else {
      const speed = this.state.value.speed || 50
      const delayTime = 101 - speed
      return new Promise(resolve => setTimeout(resolve, delayTime))
    }
  }

  async waitIfPaused() {
    while (this.state.value.paused && !this.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

const store = new Store()

@tag('sort-visualizer')
class SortVisualizer extends Component {
  static css = `
    .main-container {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      gap: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .left-panel {
      flex: 2;
      min-width: 800px;
    }
    
    .right-panel {
      flex: 1;
      min-width: 350px;
    }
    
    .title {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
      font-size: 28px;
      font-weight: 600;
    }
    
    .visualization-area {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #dee2e6;
      border-radius: 12px;
      padding: 30px 20px;
      margin-bottom: 20px;
      min-height: 350px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .bar-container {
      position: relative;
      display: inline-block;
      margin: 0 2px;
    }
    
    .bar {
      width: 25px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      font-weight: 600;
      color: #495057;
      background: rgba(255, 255, 255, 0.9);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #dee2e6;
      min-width: 20px;
      text-align: center;
    }
    
    .bar.unsorted {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    }
    
    .bar.sorted {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      animation: sortedPulse 0.6s ease-in-out;
    }
    
    .bar.comparing-a {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(220, 53, 69, 0.4);
    }
    
    .bar.comparing-b {
      background: linear-gradient(135deg, #fd7e14 0%, #e0a800 100%);
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(253, 126, 20, 0.4);
    }
    
    .bar.pivot {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      transform: translateY(-8px);
      box-shadow: 0 10px 20px rgba(23, 162, 184, 0.4);
    }
    
    @keyframes sortedPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .info-panel {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .info-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 8px;
    }
    
    .current-step {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 12px 16px;
      margin-bottom: 15px;
      border-radius: 0 8px 8px 0;
      font-weight: 500;
      color: #1565c0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e9ecef;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6c757d;
      margin-top: 4px;
    }
    
    .code-panel {
      background: #2d3748;
      border-radius: 8px;
      padding: 16px;
      color: #e2e8f0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .code-line {
      padding: 2px 8px;
      border-radius: 4px;
      margin: 1px 0;
      transition: all 0.2s ease;
    }
    
    .code-line.active {
      background: #4a5568;
      border-left: 3px solid #4299e1;
      transform: translateX(4px);
    }
    
    .controls {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 25px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      align-items: end;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .control-group label {
      font-size: 14px;
      color: #495057;
      font-weight: 600;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    button {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    button.step {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    button.pause {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
    }
    
    button.reset {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }
    
    select {
      padding: 10px 14px;
      border: 2px solid #ced4da;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }
    
    select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    .speed-control {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .speed-slider {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #e9ecef;
      outline: none;
      -webkit-appearance: none;
    }
    
    .speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .speed-value {
      font-size: 14px;
      color: #495057;
      font-weight: 600;
      min-width: 35px;
      text-align: center;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      gap: 25px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .status {
      text-align: center;
      margin-top: 20px;
      font-size: 16px;
      font-weight: 600;
      padding: 12px;
      border-radius: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
    }
    
    .status.completed {
      background: #d4edda;
      color: #155724;
      border-color: #c3e6cb;
    }
    
    .status.sorting {
      background: #cce5ff;
      color: #004085;
      border-color: #b3d7ff;
    }
    
    .mode-toggle {
      display: flex;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 4px;
      border: 1px solid #dee2e6;
    }
    
    .mode-option {
      flex: 1;
      padding: 8px 16px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .mode-option.active {
      background: #007bff;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
  `

  getAlgorithmCode() {
    const { state } = store
    const algorithm = state.value.algorithm || 'bubble'
    
    const codes = {
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
    }
    
    return codes[algorithm] || []
  }

  render() {
    const { state } = store
    const algorithm = state.value.algorithm || 'bubble'
    const executionMode = state.value.executionMode || 'auto'
    
    const algorithmNames = {
      bubble: '冒泡排序',
      quick: '快速排序',
      merge: '归并排序'
    }

    return (
      <div class="main-container">
        <div class="left-panel">
          <h1 class="title">交互式排序算法可视化</h1>
          
          <div class="visualization-area">
            {state.value.arr?.map((item: number, index: number) => {
              let barClass = 'bar '
              
              if (state.value.sortedIndices?.has(index)) {
                barClass += 'sorted'
              } else if (index === state.value.indexA) {
                barClass += 'comparing-a'
              } else if (index === state.value.indexB) {
                barClass += 'comparing-b'
              } else if (index === state.value.indexC) {
                barClass += 'pivot'
              } else {
                barClass += 'unsorted'
              }
              
              return (
                <div class="bar-container">
                  <div class="bar-value">{item}</div>
                  <div
                    class={barClass}
                    style={{ height: `${item * 4}px` }}
                  ></div>
                </div>
              )
            })}
          </div>

          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);"></div>
              <span>未排序区域</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);"></div>
              <span>比较元素A</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(135deg, #fd7e14 0%, #e0a800 100%);"></div>
              <span>比较元素B</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);"></div>
              <span>基准/辅助元素</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);"></div>
              <span>已排序区域</span>
            </div>
          </div>

          <div class="controls">
            <div class="control-group">
              <label>算法选择</label>
              <select 
                value={algorithm}
                disabled={state.value.sorting}
                onChange={(e: any) => store.setAlgorithm(e.target.value)}
              >
                <option value="bubble">冒泡排序</option>
                <option value="quick">快速排序</option>
                <option value="merge">归并排序</option>
              </select>
            </div>

            <div class="control-group">
              <label>执行模式</label>
              <div class="mode-toggle">
                <button 
                  class={classNames('mode-option', { active: executionMode === 'auto' })}
                  disabled={state.value.sorting}
                  onClick={() => store.setExecutionMode('auto')}
                >
                  自动播放
                </button>
                <button 
                  class={classNames('mode-option', { active: executionMode === 'step' })}
                  disabled={state.value.sorting}
                  onClick={() => store.setExecutionMode('step')}
                >
                  逐步执行
                </button>
              </div>
            </div>

            {executionMode === 'auto' && (
              <div class="control-group">
                <label>速度控制</label>
                <div class="speed-control">
                  <input
                    type="range"
                    class="speed-slider"
                    min="1"
                    max="100"
                    value={state.value.speed}
                    onChange={(e: any) => store.setSpeed(parseInt(e.target.value))}
                  />
                  <span class="speed-value">{state.value.speed}</span>
                </div>
              </div>
            )}

            <div class="control-group">
              <label>操作控制</label>
              <div class="button-group">
                <button 
                  disabled={state.value.sorting && !state.value.paused}
                  onClick={store.sort}
                >
                  {state.value.sorting ? '排序中...' : `开始${algorithmNames[algorithm]}`}
                </button>

                {executionMode === 'step' && state.value.sorting && (
                  <button 
                    class="step"
                    onClick={store.nextStep}
                  >
                    下一步
                  </button>
                )}

                {executionMode === 'auto' && (
                  <button 
                    class="pause"
                    disabled={!state.value.sorting}
                    onClick={store.togglePause}
                  >
                    {state.value.paused ? '继续' : '暂停'}
                  </button>
                )}

                <button 
                  class="reset"
                  onClick={store.reset}
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          <div class={classNames('status', { 
            completed: state.value.completed,
            sorting: state.value.sorting 
          })}>
            {state.value.completed ? '排序完成！' : 
             state.value.sorting ? (state.value.paused ? '已暂停' : '排序中...') : 
             '准备开始排序'}
          </div>
        </div>

        <div class="right-panel">
          <div class="info-panel">
            <div class="info-title">执行信息</div>
            
            <div class="current-step">
              {state.value.currentStep || '等待开始...'}
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{state.value.stepCount || 0}</span>
                <div class="stat-label">执行步数</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">{state.value.comparisons || 0}</span>
                <div class="stat-label">比较次数</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">{state.value.swaps || 0}</span>
                <div class="stat-label">交换次数</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">{state.value.arr?.length || 0}</span>
                <div class="stat-label">数组长度</div>
              </div>
            </div>
          </div>

          <div class="info-panel">
            <div class="info-title">算法代码</div>
            <div class="code-panel">
              {this.getAlgorithmCode().map((line: string, index: number) => (
                <div 
                  class={classNames('code-line', {
                    active: index + 1 === state.value.currentCodeLine
                  })}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
