import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';


const LayerPanel: React.FC = () => {
  const { canvasData, selectedLayerId, selectLayer, deleteLayer, reorderLayers, updateLayer } = useAppStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!canvasData) {
    return (
      <div className="layer-panel">
        <h3>图层</h3>
        <div className="no-layers">
          <p>暂无图层</p>
          <p>在画布上添加元素以创建图层</p>
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
    e.preventDefault();
    const layerId = e.dataTransfer.getData('layerId');
    reorderLayers(layerId, dropIndex);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="layer-panel">
      <h3>图层</h3>
      <div className="layer-list">
        {sortedLayers.map((layer, index) => {
          const isSelected = layer.id === selectedLayerId;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={layer.id}
              className={`layer-item ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onClick={() => handleLayerClick(layer.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="layer-visibility">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={(e) => handleVisibilityChange(layer.id, e.target.checked)}
                />
              </div>
              <div className="layer-name">
                <span className={`layer-type-indicator ${layer.type}`}></span>
                {layer.name}
              </div>
              <button
                className="layer-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                title="删除图层"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      {sortedLayers.length === 0 && (
        <div className="no-layers">
          <p>暂无图层</p>
          <p>在画布上添加元素以创建图层</p>
        </div>
      )}
    </div>
  );
};

export default LayerPanel;