import { useState, useRef, useEffect } from "react";
import {  ZoomIn, ZoomOut, X } from "lucide-react";
import ExpandablePlusButton from "./PlusButton";
import { BoardItem, Note, Flyer } from "../types/BoardTypes";
import axios from 'axios';
import stickyNoteImage from '../assets/sticky.png';


const Board = () => {
    const [boardId, setBoardId] = useState<number>();
    // const [isPolling, setIsPolling] = useState(false)
    const changeBoard = (newBoardId: number) => {
      setBoardId(newBoardId);
    };
    //states for api getting current posts
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [itemDragging, setItemDragging] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [items, setItems] = useState<BoardItem[]>([]);
    const handleDeleteItem = async (itemId: number, type: string) => {
      try {
          await axios.delete('https://hack.tcnj.ngrok.app/delete-post', {
              headers: {
                  'Content-Type': 'application/json',
                  'boardId': boardId,
                  'postId': itemId,
                  'type': type
              }
          });
          
          // Remove item from local state
          setItems(prev => prev.filter(item => item.id !== itemId));
          setSelectedItem(null);
      } catch (error) {
          console.error('Error deleting item:', error);
      }
  };

    // Make the API call on page load and refresh
    useEffect(() => {
      changeBoard(0)
      
      const fetchData = async () => {
          setLoading(true);
          try {
              const response = await axios.get('https://hack.tcnj.ngrok.app/posts', {
                headers: {
                  'Content-Type': 'application/json',
                  'boardId': boardId, // Custom header for board ID #TODO check for boardid on backend  
                },
              });
              console.log('API Response:', response.data);
  
              const mappedItems: BoardItem[] = response.data.map((item: any) => {
                  if (item.type === 'note') {
                      return {
                          author: item.author,
                          parentBoardId: item.parentBoardId,
                          id: item.postId,
                          x: item.x, // Default or randomly generated
                          y: item.y, // Default or randomly generated
                          rotation: item.rotation, // Default rotation
                          date: item.date,
                          type: 'note',
                          text: item.content || item.text || '', // Some objects use 'content', some 'text'
                      } as Note;
                  } else if (item.type === 'flyer') {
                      return {
                          author: item.author,
                          parentBoardId: item.parentBoardId,
                          id: item.postId,
                          x: item.x, // Default value
                          y: item.y, // Default value
                          rotation: item.rotation, // Default rotation
                          date: item.date,
                          type: 'flyer',
                          imageUrl: 'https://hack.tcnj.ngrok.app/uploads/' + item.imageUrl,
                          caption: item.caption || '',
                      } as Flyer;
                  }
                  return null; // Ignore unrecognized types
              }).filter(Boolean); // Remove null values
  
              setItems(mappedItems);
          } catch (error) {
              console.error('Error fetching posts:', error);
              setError(error as Error);
          } finally {
              setLoading(false);
          }
      };
  
      fetchData();
      const intervalId = setInterval(fetchData, 2000);

      return () => clearInterval(intervalId);

  }, []);
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
  const updateItemPosition = async (item: BoardItem) => {
    try {
      await axios.post('https://hack.tcnj.ngrok.app/update-position', {
        postId: item.id,
        type: item.type,
        x: item.x,
        y: item.y,
        rotation: item.rotation || 0,
        parentBoardId: boardId
      });
    } catch (error) {
      console.error('Error updating item position:', error);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectedItem) return;
      
      if (itemDragging) {
        const currentPosition = getRelativeMousePosition(e);
        const dx = (currentPosition.x - startPositionRef.current.x) / zoom;
        const dy = (currentPosition.y - startPositionRef.current.y) / zoom;
        
        setItems(prev => 
          prev.map(item => {
            if (item.id === selectedItem) {
              const newX = item.x + dx;
              const newY = item.y + dy;
              return { ...item, x: newX, y: newY };
            }
            return item;
          })
        );
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

    const handleGlobalMouseUp = async () => {
      setItemDragging(false);
      setRotating(false);
      if (selectedItem) {
        const updatedItem = items.find(item => item.id === selectedItem);
        if (updatedItem) {
          await updateItemPosition(updatedItem);
        }
      }
    };

    if (itemDragging || rotating) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [itemDragging, rotating, selectedItem, items, zoom, boardId]);

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

  const addItem = async (type: 'note' | 'flyer', data: Partial<Note | Flyer>) => {
    const now = new Date().toISOString();
    const newId = Math.max(0, ...items.map(item => item.id)) + 1;
    const xPos = -offset.x / zoom + 200;
    const yPos = -offset.y / zoom + 150;
    const rotation = (Math.random() - 0.9) * 10 * (Math.random() < 0.5 ? -1 : 1);

    // Prepare the post data
    const postData = {
        author: "Ben",
        date: now,
        parentBoardId: boardId, //TODO use on backend to make sure updating correct board
        postId: newId,
        rotation: rotation,
        text: data.text,
        caption: data.caption,
        type: type === 'note' ? 'note' : 'flyer',
        x: xPos,
        y: yPos,
    };

    try {
        // First, create the post
        if (type === 'flyer') {
          postData.imageUrl = 'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg'; 
        }
        const postResponse = await axios.post('https://hack.tcnj.ngrok.app/posts', postData);
        console.log('Post created successfully:', postResponse.data);

        // If it's a flyer, handle the image upload separately
        if (type === 'flyer' && data.imageUrl) {
            // Convert base64 image to File object
            const base64Response = await fetch(data.imageUrl);
            const blob = await base64Response.blob();
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

            // Create FormData for image upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload the image
            const imageResponse = await axios.post('https://hack.tcnj.ngrok.app/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'boardId': boardId,
                    'postId': newId
                },
            });
            console.log('Image uploaded successfully:', imageResponse.data);
        }
    } catch (error) {
        console.error('Error creating post or uploading image:', error);
    }

    // Create the new item for the local state
    const newItem = {
        id: newId,
        x: xPos,
        y: yPos,
        type,
        rotation: rotation,
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
      
      {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-red-600 text-center p-4">
                  <p className="font-bold mb-2">Error loading board</p>
                  <p>{error.message}</p>
              </div>
          </div>
      ) : (
          <>
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
                                className={`absolute cursor-move group
                                    ${item.type === 'note' 
                                        ? 'w-[200px] h-[200px] relative'
                                        : 'bg-white rounded-lg shadow-lg'
                                    }
                                    ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}
                                `}
                                style={{
                                    left: item.x,
                                    top: item.y,
                                    transform: `rotate(${item.rotation || 0}deg)`,
                                    transformOrigin: "center",
                                    width: item.type === 'flyer' ? '300px' : '200px',
                                    touchAction: 'none',
                                    userSelect: 'none',
                                    position: 'absolute',
                                }}
                                onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative">
                                    {/* Delete button container */}
                                    <div className="absolute -top-2 -right-2 z-50" style={{ transform: `rotate(${-(item.rotation || 0)}deg)` }}>
                                        {selectedItem === item.id && (
                                            <button
                                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteItem(item.id, item.type);
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Rotation handle */}
                                    <div 
                                        className="rotation-handle absolute -top-10 left-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ 
                                            transform: 'translateX(-50%)', 
                                            zIndex: 50,
                                            pointerEvents: 'auto'
                                        }}
                                    />
                                    
                                    {item.type === 'note' ? (
                                        <div className="w-full h-full">
                                            {/* Sticky note background */}
                                            <img 
                                                src={stickyNoteImage} 
                                                alt="Sticky note"
                                                className=" inset-0 w-full h-full object-cover pointer-events-none z-0  min-h-[200px]"
                                                draggable="false"
                                            />

                                            {/* Text content */}
                                            <div className="absolute inset-0 p-2 flex items-center justify-center h-full">
                                                <div className="select-none text-center break-words overflow-hidden text-[20px] leading-[1.2] break-words">
                                                    {item.text}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col select-none overflow-hidden rounded-lg">
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
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Board;