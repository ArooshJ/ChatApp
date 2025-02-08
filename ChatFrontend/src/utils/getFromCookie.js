export const getTokenFromCookie = () => {
  // This function assumes you are using a cookie library or native JS for cookies
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="));
  if (token) {
    return token.split("=")[1]; // Extract the token from the cookie string
  }
  return null; // Return null if no token found
};

export const getUserFromCookie = () => {
  // This function extracts the "user" field from the cookies
  const userCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user="));

  if (userCookie) {
    try {
      return JSON.parse(decodeURIComponent(userCookie.split("=")[1])); // Parse JSON
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return null;
    }
  }
  return null; // Return null if no user data found
};
