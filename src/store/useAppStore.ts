import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { CanvasData, LayerData, StickerLibrary, TemplateData, ToolType } from '../types';

interface AppStore {
  // 画布数据
  canvasData: CanvasData | null;
  // 贴纸库列表
  stickerLibraries: StickerLibrary[];
  // 模板列表
  templates: TemplateData[];
  // 选中的图层ID
  selectedLayerId: string | null;
  // 激活的工具
  activeTool: ToolType;
  // 左侧边栏当前标签
  leftSidebarTab: 'stickers' | 'templates';
  // 右侧边栏是否打开
  isRightSidebarOpen: boolean;
  // 左侧边栏是否打开
  isLeftSidebarOpen: boolean;
  // 画布缩放
  zoomLevel: number;

  // 画布操作
  createCanvas: (width: number, height: number, name?: string) => void;
  openCanvas: (canvasId: string) => void;
  saveCanvas: (canvasData: CanvasData) => void;
  updateCanvasSettings: (settings: Partial<CanvasData['canvasSettings']>) => void;

  // 图层操作
  addLayer: (layer: LayerData) => void;
  updateLayer: (layerId: string, updates: Partial<LayerData>) => void;
  deleteLayer: (layerId: string) => void;
  reorderLayers: (layerId: string, newIndex: number) => void;
  selectLayer: (layerId: string | null) => void;

  // 贴纸库操作
  createStickerLibrary: (name: string) => void;
  importStickerLibrary: (library: StickerLibrary) => void;
  exportStickerLibrary: (libraryId: string) => void;
  deleteStickerLibrary: (libraryId: string) => void;
  updateStickerLibrary: (libraryId: string, updates: Partial<StickerLibrary>) => void;
  addStickerToLibrary: (libraryId: string, sticker: LayerData) => void;
  updateStickerInLibrary: (libraryId: string, stickerId: string, updates: Partial<StickerContent>) => void;
  removeStickerFromLibrary: (libraryId: string, stickerId: string) => void;

  // 模板操作
  createTemplate: (name: string, canvasSettings: CanvasData['canvasSettings'], layers: LayerData[]) => void;
  importTemplate: (template: TemplateData) => void;
  exportTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;

  // UI操作
  setActiveTool: (tool: ToolType) => void;
  setLeftSidebarTab: (tab: 'stickers' | 'templates') => void;
  toggleRightSidebar: () => void;
  toggleLeftSidebar: () => void;
  // 缩放操作
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoomLevel: (level: number) => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      canvasData: null,
      stickerLibraries: [],
      templates: [],
      selectedLayerId: null,
      activeTool: 'select',
      leftSidebarTab: 'stickers',
      isRightSidebarOpen: true,
      isLeftSidebarOpen: true,
      zoomLevel: 1,

      // 画布操作
      createCanvas: (width, height, name = '未命名画布') => {
        const newCanvas: CanvasData = {
          id: `canvas-${Date.now()}`,
          name,
          canvasSettings: {
            width,
            height,
            background: '#ffffff',
          },
          layers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ canvasData: newCanvas });
      },

      openCanvas: (canvasData: CanvasData) => {
        set({ canvasData });
      },

      saveCanvas: (canvasData) => {
        // 在实际应用中，可能需要将画布数据保存到localStorage或文件
        // 这里简化处理
        set({ canvasData });
      },

      updateCanvasSettings: (settings) => {
        set((state) => {
          if (!state.canvasData) return state;

          return {
            canvasData: {
              ...state.canvasData,
              canvasSettings: {
                ...state.canvasData.canvasSettings,
                ...settings,
              },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      // 图层操作
      addLayer: (layer) => {
        set((state) => {
          if (!state.canvasData) return state;

          return {
            canvasData: {
              ...state.canvasData,
              layers: [...state.canvasData.layers, layer],
              updatedAt: new Date().toISOString(),
            },
            selectedLayerId: layer.id,
          };
        });
      },

      updateLayer: (layerId, updates) => {
        set((state) => {
          if (!state.canvasData) return state;

          const updatedLayers = state.canvasData.layers.map((layer) =>
            layer.id === layerId ? { ...layer, ...updates } : layer
          );

          return {
            canvasData: {
              ...state.canvasData,
              layers: updatedLayers,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteLayer: (layerId) => {
        set((state) => {
          if (!state.canvasData) return state;

          const updatedLayers = state.canvasData.layers.filter((layer) => layer.id !== layerId);
          const newSelectedLayerId = state.selectedLayerId === layerId ? null : state.selectedLayerId;

          return {
            canvasData: {
              ...state.canvasData,
              layers: updatedLayers,
              updatedAt: new Date().toISOString(),
            },
            selectedLayerId: newSelectedLayerId,
          };
        });
      },

      reorderLayers: (layerId, newIndex) => {
        set((state) => {
          if (!state.canvasData) return state;

          const layers = [...state.canvasData.layers];
          const layerIndex = layers.findIndex((layer) => layer.id === layerId);

          if (layerIndex === -1 || newIndex < 0 || newIndex >= layers.length) {
            return state;
          }

          const [movedLayer] = layers.splice(layerIndex, 1);
          layers.splice(newIndex, 0, movedLayer);

          // 更新zIndex
          const updatedLayers = layers.map((layer, index) => ({
            ...layer,
            zIndex: index,
          }));

          return {
            canvasData: {
              ...state.canvasData,
              layers: updatedLayers,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      selectLayer: (layerId) => {
        set({ selectedLayerId: layerId });
      },

      // 贴纸库操作
      createStickerLibrary: (name) => {
        const newLibrary: StickerLibrary = {
          id: `library-${Date.now()}`,
          name,
          stickers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          stickerLibraries: [...state.stickerLibraries, newLibrary],
        }));
      },

      importStickerLibrary: (library) => {
        set((state) => ({
          stickerLibraries: [...state.stickerLibraries, library],
        }));
      },

      exportStickerLibrary: (libraryId) => {
        const library = get().stickerLibraries.find((lib) => lib.id === libraryId);
        if (!library) return;

        const dataStr = JSON.stringify(library, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${library.name}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      deleteStickerLibrary: (libraryId) => {
        set((state) => ({
          stickerLibraries: state.stickerLibraries.filter((lib) => lib.id !== libraryId),
        }));
      },

      updateStickerLibrary: (libraryId, updates) => {
        set((state) => ({
          stickerLibraries: state.stickerLibraries.map((lib) =>
            lib.id === libraryId ? { ...lib, ...updates, updatedAt: new Date().toISOString() } : lib
          ),
        }));
      },

      addStickerToLibrary: (libraryId, sticker) => {
        set((state) => {
          const updatedLibraries = state.stickerLibraries.map((lib) => {
            if (lib.id === libraryId) {
              return {
                ...lib,
                stickers: [...lib.stickers, sticker as any], // 暂时使用类型断言
                updatedAt: new Date().toISOString(),
              };
            }
            return lib;
          });

          return { stickerLibraries: updatedLibraries };
        });
      },

      updateStickerInLibrary: (libraryId, stickerId, updates) => {
        set((state) => {
          const updatedLibraries = state.stickerLibraries.map((lib) => {
            if (lib.id === libraryId) {
              return {
                ...lib,
                stickers: lib.stickers.map((sticker) =>
                  sticker.id === stickerId ? { ...sticker, ...updates } : sticker
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return lib;
          });

          return { stickerLibraries: updatedLibraries };
        });
      },

      removeStickerFromLibrary: (libraryId, stickerId) => {
        set((state) => {
          const updatedLibraries = state.stickerLibraries.map((lib) => {
            if (lib.id === libraryId) {
              return {
                ...lib,
                stickers: lib.stickers.filter((sticker) => sticker.id !== stickerId),
                updatedAt: new Date().toISOString(),
              };
            }
            return lib;
          });

          return { stickerLibraries: updatedLibraries };
        });
      },

      // 模板操作
      createTemplate: (name, canvasSettings, layers) => {
        const newTemplate: TemplateData = {
          id: `template-${Date.now()}`,
          name,
          canvasSettings,
          layers,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      importTemplate: (template) => {
        set((state) => ({
          templates: [...state.templates, template],
        }));
      },

      exportTemplate: (templateId) => {
        const template = get().templates.find((temp) => temp.id === templateId);
        if (!template) return;

        const dataStr = JSON.stringify(template, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${template.name}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((temp) => temp.id !== templateId),
        }));
      },

      // UI操作
      setActiveTool: (tool) => {
        set({ activeTool: tool });
      },

      setLeftSidebarTab: (tab) => {
        set({ leftSidebarTab: tab });
      },

      toggleRightSidebar: () => {
        set((state) => ({
          isRightSidebarOpen: !state.isRightSidebarOpen,
        }));
      },

      toggleLeftSidebar: () => {
        set((state) => ({
          isLeftSidebarOpen: !state.isLeftSidebarOpen,
        }));
      },

      // 缩放操作
      zoomIn: () => {
        set((state) => ({
          zoomLevel: Math.min(state.zoomLevel + 0.1, 3), // 最大放大到3倍
        }));
      },
      zoomOut: () => {
        set((state) => ({
          zoomLevel: Math.max(state.zoomLevel - 0.1, 0.1), // 最小缩小到0.1倍
        }));
      },
      resetZoom: () => {
        set((state) => ({
          zoomLevel: 1,
        }));
      },
      setZoomLevel: (level) => {
        set((state) => ({
          zoomLevel: Math.max(Math.min(level, 3), 0.1),
        }));
      },
    }  ),
    {
      name: 'sticker-generator-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = await get(name);
          return value || null;
        },
        setItem: async (name, value) => {
          await set(name, value);
        },
        removeItem: async (name) => {
          await del(name);
        },
      })),
      version: 1,
    }
  )
);

export default useAppStore;