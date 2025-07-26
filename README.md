
# 排序算法可视化

一个基于 OMI 框架的排序算法可视化工具，使用 TypeScript 和 Vite 构建。

<img width="2976" height="1816" alt="image" src="https://github.com/user-attachments/assets/b3ed3be4-1b41-47ce-b1fa-5b272c65486f" />


## 特性

- 使用 OMI 框架的组件化开发和信号（Signal）状态管理
- 支持多种排序算法：冒泡排序、快速排序、归并排序
- 实时动画展示排序过程
- 支持自动播放和逐步执行模式
- 支持高亮显示当前执行的代码
- 统计排序过程中的比较次数和交换次数

## 技术栈

- **OMI**: 轻量级 Web 组件框架，提供信号（Signal）状态管理
- **TypeScript**: 提供类型安全
- **Vite**: 现代前端构建工具

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 项目结构

```
src/
├── algorithms/      # 排序算法实现
├── components/      # OMI 组件
├── constants/       # 常量定义
├── store/           # 状态管理
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 贡献

欢迎提交 Pull Request 或 Issue。
