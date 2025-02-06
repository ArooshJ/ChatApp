import { API_ROUTES } from "../routes/apiRoute";

// Get Group chat list API call
export const room_list = async (data) => {
  try {
    // Send the POST request using fetch
    const response = await fetch(API_ROUTES.ROOM_LIST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content type as JSON
      },
      body: JSON.stringify(data), // Convert JavaScript object to JSON string
    });

    // Check if the response status is not OK
    if (!response.ok) {
      // Extract error information and throw an error
      const errorData = await response.json();
      console.log(errorData);
      throw { response: { data: errorData } };
    }

    // Parse the JSON response
    const res = await response.json();
    console.log(res);

    return res;
  } catch (error) {
    throw error;
  }
};