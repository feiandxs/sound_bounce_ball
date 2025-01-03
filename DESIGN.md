# 声控弹球游戏设计文档

## 功能描述

这是一个基于声音控制的物理弹球游戏，玩家可以通过声音来控制画面中彩色小球的运动状态。

### 核心功能

1. 视觉效果
   - 黑色背景的游戏界面
   - 多个不同颜色的小球
   - 物理效果：重力、碰撞、弹跳
   - 小球运动时的平滑动画

2. 声音控制
   - 实时麦克风输入捕捉
   - 声音强度检测
   - 根据声音强度控制小球弹跳高度

3. 交互控制
   - 声音灵敏度调节滑块
   - 小球数量调节
   - 重置按钮
   - 开始/暂停控制

## 技术选型

### 1. 物理引擎模块
- Matter.js：2D 物理引擎
  - 处理重力效果
  - 碰撞检测
  - 物体运动计算

### 2. 声音处理模块
- Web Audio API（浏览器原生）
  - 音频输入捕捉
  - 音频数据分析
  - 实时音量计算

### 3. UI 框架
- React：用于构建用户界面
- CSS Module：样式管理

### 4. 开发工具
- TypeScript：类型检查
- ESLint：代码规范

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── Game.tsx         # 游戏主组件，包含画布和物理世界
│   └── Controls.tsx     # 控制组件（音量灵敏度、球数量调节等）
├── hooks/               # 自定义Hook目录
│   ├── useAudio.ts      # 声音处理Hook
│   └── usePhysics.ts    # 物理引擎Hook
├── App.tsx              # 应用入口组件
├── App.css              # 应用全局样式
├── index.tsx            # 应用渲染入口
└── index.css            # 全局基础样式
```

## 文件功能说明

### 核心文件

1. `components/Game.tsx`
   - 创建和管理游戏画布
   - 初始化物理世界
   - 渲染小球和边界
   - 处理动画循环

2. `components/Controls.tsx`
   - 提供简单的控制界面
   - 灵敏度调节滑块
   - 小球数量调节
   - 重置按钮

3. `hooks/useAudio.ts`
   - 处理麦克风输入
   - 分析音频数据
   - 提供声音强度数据

4. `hooks/usePhysics.ts`
   - 封装Matter.js相关逻辑
   - 管理物理世界更新
   - 提供添加/移除物体的方法

### 入口文件

1. `App.tsx`
   - 应用主组件
   - 组合Game和Controls组件

2. `index.tsx`
   - 应用程序入口
   - 渲染根组件

### 样式文件

1. `App.css`
   - 应用级样式
   - 游戏容器样式

2. `index.css`
   - 全局重置样式
   - 基础样式变量

## 设计原则

1. **最小化原则**
   - 扁平的文件结构，只有必要的目录分层
   - 没有过度的组件拆分
   - 使用React hooks管理状态，无需额外状态管理库

2. **关注点分离**
   - 物理引擎逻辑封装在hook中
   - 声音处理逻辑独立封装
   - UI组件与游戏逻辑分离

3. **简单直接**
   - 所有代码都直接服务于核心游戏功能
   - 没有额外的路由或页面
   - 没有复杂的状态管理
   - 没有不必要的抽象层

## 技术依赖清单

```json
{
  "dependencies": {
    "matter-js": "^0.19.0",          // 物理引擎
    "@types/matter-js": "^0.19.5",   // Matter.js 的 TypeScript 类型定义
    "react": "^19.0.0",              // UI 框架
    "react-dom": "^19.0.0",          // React DOM
    "react-scripts": "5.0.1",        // Create React App 工具链
    "@types/react": "^18.2.0",       // React 类型定义
    "@types/react-dom": "^18.2.0",   // React DOM 类型定义
    "typescript": "^5.0.0",          // TypeScript 编译器
    "classnames": "^2.3.2"           // CSS 类名处理工具
  }
}
```

注：声音处理将使用浏览器原生的 Web Audio API，无需额外依赖。
