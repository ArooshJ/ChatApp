import { API_ROUTES } from "../routes/llmRoute";
import { getTokenFromCookie } from "../utils/getFromCookie";

const fetchAPI = async (url, method = "GET", body = null) => {
  try {
    const token = getTokenFromCookie();
    if (!token) throw new Error("Token not found");

    const options = {
      method,
      headers: {
        //Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    //console.log('response = ',response);

    if (!response.ok) {
      const errorData = await response.json();
      throw { response: { data: errorData } };
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const generate = async (body, urlData) => 
  fetchAPI(API_ROUTES.GENERATE(urlData), "POST", body);

