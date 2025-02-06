import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import '../styles/HomePage.css';

const HomePage = () => {
  const [groups, setGroups] = useState([
    { id: '1', name: 'Group 1' },
    { id: '2', name: 'Group 2' },
    { id: '3', name: 'Group 3' },
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser] = useState({ id: '1', name: 'John Doe' }); // This should be set after authentication

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