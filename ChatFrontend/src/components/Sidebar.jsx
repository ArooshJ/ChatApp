import React, { useState } from "react";
import "../styles/Sidebar.css";
import { createRoom } from "../api/chat";
import {getGroupName} from "../utils/getGroupName";

const Sidebar = ({
  groups = [],
  onSelectGroup,
  selectedGroup,
  userList,
  currentUser,
  refreshRooms, // Receive the refreshRooms function as a prop
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIDs, setSelectedUserIDs] = useState([currentUser.id]);
  const [groupName, setGroupName] = useState("");

  const plusIconHandler = () => {
    setIsModalOpen(true);
  };

  // Toggle selection of names
  const toggleNameSelection = (id) => {
    if (selectedUserIDs.includes(id)) {
      setSelectedUserIDs(selectedUserIDs.filter((n) => n !== id));
    } else {
      setSelectedUserIDs([...selectedUserIDs, id]);
    }
  };

  // Handle create new room
  const handleCreateRoom = async () => {
    if (groupName.trim() === "" || selectedUserIDs.length === 1) {
      alert("Please provide a group name and select at least one member.");
      return;
    }

    const body = {
      name: groupName,
      members: selectedUserIDs,
    };

    try {
      const response = await createRoom(body);
      console.log("createRoom response = ", response);

      // Refresh the rooms list after creating a new room
      await refreshRooms();
    } catch (err) {
      console.log(err);
    }

    setIsModalOpen(false); // Close the modal
    setSelectedUserIDs([currentUser.id]); // Reset selected names
    setGroupName(""); // Reset group name
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedUserIDs([currentUser.id]); // Reset selected names
    setGroupName(""); // Reset group name
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header-component">
        <h3>Groups</h3>
        <div className="create-group-button" onClick={plusIconHandler}>
          <span className="plus-icon">+</span>
        </div>
      </div>

      <ul>
        {Array.isArray(groups) ? (
          groups.map((group) => (
            <li
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={
                selectedGroup && selectedGroup.id === group.id ? "selected" : ""
              }
            >
              {getGroupName(group, currentUser)}
            </li>
          ))
        ) : (
          <p>No groups available</p>
        )}
      </ul>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="group-name-input"
            />
            <h4>Select Members</h4>
            <ul className="modal-name-list">
              {userList.map((user) =>
                user.id === currentUser.id ? (
                  <></>
                ) : (
                  <li
                    key={user.id}
                    onClick={() => toggleNameSelection(user.id)}
                    className={
                      selectedUserIDs.includes(user.id) ? "selected" : ""
                    }
                  >
                    {user.username}
                  </li>
                )
              )}
            </ul>
            <div className="modal-actions">
              <button onClick={handleCancel}>Cancel</button>
              <button
                onClick={handleCreateRoom}
                disabled={
                  groupName.trim() === "" || selectedUserIDs.length === 1
                }
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
