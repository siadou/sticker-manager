import { TemplateData } from '../types';

export const BUILT_IN_TEMPLATES: TemplateData[] = [
  {
    id: 'template-builtin-a4-5x5',
    name: 'A4排版 (5x5网格)',
    canvasSettings: {
      width: 2480,  // A4 @ 300dpi
      height: 3508, // A4 @ 300dpi
      background: '#ffffff',
    },
    layers: [], // 图层将动态生成
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: '自动将贴纸库中的内容按5x5网格排列，包含贴纸名称',
  },
];
