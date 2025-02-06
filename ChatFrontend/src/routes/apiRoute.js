import { use } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

export const API_ROUTES = {
  // User-related routes
  // USERS: `${API_BASE_URL}/users/account/`, // Users listing, CRUD
  // REGISTER: `${API_BASE_URL}/users/auth/register/`, // Register user
  // LOGIN: `${API_BASE_URL}/users/auth/login/token`, // User login (JWT)
  // REFRESH: `${API_BASE_URL}/users/auth/token/refresh`, // Token refresh
  // LOGOUT: `${API_BASE_URL}/users/auth/signout/`, // User logout

  // CHAT_BOT: `${API_BASE_URL}/chatbot/query/`,
  // CHAT_LIST: `${API_BASE_URL}/multimedia/chats/`, // List all chats for the user
  // CHAT_CREATE: `${API_BASE_URL}/multimedia/chats/create/`, // Create a new chat
  // MESSAGE_LIST: (chatId) =>
  //   `${API_BASE_URL}/multimedia/chats/${chatId}/messages/`, // List messages for a specific chat
  // MESSAGE_CREATE: (chatId) =>
  //   `${API_BASE_URL}/multimedia/chats/${chatId}/messages/create/`, // Send a message in a chat
  // CHAT_CLEAR: (chatId) => `${API_BASE_URL}/multimedia/chats/${chatId}/clear/`, // Clear all messages in a chat
  SIGNUP: `${API_BASE_URL}/chat/signup/`,
  LOGIN: `${API_BASE_URL}/api/token/`,

  ROOM_LIST: (user_id) => `${API_BASE_URL}/ws/chat/${user_id}`,
};
