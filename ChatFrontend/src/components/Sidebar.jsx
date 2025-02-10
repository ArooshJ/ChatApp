import React, { useState } from "react";
import "../styles/Sidebar.css";

const Sidebar = ({ groups = [], onSelectGroup, selectedGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);
  const [groupName, setGroupName] = useState("");

  // Hardcoded list of names
  const names = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  const plusIconHandler = () => {
    setIsModalOpen(true);
  }

  // Toggle selection of names
  const toggleNameSelection = (name) => {
    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter((n) => n !== name));
    } else {
      setSelectedNames([...selectedNames, name]);
    }
  };

  // Handle create new room
  const handleCreateRoom = () => {
    if (groupName.trim() === "" || selectedNames.length === 0) {
      alert("Please provide a group name and select at least one member.");
      return;
    }
    console.log("Creating new room with name:", groupName, "and selected names:", selectedNames);
    setIsModalOpen(false); // Close the modal
    setSelectedNames([]); // Reset selected names
    setGroupName(""); // Reset group name
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedNames([]); // Reset selected names
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
              {group.name}
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
              {names.map((name) => (
                <li
                  key={name}
                  onClick={() => toggleNameSelection(name)}
                  className={selectedNames.includes(name) ? "selected" : ""}
                >
                  {name}
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button onClick={handleCancel}>Cancel</button>
              <button
                onClick={handleCreateRoom}
                disabled={groupName.trim() === "" || selectedNames.length === 0}
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