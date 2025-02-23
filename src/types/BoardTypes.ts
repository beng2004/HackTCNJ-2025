export type BoardItem = {
    author: string;
    parentBoardId: number;
    id: number;
    x: number;
    y: number;
    type: 'note' | 'flyer';
    rotation: number;
    date: string;
  };
  
  export type Note = BoardItem & {
    type: 'note';
    text: string;
  };
  
  export type Flyer = BoardItem & {
    type: 'flyer';
    imageUrl: string;
    caption: string;
  };