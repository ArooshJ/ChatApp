
const API_BASE_URL = "http://127.0.0.1";
export const SOCKET_BASE_URL = "ws://127.0.0.1";
// const API_BASE_URL = "http://10.10.112.121";
// export const SOCKET_BASE_URL = "ws://10.10.112.121";

export const API_ROUTES = {
  SIGNUP: `${API_BASE_URL}/chat/signup/`,
  LOGIN: `${API_BASE_URL}/api/token/`,

  USER_ROOM_LIST: (data) => `${API_BASE_URL}/chat/rooms/my_rooms/`, // get all rooms the user is part of  // get method
  AVAILABLE_ROOM_LIST: (data) => `${API_BASE_URL}/chat/rooms/available_rooms/`, // get available rooms // get
  ALL_ROOM_LIST: (data) => `${API_BASE_URL}/chat/rooms/`, // get all rooms in the db // get method
  MEMBER_LIST: (room_id) => `${API_BASE_URL}/chat/rooms/${room_id}/members/`, // get

  ALL_MESSAGES: (data) => `${API_BASE_URL}/chat/messages/`, // get all messages
  ROOM_MESSAGES: (room_id) => `${API_BASE_URL}/chat/history/${room_id}/`, // get room's messages

  JOIN_ROOM: (room_id) => `${API_BASE_URL}/chat/rooms/${room_id}/join/`, // post method
  LEAVE_ROOM: (room_id) => `${API_BASE_URL}/chat/rooms/${room_id}/leave/`, // post method
  CREATE_ROOM: (data) => `${API_BASE_URL}/chat/rooms/`, // post method
  // {
  //   "name":"Room 5",
  //   "members":[1,2,3,4,5]
  //   //,"is_dm": false // can send this field
  // }
  ALL_USERS: (data) => `${API_BASE_URL}/chat/users/` // get method for getting all users in the db
};
