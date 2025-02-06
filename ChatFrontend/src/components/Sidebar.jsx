import React from 'react';

const Sidebar = ({ groups, onSelectGroup, selectedGroup }) => {
  return (
    <div className="sidebar">
      <h3>Groups</h3>
      <ul>
        {groups.map((group) => (
          <li
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className={selectedGroup && selectedGroup.id === group.id ? 'selected' : ''}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;