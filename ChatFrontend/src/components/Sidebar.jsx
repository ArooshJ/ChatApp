import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ groups = [], onSelectGroup, selectedGroup }) => {
  return (
    <div className="sidebar">
      <h3>Groups</h3>
      <ul>
        {Array.isArray(groups) ? (
          groups.map((group) => (
            <li
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={selectedGroup && selectedGroup.id === group.id ? 'selected' : ''}
            >
              {group.name}
            </li>
          ))
        ) : (
          <p>No groups available</p>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
