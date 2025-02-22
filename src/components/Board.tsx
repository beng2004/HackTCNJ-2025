import { useState, useRef, useEffect } from "react";
import { Plus, ZoomIn, ZoomOut } from "lucide-react";
import ExpandablePlusButton from "./PlusButton";
import { BoardItem, Note, Flyer } from "../types/BoardTypes";

const Board = () => {
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [itemDragging, setItemDragging] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [items, setItems] = useState<BoardItem[]>([
      { id: 1, x: 100, y: 100, type: 'note', text: "Note 1", rotation: 0 },
      { id: 2, x: 300, y: 200, type: 'note', text: "Note 2", rotation: 0 },
    ]);

  const boardRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const startPositionRef = useRef({ x: 0, y: 0 });
  const startRotationRef = useRef(0);

  const getRelativeMousePosition = (e: React.WheelEvent | MouseEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top)
    };
  };

  const calculateAngleToMouse = (e: MouseEvent | React.MouseEvent, itemId: number) => {
    const itemElement = itemRefs.current.get(itemId);
    if (!itemElement) return 0;

    const rect = itemElement.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const itemCenterY = rect.top + rect.height / 2;

    return Math.atan2(
      e.clientY - itemCenterY,
      e.clientX - itemCenterX
    ) * (180 / Math.PI);
  };

  const handleItemMouseDown = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItem(itemId);
    
    if ((e.target as HTMLElement).classList.contains('rotation-handle')) {
      setRotating(true);
      startRotationRef.current = calculateAngleToMouse(e, itemId);
    } else {
      setItemDragging(true);
      startPositionRef.current = getRelativeMousePosition(e);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectedItem) return;
      
      if (itemDragging) {
        const currentPosition = getRelativeMousePosition(e);
        const dx = (currentPosition.x - startPositionRef.current.x) / zoom;
        const dy = (currentPosition.y - startPositionRef.current.y) / zoom;

        setItems(prev => prev.map(item => 
          item.id === selectedItem
            ? { ...item, x: item.x + dx, y: item.y + dy }
            : item
        ));
        startPositionRef.current = currentPosition;
      }
      
      if (rotating) {
        const currentAngle = calculateAngleToMouse(e, selectedItem);
        const deltaRotation = currentAngle - startRotationRef.current;
        
        setItems(prev => prev.map(item =>
          item.id === selectedItem
            ? { ...item, rotation: ((item.rotation || 0) + deltaRotation) % 360 }
            : item
        ));
        
        startRotationRef.current = currentAngle;
      }
    };

    const handleGlobalMouseUp = () => {
      setItemDragging(false);
      setRotating(false);
    };

    if (itemDragging || rotating) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [itemDragging, rotating, selectedItem, items, zoom]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const mousePos = getRelativeMousePosition(e);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 10);
    
    // Calculate the position in the unzoomed space
    const mouseXInBoard = (mousePos.x - offset.x) / zoom;
    const mouseYInBoard = (mousePos.y - offset.y) / zoom;
    
    // Calculate new offset to maintain mouse position
    const newOffset = {
      x: mousePos.x - mouseXInBoard * newZoom,
      y: mousePos.y - mouseYInBoard * newZoom
    };
    
    setOffset(newOffset);
    setZoom(newZoom);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleGlobalMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleZoomButton = (zoomIn: boolean) => {
    if (!boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const zoomFactor = zoomIn ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 10);
    
    const centerXInBoard = (centerX - offset.x) / zoom;
    const centerYInBoard = (centerY - offset.y) / zoom;
    
    const newOffset = {
      x: centerX - centerXInBoard * newZoom,
      y: centerY - centerYInBoard * newZoom
    };
    
    setOffset(newOffset);
    setZoom(newZoom);
  };

  const addItem = (type: 'note' | 'flyer', data: Partial<Note | Flyer>) => {
    const newItem = {
      id: Math.max(0, ...items.map(item => item.id)) + 1,
      x: -offset.x / zoom + 200,
      y: -offset.y / zoom + 150,
      type,
      rotation: (Math.random() - 0.9) * 10 * (Math.random() < 0.5 ? -1 : 1),
      ...data
    };
    setItems([...items, newItem]);
  };

  return (
    <div 
      className="relative select-none w-full h-full overflow-hidden"
      ref={boardRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onClick={() => setSelectedItem(null)}
    >
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button 
          onClick={() => handleZoomButton(true)} 
          className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-600"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={() => handleZoomButton(false)} 
          className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-600"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ExpandablePlusButton onAddItem={addItem} />
      </div>

      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            className={`absolute shadow-lg cursor-move group
              ${item.type === 'note' 
                ? 'bg-[#F9FFB5] p-2 rounded'
                : 'bg-white rounded-lg overflow-hidden'
              }
              ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}
            `}
            style={{
              left: item.x,
              top: item.y,
              transform: `rotate(${item.rotation || 0}deg)`,
              transformOrigin: "center",
              width: item.type === 'flyer' ? '300px' : 'auto',
              touchAction: 'none',
              userSelect: 'none',
              position: 'absolute',
            }}
            onMouseDown={(e) => handleItemMouseDown(e, item.id)}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="rotation-handle absolute -top-6 left-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ 
                transform: 'translateX(-50%)', 
                zIndex: 50,
                pointerEvents: 'auto'
              }}
            />
            
            {item.type === 'note' ? (
              <div className="select-none">{item.text}</div>
            ) : (
              <div className="flex flex-col select-none">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption}
                  className="w-full h-48 object-cover pointer-events-none"
                  draggable="false"
                />
                {item.caption && (
                  <p className="p-3 text-sm text-gray-700">
                    {item.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;