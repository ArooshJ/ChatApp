import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import "../styles/HomePage.css";
import { room_list } from "../api/chat";

const HomePage = () => {
  const user_id = 1; // get from backend

  const [groups, setGroups] = useState([
    { id: 1, name: "Group 1" },
    { id: 2, name: "Group 2" },
    { id: 3, name: "Group 3" },
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser] = useState({ id: 1, name: "John Doe" }); // This should be set after authentication

  const fetchRoom_List = async () => {
    try {
      const result = await room_list({ user_id }); 
      console.log("room_list result = ", result);
      return result;
    } catch (err) {
      console.log("Error fetching room_list : ",err);
    }
  };

  useEffect(() => {
    //setGroups(fetchRoom_List());   
  }, []);

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
