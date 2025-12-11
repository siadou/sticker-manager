import React, { useState } from 'react';
import { DeleteOutlined, FontSizeOutlined, PictureOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import type { TextContent } from '../types';


const LayerPanel: React.FC = () => {
  const { canvasData, selectedLayerId, selectLayer, deleteLayer, reorderLayers, updateLayer, addLayer } = useAppStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddTextLayer = () => {
    if (!canvasData) return;

    const newTextLayer: TextContent = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: '文字图层',
      visible: true,
      opacity: 1,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      rotation: 0,
      zIndex: canvasData.layers.length,
      content: '双击编辑文字',
      font: 'Arial, sans-serif',
      fontSize: 24,
      color: '#000000',
      alignment: 'left',
      lineHeight: 1.2,
    };

    addLayer(newTextLayer);
  };

  if (!canvasData) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">图层</h3>
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm mb-1">暂无图层</p>
          <p className="text-xs">在画布上添加元素以创建图层</p>
        </div>
      </div>
    );
  }

  // 根据zIndex排序图层
  const sortedLayers = [...canvasData.layers].sort((a, b) => a.zIndex - b.zIndex);

  const handleLayerClick = (layerId: string) => {
    selectLayer(layerId);
  };

  const handleVisibilityChange = (layerId: string, visible: boolean) => {
    updateLayer(layerId, { visible });
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    e.dataTransfer.setData('layerId', layerId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    console.log(e);
    e.preventDefault();
    const layerId = e.dataTransfer.getData('layerId');
    reorderLayers(layerId, dropIndex);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="bg-white rounded border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">图层</h3>
        <button
          onClick={handleAddTextLayer}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
          title="添加文字图层"
        >
          <PlusOutlined />
          文字
        </button>
      </div>
      <div className="space-y-1">
        {sortedLayers.map((layer, index) => {
          const isSelected = layer.id === selectedLayerId;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={layer.id}
              className={`flex items-center justify-between p-2 rounded border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} ${isDragOver ? 'border-dashed border-gray-400 bg-gray-100' : ''} cursor-move transition-all duration-150`}
              onClick={() => handleLayerClick(layer.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center mr-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisibilityChange(layer.id, !layer.visible);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title={layer.visible ? '隐藏图层' : '显示图层'}
                >
                  {layer.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
              <div className="flex items-center flex-1">
                {layer.type === 'text' ? (
                  <FontSizeOutlined className="text-green-400 mr-2 text-sm" />
                ) : (
                  <PictureOutlined className="text-purple-400 mr-2 text-sm" />
                )}
                <span className="text-sm text-gray-700 truncate cursor-pointer">{layer.name}</span>
              </div>
              <button
                className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                title="删除图层"
              >
                <DeleteOutlined />
              </button>
            </div>
          );
        })}
      </div>
      {sortedLayers.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm mb-1">暂无图层</p>
          <p className="text-xs">在画布上添加元素以创建图层</p>
        </div>
      )}
    </div>
  );
};

export default LayerPanel;