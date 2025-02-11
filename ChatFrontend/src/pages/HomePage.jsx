import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import "../styles/HomePage.css";
import { userRoomList, allUsers } from "../api/chat";
import { getUserFromCookie } from "../utils/getFromCookie";
import { useAuthContext } from "../context/useAuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const HomePage = () => {
  const user = getUserFromCookie();
  const { isAuthenticated } = useAuthContext();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  // Function to fetch rooms
  const fetchRooms = async () => {
    try {
      const result = await userRoomList();
      console.log("room_list result = ", result);
      setGroups(result);
    } catch (err) {
      console.log("Error fetching room_list:", err);
    }
  };

  // Function to fetch all users
  const getAllUsers = async () => {
    try {
      const result = await allUsers();
      console.log("All user list = ", result);
      setUserList(result);
    } catch (err) {
      console.log("Error fetching user list:", err);
    }
  };

  // Fetch rooms and users on component mount
  useEffect(() => {
    fetchRooms();
    getAllUsers();
  }, [currentUser]);

  // Function to refresh rooms (to be called after creating a new room)
  const refreshRooms = async () => {
    await fetchRooms();
  };

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to the login page
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render the component
  if (!isAuthenticated) {
    return null; // Return null or a loading spinner while redirecting
  }

  return (
    <div className="home-page">
      <Sidebar
        groups={groups}
        onSelectGroup={setSelectedGroup}
        selectedGroup={selectedGroup}
        userList={userList}
        currentUser={currentUser}
        refreshRooms={refreshRooms} // Pass the refreshRooms function
      />
      <ChatArea
        selectedGroup={selectedGroup}
        currentUser={currentUser}
        refreshRooms={refreshRooms}
        groups={groups}
        setSelectedGroup={setSelectedGroup}
      />
    </div>
  );
};

export default HomePage;
