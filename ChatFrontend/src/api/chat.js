import { API_ROUTES } from "../routes/apiRoute";
import { getTokenFromCookie } from "../utils/getFromCookie";

// ✅ Utility function to handle fetch requests
const fetchAPI = async (url, method = "GET", body = null) => {
  try {
    const token = getTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw { response: { data: errorData } };
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ✅ Get rooms the user is part of
export const userRoomList = async (urlData) =>
  fetchAPI(API_ROUTES.USER_ROOM_LIST(urlData));

// ✅ Get available rooms
export const getAvailableRooms = async (urlData) =>
  fetchAPI(API_ROUTES.AVAILABLE_ROOM_LIST(urlData));

// ✅ Get all rooms in the database
export const getAllRooms = async (urlData) =>
  fetchAPI(API_ROUTES.ALL_ROOM_LIST(urlData));

// ✅ Get members of a specific room
export const getRoomMembers = async (room_id) =>
  fetchAPI(API_ROUTES.MEMBER_LIST(room_id));

// ✅ Get all messages in the database
export const getAllMessages = async (urlData) => fetchAPI(API_ROUTES.ALL_MESSAGES(urlData));

// ✅ Get messages of a specific room
export const getRoomMessages = async (room_id) =>
  fetchAPI(API_ROUTES.ROOM_MESSAGES(room_id));

// ✅ Join a room
export const joinRoom = async (room_id) =>
  fetchAPI(API_ROUTES.JOIN_ROOM(room_id), "POST");

// ✅ Leave a room
export const leaveRoom = async (room_id) =>
  fetchAPI(API_ROUTES.LEAVE_ROOM(room_id), "POST");

// ✅ Create a new room
export const createRoom = async (roomData, urlData) =>
  fetchAPI(API_ROUTES.CREATE_ROOM(urlData), "POST", roomData);

// ✅ Create a new room
export const allUsers = async (urlData) =>
  fetchAPI(API_ROUTES.ALL_USERS(urlData));
