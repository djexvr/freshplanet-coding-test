import { User, Forum, Message } from "./types/interface";
import fixtures from "../data/fixtures.json";

export const users: User[] = fixtures.users;

export const forums: Forum[] = fixtures.forums;

export const messages: Message[] = fixtures.messages.map((message) => {
  return { ...message, sendAt: new Date(message.sendAt) };
});
