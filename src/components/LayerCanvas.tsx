import React from 'react';
import useAppStore from '../store/useAppStore';
import { type LayerData } from '../types';

const LayerCanvas: React.FC = () => {
  const { canvasData, selectedLayerId, selectLayer } = useAppStore();

  if (!canvasData) {
    return null;
  }

  // 根据zIndex排序图层
  const sortedLayers = [...canvasData.layers].sort((a, b) => a.zIndex - b.zIndex);

  const handleLayerClick = (layerId: string) => {
    selectLayer(layerId);
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    e.dataTransfer.setData('layerId', layerId);
  };

  const renderLayer = (layer: LayerData) => {
    const isSelected = layer.id === selectedLayerId;
    const layerStyle = {
      position: 'absolute' as const,
      left: `${layer.position.x}px`,
      top: `${layer.position.y}px`,
      width: `${layer.size.width}px`,
      height: `${layer.size.height}px`,
      transform: `rotate(${layer.rotation}deg)`,
      opacity: layer.opacity,
      zIndex: layer.zIndex,
      cursor: 'move',
      border: isSelected ? '2px solid #00f' : 'none',
      boxShadow: isSelected ? '0 0 5px rgba(0, 0, 255, 0.5)' : 'none',
    };

    switch (layer.type) {
      case 'sticker':
        return (
          <div
            key={layer.id}
            className="layer sticker-layer"
            style={layerStyle}
            onClick={() => handleLayerClick(layer.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, layer.id)}
          >
            <img
              src={(layer as any).content}
              alt={layer.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        );
      case 'text':
        return (
          <div
            key={layer.id}
            className="layer text-layer"
            style={{
              ...layerStyle,
              fontFamily: (layer as any).font,
              fontSize: `${(layer as any).fontSize}px`,
              color: (layer as any).color,
              textAlign: (layer as any).alignment,
              lineHeight: `${(layer as any).lineHeight}`,
            }}
            onClick={() => handleLayerClick(layer.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, layer.id)}
          >
            {(layer as any).content}
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="layer-canvas">{sortedLayers.map(renderLayer)}</div>;
};

export default LayerCanvas;