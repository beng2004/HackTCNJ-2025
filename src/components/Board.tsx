import { useState, useRef, useEffect } from "react";

const Board = () => {
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState([
    { id: 1, x: 100, y: 100, text: "Note 1" },
    { id: 2, x: 300, y: 200, text: "Note 2" },
  ]);

  const boardRef = useRef<HTMLDivElement>(null);

  // Helper function to get relative mouse position
  const getRelativeMousePosition = (e: React.WheelEvent | MouseEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Scroll-based zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const mousePos = getRelativeMousePosition(e);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 10); // Allow zoom from 0.1x to 10x
    
    // Calculate new offset to keep mouse position fixed
    const mouseXBeforeZoom = (mousePos.x - offset.x) / zoom;
    const mouseYBeforeZoom = (mousePos.y - offset.y) / zoom;
    const mouseXAfterZoom = (mousePos.x - offset.x) / newZoom;
    const mouseYAfterZoom = (mousePos.y - offset.y) / newZoom;
    
    setOffset(prev => ({
      x: prev.x + (mouseXAfterZoom - mouseXBeforeZoom) * newZoom,
      y: prev.y + (mouseYAfterZoom - mouseYBeforeZoom) * newZoom
    }));
    
    setZoom(newZoom);
  };

  // Global mouse event handlers
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

  // Board-specific mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  // Handle button zooming
  const handleZoomButton = (zoomIn: boolean) => {
    if (!boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const zoomFactor = zoomIn ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 10);
    
    // Calculate new offset to keep center position fixed
    const centerXBeforeZoom = (centerX - offset.x) / zoom;
    const centerYBeforeZoom = (centerY - offset.y) / zoom;
    const centerXAfterZoom = (centerX - offset.x) / newZoom;
    const centerYAfterZoom = (centerY - offset.y) / newZoom;
    
    setOffset(prev => ({
      x: prev.x + (centerXAfterZoom - centerXBeforeZoom) * newZoom,
      y: prev.y + (centerYAfterZoom - centerYBeforeZoom) * newZoom
    }));
    
    setZoom(newZoom);
  };

  // Add new sticky note
  const handleAddItem = () => {
    setItems([...items, { 
      id: items.length + 1, 
      x: -offset.x + 200, 
      y: -offset.y + 150, 
      text: `Note ${items.length + 1}` 
    }]);
  };

  return (
    <div 
      className="relative select-none w-full h-full overflow-hidden"
      ref={boardRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button 
          onClick={() => handleZoomButton(true)} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Zoom In
        </button>
        <button 
          onClick={() => handleZoomButton(false)} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Zoom Out
        </button>
        <button 
          onClick={handleAddItem} 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Item
        </button>
        <span className="bg-gray-200 px-4 py-2 rounded">
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
      </div>

      {/* Infinite Board */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        {/* Board Content */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute bg-yellow-300 p-2 rounded shadow-lg cursor-default"
            style={{
              left: item.x,
              top: item.y,
              transform: `scale(${1})`,
              transformOrigin: "center",
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;