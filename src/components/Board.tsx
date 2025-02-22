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

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  // Scroll-based zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.deltaY < 0 ? handleZoomIn() : handleZoomOut();
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
    // Only start dragging on primary (left) mouse button
    if (e.button !== 0) return;
    
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
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
          onClick={handleZoomIn} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Zoom In
        </button>
        <button 
          onClick={handleZoomOut} 
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
              transform: `scale(${1 / zoom})`,
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