import React from 'react';
import { StickerContent, Size, Position } from '../../types';
import { ResizableLayer } from './ResizableLayer';

interface StickerLayerProps {
  layer: StickerContent;
  isSelected: boolean;
  zoomLevel: number;
  onResize: (id: string, newSize: Size, newPosition: Position) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export const StickerLayer: React.FC<StickerLayerProps> = ({
  layer,
  isSelected,
  zoomLevel,
  onResize,
  onMouseDown,
  onClick,
  onDragStart,
}) => {
  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.position.x}px`,
    top: `${layer.position.y}px`,
    width: `${layer.size.width}px`,
    height: `${layer.size.height}px`,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    zIndex: layer.zIndex,
    cursor: 'move',
    border: isSelected ? '2px solid #3b82f6' : 'none',
    boxShadow: isSelected ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  return (
    <ResizableLayer
      layer={layer}
      isSelected={isSelected}
      zoomLevel={zoomLevel}
      onResize={onResize}
      onMouseDown={onMouseDown}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      style={layerStyle}
      className="layer sticker-layer"
    >
      <img
        src={layer.content}
        alt={layer.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
    </ResizableLayer>
  );
};

