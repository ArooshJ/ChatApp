import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatArea.css";
import { getRoomMessages, getRoomMembers } from "../api/chat";
import { FaInfoCircle } from "react-icons/fa";
import { createRoom } from "../api/chat";
import { getGroupName } from "../utils/getGroupName";
import { generate } from "../api/llm";
import { SOCKET_BASE_URL } from "../routes/apiRoute";

const ChatArea = ({
  selectedGroup,
  currentUser,
  refreshRooms,
  groups,
  setSelectedGroup,
}) => {
  const [message, setMessage] = useState("");
  const [messagesByGroup, setMessagesByGroup] = useState({});
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByGroup, selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      const fetchMessages = async () => {
        try {
          const messages = await getRoomMessages(selectedGroup.id);
          setMessagesByGroup((prev) => ({
            ...prev,
            [selectedGroup.id]: messages,
          }));
        } catch (err) {
          console.log("Error fetching messages:", err);
        }
      };
      fetchMessages();
      console.log("messagesByGroup = ", messagesByGroup);
    }
  }, [selectedGroup, currentUser]);

  useEffect(() => {
    if (selectedGroup) {
      const wsUrl = `${SOCKET_BASE_URL}/ws/chat/${selectedGroup.id}/?user=${currentUser.username}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log("WebSocket Connected");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("from socket = ", data);
        const formattedData = {
          content: data.message,
          timestamp: Date.now(),
          room: selectedGroup.id,
          sender: data.sender_id,
          sender_name: data.sender,
        };
        setMessagesByGroup((prevMessages) => ({
          ...prevMessages,
          [selectedGroup.id]: [
            ...(prevMessages[selectedGroup.id] || []),
            formattedData,
          ],
        }));
      };

      ws.onclose = () => console.log("WebSocket Disconnected");

      setSocket(ws);

      return () => ws.close();
    }
  }, [selectedGroup, currentUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.send(JSON.stringify({ message }));
      setMessage("");
    }
  };

  const toggleMembersList = async () => {
    if (!showMembers) {
      try {
        const membersList = await getRoomMembers(selectedGroup.id);
        setMembers(membersList.members);
      } catch (error) {
        console.log("Error fetching members:", error);
      }
    }
    setShowMembers(!showMembers);
  };

  const handleMemberClick = async (member) => {
    if (member.id === currentUser.id){
      toggleMembersList();
      return;
    }
    // Check if a DM room already exists between the current user and the selected member
    const existingDMRoom = groups.find((group) => {
      if (
        group.is_dm &&
        group.members.includes(currentUser.id) &&
        group.members.includes(member.id)
      ) {
        return true;
      }
      return false;
    });
    if (existingDMRoom) {
      toggleMembersList();
      setSelectedGroup(existingDMRoom);
      return;
    }
    const dmRoomName = currentUser.username+" "+member.username;
    const body = {
      name: dmRoomName,
      members: [currentUser.id, member.id],
      is_dm: true,
    };

    try {
      const response = await createRoom(body);
      console.log("create DM Room response = ", response);

      // Refresh the rooms list after creating a new room
      await refreshRooms();

      toggleMembersList();
      setSelectedGroup(null);
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const handleInputChange = async (e) => {
    const inputText = e.target.value;
    setMessage(inputText); // Update the message state
  
    // Regular expression to detect @chatbot "any prompt"
    const chatbotRegex = /^@chatbot\s+"([^"]+)"/;
  
    // Check if the input matches the @chatbot format
    const match = inputText.match(chatbotRegex);
  
    if (match) {
      const prompt = match[1]; // Extract the prompt inside the quotes
      console.log("Detected @chatbot command with prompt:", prompt);
      try{  
        const response = await generate({ prompt });
        console.log("LLM response = ", response);
        setMessage(response.response);
      }
      catch(err){
        console.log(err);
      }
    }
  };

  return (
    <div className="chat-area">
      {selectedGroup ? (
        <>
          <div className="chat-header">
            <div className="group-info">
              <img src="https://cdn3.iconfinder.com/data/icons/communication-social-media-1/24/account_profile_user_contact_person_avatar_placeholder-1024.png" alt="Group Profile" />
              <h2>{getGroupName(selectedGroup, currentUser)}</h2>
            </div>
            <FaInfoCircle className="info-icon" onClick={toggleMembersList} />
          </div>

          {showMembers && (
            <div className="members-dropdown">
              <ul>
                {members.map((member) => (
                  <li key={member.id} onClick={() => handleMemberClick(member)}>
                    {member.username}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="chat-messages">
            {(messagesByGroup[selectedGroup.id] || []).map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === currentUser.id ? "sender" : "receiver"
                }`}
              >
                <div
                  className={`message-name ${
                    msg.sender === currentUser.id ? "sender" : "receiver"
                  }`}
                  //className="message-name"
                >
                  {msg.sender_name}
                </div>
                <div>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className={/^@chatbot\s*/.test(message) ? "chatbot-detected" : ""}
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <p className="no-chat-selected">Select a group to start chatting</p>
      )}
    </div>
  );
};

export default ChatArea;
