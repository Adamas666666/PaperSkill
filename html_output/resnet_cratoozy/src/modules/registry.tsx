import React from 'react';
import { HeroScene, PianoAnalogy, ResNetModule } from './resnetWidgets';

export interface WidgetProps {
  chapterId: string;
  moduleId: string;
}

export const widgetRegistry: Record<string, React.FC<WidgetProps>> = {};

widgetRegistry['hero-resnet'] = HeroScene;
widgetRegistry['piano-analogy'] = PianoAnalogy;
widgetRegistry['resnet-module'] = ResNetModule;
