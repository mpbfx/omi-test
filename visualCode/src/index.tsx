/**
 * 排序算法可视化应用入口文件
 * 重构后的模块化入口，导入并渲染主组件
 */

import { render, h } from 'omi'
import { SortVisualizer } from './components/SortVisualizer'

// 渲染主应用组件
render(<sort-visualizer />, document.body)