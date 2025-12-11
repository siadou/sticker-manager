import React, { useState, useEffect, useCallback } from 'react';
import { LayerData, Size, Position } from '../../types';

interface ResizableLayerProps {
  layer: LayerData;
  isSelected: boolean;
  zoomLevel: number;
  onResize: (id: string, newSize: Size, newPosition: Position) => void;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const HANDLE_SIZE = 10;

export const ResizableLayer: React.FC<ResizableLayerProps> = ({
  layer,
  isSelected,
  zoomLevel,
  onResize,
  children,
  onMouseDown,
  onClick,
  onDoubleClick,
  draggable,
  onDragStart,
  className,
  style,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startXPos: number;
    startYPos: number;
    handle: string;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation(); // Prevent drag start of the layer
    e.preventDefault(); // Prevent text selection

    setIsResizing(true);
    setResizeState({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: layer.size.width,
      startHeight: layer.size.height,
      startXPos: layer.position.x,
      startYPos: layer.position.y,
      handle,
    });
  };

  useEffect(() => {
    if (!isResizing || !resizeState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeState.startX) / zoomLevel;
      const deltaY = (e.clientY - resizeState.startY) / zoomLevel;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;
      let newX = resizeState.startXPos;
      let newY = resizeState.startYPos;

      const { handle } = resizeState;
      const lockAspectRatio = layer.lockAspectRatio !== false; // Default true
      const aspectRatio = resizeState.startWidth / resizeState.startHeight;

      // Calculate new dimensions based on handle
      if (handle.includes('e')) {
        newWidth += deltaX;
      } else if (handle.includes('w')) {
        newWidth -= deltaX;
        newX += deltaX;
      }

      if (handle.includes('s')) {
        newHeight += deltaY;
      } else if (handle.includes('n')) {
        newHeight -= deltaY;
        newY += deltaY;
      }

      // Apply aspect ratio lock
      if (lockAspectRatio) {
        if (handle.includes('w') || handle.includes('e')) {
           // Width is the primary driver for corner handles usually, 
           // but let's simplify: if dragging a corner, preserve ratio.
           // If dragging a side (n, s, e, w), we might ignore ratio or enforce it.
           // Usually side handles don't enforce ratio in some apps, but do in others.
           // Let's assume corner handles enforce ratio.
           
           if (handle.length === 2) { // Corner handles
             if (Math.abs(newWidth / resizeState.startWidth) > Math.abs(newHeight / resizeState.startHeight)) {
                // Width changed more
                newHeight = newWidth / aspectRatio;
                if (handle.includes('n')) {
                    newY = resizeState.startYPos + (resizeState.startHeight - newHeight);
                }
             } else {
                // Height changed more
                newWidth = newHeight * aspectRatio;
                if (handle.includes('w')) {
                    newX = resizeState.startXPos + (resizeState.startWidth - newWidth);
                }
             }
           }
        }
      }
      
      // Minimum size constraint
      if (newWidth < 10) newWidth = 10;
      if (newHeight < 10) newHeight = 10;

      onResize(layer.id, { width: newWidth, height: newHeight }, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeState, layer.id, layer.lockAspectRatio, onResize, zoomLevel]);

  const renderHandle = (cursor: string, position: string) => (
    <div
      className={`resize-handle ${position}`}
      style={{
        position: 'absolute',
        width: `${HANDLE_SIZE}px`,
        height: `${HANDLE_SIZE}px`,
        backgroundColor: '#fff',
        border: '1px solid #3b82f6',
        borderRadius: '50%',
        cursor: `${cursor}`,
        zIndex: 100,
        ...getHandleStyle(position),
      }}
      onMouseDown={(e) => handleMouseDown(e, position)}
      draggable={false}
    />
  );

  const getHandleStyle = (position: string): React.CSSProperties => {
    const offset = -HANDLE_SIZE / 2;
    switch (position) {
      case 'nw': return { top: offset, left: offset };
      case 'ne': return { top: offset, right: offset };
      case 'sw': return { bottom: offset, left: offset };
      case 'se': return { bottom: offset, right: offset };
      case 'n': return { top: offset, left: '50%', transform: 'translateX(-50%)' };
      case 's': return { bottom: offset, left: '50%', transform: 'translateX(-50%)' };
      case 'w': return { left: offset, top: '50%', transform: 'translateY(-50%)' };
      case 'e': return { right: offset, top: '50%', transform: 'translateY(-50%)' };
      default: return {};
    }
  };

  return (
    <div
      className={className}
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {children}
      {isSelected && (
        <>
          {renderHandle('nw-resize', 'nw')}
          {renderHandle('ne-resize', 'ne')}
          {renderHandle('sw-resize', 'sw')}
          {renderHandle('se-resize', 'se')}
          {/* Optional: Side handles if needed, maybe only when aspect ratio is unlocked? */}
          {!layer.lockAspectRatio && (
             <>
               {renderHandle('n-resize', 'n')}
               {renderHandle('s-resize', 's')}
               {renderHandle('w-resize', 'w')}
               {renderHandle('e-resize', 'e')}
             </>
          )}
        </>
      )}
    </div>
  );
};

