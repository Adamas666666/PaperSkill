import React from 'react';
import { ExampleSlider } from './exampleSlider';
import { HeroPlain, HeroResnet } from './analogies';
import { AnaSteep, AnaView, AnaJump, AnaReach, AnaGear, AnaTrail, AnaStride, AnaMap, AnaPack, AnaRace } from './analogies';
import { ModDegrad } from './modDegrad';
import { ModView } from './modView';
import { ModInsight } from './modInsight';
import { ModAdd } from './modAdd';
import { ModShortcut } from './modShortcut';
import { ModForward } from './modForward';
import { ModLR } from './modLR';
import { ModArch } from './modArch';
import { ModDepth } from './modDepth';
import { ModBottleneck } from './modBottleneck';
import { ModRace } from './modRace';

// Widget registry: maps a `componentId` (referenced from src/data/tutorial.ts) to a
// React component. Every id used in tutorial.ts must be registered here.

export interface WidgetProps {
  chapterId: string;
  moduleId: string;
}

export const widgetRegistry: Record<string, React.FC<WidgetProps>> = {};

// 统一隐喻：登山攀岩（Mountain Climbing）
// Hero 两栏对比
widgetRegistry['heroPlain'] = HeroPlain;
widgetRegistry['heroResnet'] = HeroResnet;

// 章节类比自动动画（244×130，自动循环）
widgetRegistry['anaSteep'] = AnaSteep;   // §1 越陡越难爬
widgetRegistry['anaView'] = AnaView;     // §2 站得高看得全
widgetRegistry['anaJump'] = AnaJump;     // §3 两种起步
widgetRegistry['anaReach'] = AnaReach;   // §4 当前点+一小步
widgetRegistry['anaGear'] = AnaGear;     // §5 间距不同装备不同
widgetRegistry['anaTrail'] = AnaTrail;   // §6 一条路五段路标
widgetRegistry['anaStride'] = AnaStride; // §7 步子太大容易摔
widgetRegistry['anaMap'] = AnaMap;       // §8 路线图四个营地
widgetRegistry['anaPack'] = AnaPack;     // §9 窄缝面前收背包
widgetRegistry['anaRace'] = AnaRace;     // §10 谁先登顶

// 交互模块（P1–P8 活动模块）
widgetRegistry['modDegrad'] = ModDegrad;       // §1 P1 深度滑块 + 误差曲线
widgetRegistry['modView'] = ModView;           // §2 P5 观景台热区 + inset
widgetRegistry['modInsight'] = ModInsight;     // §3 P3 同步对比
widgetRegistry['modAdd'] = ModAdd;             // §4 P6 拖拽残差加法器
widgetRegistry['modShortcut'] = ModShortcut;   // §5 P4 捷径消融 A/B/C
widgetRegistry['modForward'] = ModForward;     // §6 P2 前向步进
widgetRegistry['modLR'] = ModLR;               // §7 P1 学习率滑块 + 损失曲线
widgetRegistry['modArch'] = ModArch;           // §8 P5 架构热区
widgetRegistry['modDepth'] = ModDepth;         // §8 P4 深度变体
widgetRegistry['modBottleneck'] = ModBottleneck; // §9 P4 瓶颈 vs 普通
widgetRegistry['modRace'] = ModRace;           // §10 P8 登顶竞赛

// 模板示例保留（未被教程引用，但保持脚手架可运行）
widgetRegistry['example-slider'] = ExampleSlider;
