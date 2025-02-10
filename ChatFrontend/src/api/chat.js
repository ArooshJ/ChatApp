// import { API_ROUTES } from "../routes/apiRoute";
// import { getTokenFromCookie } from "../utils/get-token";

// // Get user room list API call
// export const user_room_list = async (data) => {
//   try {
//     const token = getTokenFromCookie();
//     if (!token) throw new Error("Token not found");

//     const response = await fetch(API_ROUTES.USER_ROOM_LIST, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     // Check if the response status is not OK
//     if (!response.ok) {
//       // Extract error information and throw an error
//       const errorData = await response.json();
//       console.log(errorData);
//       throw { response: { data: errorData } };
//     }

//     // Parse the JSON response
//     const res = await response.json();
//     console.log(res);

//     return res;
//   } catch (error) {
//     throw error;
//   }
// };

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
