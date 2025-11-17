export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  background: string;
}

export interface LayerData {
  id: string;
  type: 'sticker' | 'text';
  name: string;
  visible: boolean;
  opacity: number;
  position: Position;
  size: Size;
  rotation: number;
  zIndex: number;
}

export interface StickerContent extends LayerData {
  content: string; // 贴纸图片URL
  clipPath?: string; // SVG路径
  effects?: {
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    border?: {
      color: string;
      width: number;
    };
  };
}

export interface TextContent extends LayerData {
  content: string;
  font: string;
  fontSize: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface StickerLibrary {
  id: string;
  name: string;
  stickers: StickerContent[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateData {
  id: string;
  name: string;
  canvasSettings: CanvasSettings;
  layers: LayerData[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface CanvasData {
  id: string;
  name: string;
  canvasSettings: CanvasSettings;
  layers: LayerData[];
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  description?: string;
}

export type ToolType = 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'sticker';

export interface AppState {
  canvasData: CanvasData | null;
  stickerLibraries: StickerLibrary[];
  templates: TemplateData[];
  selectedLayerId: string | null;
  activeTool: ToolType;
  leftSidebarTab: 'stickers' | 'templates';
  isRightSidebarOpen: boolean;
  isLeftSidebarOpen: boolean;
}