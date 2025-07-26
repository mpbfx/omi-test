import { Component, tag, h, classNames } from 'omi'
import { store } from '../store/SortStore'
import { ALGORITHM_NAMES, ALGORITHM_CODES } from '../constants'
import { SortAlgorithm, ExecutionMode } from '../types'

@tag('sort-visualizer')
export class SortVisualizer extends Component {
  static css = `
    /* 主容器 - 使用flex布局 */
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* 标题区域 */
    .header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      backdrop-filter: blur(10px);
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    /* 主内容区域 - flex布局 */
    .main-content {
      display: flex;
      flex: 1;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    /* 左侧面板 - 可视化区域 */
    .left-panel {
      display: flex;
      flex-direction: column;
      flex: 2;
      min-width: 0;
      gap: 1.5rem;
    }

    /* 右侧面板 - 信息面板 */
    .right-panel {
      display: flex;
      flex-direction: column;
      flex: 0 0 320px;
      min-width: 280px;
      gap: 1rem;
    }

    /* 可视化区域 */
    .visualization-container {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .visualization-area {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 2rem 1rem;
      min-height: 300px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      gap: 2px;
    }

    /* 柱状图容器 */
    .bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .bar-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #495057;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #dee2e6;
      margin-bottom: 0.5rem;
      min-width: 24px;
      text-align: center;
    }

    .bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
      transform: translateY(-8px) scale(1.1);
      box-shadow: 0 12px 24px rgba(220, 53, 69, 0.4);
    }

    .bar.comparing-b {
      background: linear-gradient(135deg, #fd7e14 0%, #e0a800 100%);
      transform: translateY(-8px) scale(1.1);
      box-shadow: 0 12px 24px rgba(253, 126, 20, 0.4);
    }

    .bar.pivot {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      transform: translateY(-12px) scale(1.15);
      box-shadow: 0 16px 32px rgba(23, 162, 184, 0.4);
    }

    @keyframes sortedPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    /* 图例区域 */
    .legend {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      background: rgba(248, 249, 250, 0.8);
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #495057;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* 控制面板 */
    .controls-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .controls-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
      flex: 1;
    }

    .control-group label {
      font-size: 0.875rem;
      color: #495057;
      font-weight: 600;
    }

    /* 按钮组 */
    .button-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
      min-width: 120px;
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    button.step {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    }

    button.pause {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
    }

    button.reset {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
    }

    /* 选择框 */
    select {
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      background: white;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 150px;
    }

    select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    /* 执行模式切换 */
    .mode-toggle {
      display: flex;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 0.25rem;
      border: 1px solid #dee2e6;
    }

    .mode-option {
      flex: 1;
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      color: #6c757d;
    }

    .mode-option.active {
      background: #007bff;
      color: white;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    }

    /* 速度控制 */
    .speed-control {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .speed-slider {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #e9ecef;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
      transition: all 0.2s ease;
    }

    .speed-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }

    .speed-value {
      font-size: 0.875rem;
      color: #495057;
      font-weight: 600;
      min-width: 40px;
      text-align: center;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    /* 信息面板 */
    .info-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .info-header {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .info-content {
      padding: 1rem;
    }

    .current-step {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-left: 4px solid #2196f3;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border-radius: 0 6px 6px 0;
      font-weight: 500;
      color: #1565c0;
      font-size: 0.8125rem;
      line-height: 1.4;
    }

    /* 统计网格 */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 0.75rem 0.5rem;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      text-align: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.125rem;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.6875rem;
      color: #6c757d;
      font-weight: 500;
      line-height: 1.2;
    }

    /* 代码面板 */
    .code-panel {
      background: #2d3748;
      border-radius: 8px;
      padding: 0.75rem;
      color: #e2e8f0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      max-height: 180px;
      overflow-y: auto;
    }

    .code-line {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin: 0.125rem 0;
      transition: all 0.2s ease;
    }

    .code-line.active {
      background: #4a5568;
      border-left: 3px solid #4299e1;
      transform: translateX(4px);
      color: #90cdf4;
    }

    /* 状态指示器 */
    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      color: #6c757d;
    }

    .status-indicator.completed {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      border-color: #c3e6cb;
    }

    .status-indicator.sorting {
      background: linear-gradient(135deg, #cce5ff 0%, #b3d7ff 100%);
      color: #004085;
      border-color: #b3d7ff;
    }

    .status-indicator.paused {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      border-color: #ffeaa7;
    }
  `

  getAlgorithmCode(): string[] {
    const { state } = store
    const algorithm = state.value.algorithm || 'bubble'
    return [...(ALGORITHM_CODES[algorithm] || [])]
  }

  render() {
    const { state } = store
    const algorithm = state.value.algorithm || 'bubble'
    const executionMode = state.value.executionMode || 'auto'

    return (
      <div class="app-container">
        <header class="header">
          <h1 class="title">交互式排序算法可视化</h1>
        </header>

        <div class="main-content">
          <div class="left-panel">
            {/* 可视化区域 */}
            <div class="visualization-container">
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
                  <span>未排序</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);"></div>
                  <span>比较A</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(135deg, #fd7e14 0%, #e0a800 100%);"></div>
                  <span>比较B</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);"></div>
                  <span>基准</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);"></div>
                  <span>已排序</span>
                </div>
              </div>
            </div>

            {/* 控制面板 */}
            <div class="controls-container">
              <div class="controls">
                <div class="controls-row">
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
                </div>

                <div class="controls-row">
                  <div class="button-group">
                    <button 
                      disabled={state.value.sorting && !state.value.paused}
                      onClick={store.sort}
                    >
                      {state.value.sorting ? '排序中...' : `开始${ALGORITHM_NAMES[algorithm]}`}
                    </button>

                {executionMode === 'step' && state.value.sorting && (
                  <button 
                    class="step"
                    onClick={() => store.nextStep()}
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
            </div>

            {/* 状态指示器 */}
            <div class={classNames('status-indicator', { 
              completed: state.value.completed,
              sorting: state.value.sorting && !state.value.paused,
              paused: state.value.paused
            })}>
              {state.value.completed ? '🎉 排序完成！' : 
               state.value.paused ? '⏸️ 已暂停' :
               state.value.sorting ? '🔄 排序中...' : 
               '⏳ 准备开始排序'}
            </div>
          </div>

          <div class="right-panel">
            {/* 执行信息面板 */}
            <div class="info-panel">
              <div class="info-header">执行信息</div>
              <div class="info-content">
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
            </div>

            {/* 算法代码面板 */}
            <div class="info-panel">
              <div class="info-header">算法代码</div>
              <div class="info-content">
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
        </div>
      </div>
    )
  }
}