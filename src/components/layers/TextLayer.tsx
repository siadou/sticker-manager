import React, { useRef, useEffect } from 'react';
import { TextContent, Size, Position } from '../../types';
import { ResizableLayer } from './ResizableLayer';

interface TextLayerProps {
  layer: TextContent;
  isSelected: boolean;
  zoomLevel: number;
  onResize: (id: string, newSize: Size, newPosition: Position) => void;
  onUpdate: (id: string, updates: Partial<TextContent>) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  isEditing: boolean;
  onBlur: () => void;
  setEditingText: (text: string) => void;
  editingText: string;
}

export const TextLayer: React.FC<TextLayerProps> = ({
  layer,
  isSelected,
  zoomLevel,
  onUpdate,
  onMouseDown,
  onClick,
  onDoubleClick,
  onDragStart,
  isEditing,
  onBlur,
  setEditingText,
  editingText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBlur();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      onBlur();
    }
  };

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.position.x}px`,
    top: `${layer.position.y}px`,
    width: `${layer.size.width}px`,
    height: `${layer.size.height}px`,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    zIndex: layer.zIndex,
    cursor: isEditing ? 'text' : 'move',
    border: isSelected ? '2px solid #3b82f6' : 'none',
    boxShadow: isSelected ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
    padding: '4px',
    overflow: 'hidden',
  };

  const handleResize = (id: string, newSize: Size, newPosition: Position) => {
      // Calculate scale factor based on height change
      // Avoid division by zero
      if (layer.size.height === 0) return;
      
      const scaleFactor = newSize.height / layer.size.height;
      const newFontSize = layer.fontSize * scaleFactor;
      
      // Update both size/position and fontSize
      onUpdate(id, { 
          size: newSize, 
          position: newPosition,
          fontSize: newFontSize 
      });
  };

  return (
    <ResizableLayer
      layer={layer}
      isSelected={isSelected}
      zoomLevel={zoomLevel}
      onResize={handleResize}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={!isEditing}
      onDragStart={onDragStart}
      style={layerStyle}
      className="layer text-layer"
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleTextKeyDown}
          style={{
            width: '100%',
            height: '100%',
            fontFamily: layer.font,
            fontSize: `${layer.fontSize}px`,
            fontWeight: layer.fontWeight || 400,
            color: layer.color,
            textAlign: layer.alignment,
            lineHeight: `${layer.lineHeight}`,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #3b82f6',
            padding: '4px',
            resize: 'none',
            outline: 'none',
          }}
        />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          fontFamily: layer.font,
          fontSize: `${layer.fontSize}px`,
          fontWeight: layer.fontWeight || 400,
          color: layer.color,
          textAlign: layer.alignment,
          lineHeight: `${layer.lineHeight}`,
          whiteSpace: 'pre-wrap', // 保留换行符和空格
          wordBreak: 'break-word', // 支持长单词换行
        }}>
          <span style={{ 
            width: '100%',
            textAlign: layer.alignment,
          }}>
            {layer.content}
          </span>
        </div>
      )}
    </ResizableLayer>
  );
};

