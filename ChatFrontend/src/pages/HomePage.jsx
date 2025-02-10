import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import "../styles/HomePage.css";
import { userRoomList } from "../api/chat";
import { getUserFromCookie } from "../utils/getFromCookie";

const HomePage = () => {
  const user = getUserFromCookie();
  //console.log("user = ",user);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(user); // This should be set after authentication

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const result = await userRoomList();
        console.log("room_list result = ", result);
        setGroups(result); 
      } catch (err) {
        console.log("Error fetching room_list:", err);
      }
    };

    fetchRooms();
  }, [currentUser]); 

  return (
    <div className="home-page">
      <Sidebar
        groups={groups}
        onSelectGroup={setSelectedGroup}
        selectedGroup={selectedGroup}
      />
      <ChatArea selectedGroup={selectedGroup} currentUser={currentUser} />
    </div>
  );
};

export default HomePage;

