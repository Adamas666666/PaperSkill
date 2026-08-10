import React from 'react';
import { ExampleSlider } from './exampleSlider';
import { HeroOld, HeroNew, W1, W2, W3, W4, W5, W6 } from './widgetA';
import { W7, W8, W9, W10, W11, W12, W13, W14 } from './widgetB';
import { W15, W16, W17, W18, W19, W20 } from './widgetC';
import {
  Ana1,
  Ana2,
  Ana3,
  Ana4,
  Ana5,
  Ana6,
  Ana7,
  Ana8,
  Ana9,
  Ana10,
} from './analogy';

// Widget registry: maps a `componentId` (referenced from src/data/tutorial.ts) to a
// React component. The generator ADDS entries here for every paper-specific canvas
// widget (hero sides, analogy animations, and interactive modules). A missing id
// renders a graceful placeholder, so the app never crashes on an unfinished id.
//
// Pattern to add a widget:
//   import { Ch1Mod1 } from './ch1mod1';
//   widgetRegistry['ch1mod1'] = Ch1Mod1;
// and create src/modules/ch1mod1.tsx exporting a component of type React.FC<WidgetProps>.

export interface WidgetProps {
  chapterId: string;
  moduleId: string;
}

export const widgetRegistry: Record<string, React.FC<WidgetProps>> = {};

// Example kept so the scaffold runs out-of-the-box. Replace/extend as needed.
widgetRegistry['example-slider'] = ExampleSlider;

// Hero sides
widgetRegistry['hero-old'] = HeroOld;
widgetRegistry['hero-new'] = HeroNew;

// Module widgets w1..w20
widgetRegistry['w1'] = W1;
widgetRegistry['w2'] = W2;
widgetRegistry['w3'] = W3;
widgetRegistry['w4'] = W4;
widgetRegistry['w5'] = W5;
widgetRegistry['w6'] = W6;
widgetRegistry['w7'] = W7;
widgetRegistry['w8'] = W8;
widgetRegistry['w9'] = W9;
widgetRegistry['w10'] = W10;
widgetRegistry['w11'] = W11;
widgetRegistry['w12'] = W12;
widgetRegistry['w13'] = W13;
widgetRegistry['w14'] = W14;
widgetRegistry['w15'] = W15;
widgetRegistry['w16'] = W16;
widgetRegistry['w17'] = W17;
widgetRegistry['w18'] = W18;
widgetRegistry['w19'] = W19;
widgetRegistry['w20'] = W20;

// Analogy widgets ana-1..ana-10
widgetRegistry['ana-1'] = Ana1;
widgetRegistry['ana-2'] = Ana2;
widgetRegistry['ana-3'] = Ana3;
widgetRegistry['ana-4'] = Ana4;
widgetRegistry['ana-5'] = Ana5;
widgetRegistry['ana-6'] = Ana6;
widgetRegistry['ana-7'] = Ana7;
widgetRegistry['ana-8'] = Ana8;
widgetRegistry['ana-9'] = Ana9;
widgetRegistry['ana-10'] = Ana10;
