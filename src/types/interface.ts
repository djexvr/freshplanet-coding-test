export interface User {
  id: string;
  name: string;
  picture: string;
}

export interface Forum {
  id: string;
  members: string[];
}

export interface Message {
  id: string;
  text: string;
  sendAt: Date;
  author: string;
  forum: string;
}
