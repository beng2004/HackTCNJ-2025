export type BoardItem = {
    id: number;
    x: number;
    y: number;
    type: 'note' | 'flyer';
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