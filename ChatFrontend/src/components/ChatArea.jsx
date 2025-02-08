// import React, { useState, useEffect, useRef } from "react";
// import "../styles/ChatArea.css";
// import { getRoomMessages } from "../api/chat";

// const ChatArea = ({ selectedGroup, currentUser }) => {
//   const [message, setMessage] = useState("");
//   const [messagesByGroup, setMessagesByGroup] = useState({});
//   const [socket, setSocket] = useState(null);
//   const messagesEndRef = useRef(null);

//   // Scroll to the latest message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messagesByGroup, selectedGroup]);

//   // Fetch messages for the selected group (only on first load)
//   useEffect(() => {
//     if (selectedGroup ) {

//       const fetchMessages = async () => {
//         try {
//           const messages = await getRoomMessages(selectedGroup.id);
//           console.log("fetched messages = ",messages);
//           setMessagesByGroup((prev) => ({
//             ...prev,
//             [selectedGroup.id]: messages,
//           }));
//         } catch (err) {
//           console.log("Error fetching messages:", err);
//         }
//       };

//       fetchMessages();
//       console.log("messagesByGroup = ", messagesByGroup);
//     }
//   }, [selectedGroup]);

//   // WebSocket setup and cleanup
//   useEffect(() => {
//     if (selectedGroup) {
//       console.log("selected group = ",selectedGroup);

//       const wsUrl = selectedGroup.is_dm
//         ? `ws://127.0.0.1:8000/ws/chat/?receiver=${selectedGroup.receiver}&user=${currentUser.username}`
//         : `ws://127.0.0.1:8000/ws/chat/${selectedGroup.id}/?user=${currentUser.username}`;

//       const ws = new WebSocket(wsUrl);

//       ws.onopen = () => console.log("WebSocket Connected");

//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log("socket message = ",data); // message data from the socket
//         const formattedData = {
//           content : data.message,
//           timestamp : Date.now(),
//           room : selectedGroup.id,
//           sender : currentUser.id
//         }
//         console.log("formattedData = ",formattedData);
//         setMessagesByGroup((prevMessages) => ({
//           ...prevMessages,
//           [selectedGroup.id]: [...(prevMessages[selectedGroup.id] || []), formattedData],
//         }));
//       };

//       ws.onclose = () => console.log("WebSocket Disconnected");

//       setSocket(ws);

//       return () => ws.close();
//     }
//   }, [selectedGroup, currentUser]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (message.trim() && socket) {

//       socket.send(JSON.stringify({message}));
//       setMessage("");
//     }
//   };

//   return (
//     <div className="chat-area">
//       {selectedGroup ? (
//         <>
//           <h2>{selectedGroup.name}</h2>
//           <div className="chat-messages">
//             {(messagesByGroup[selectedGroup.id] || []).map((msg, index) => (
//               <div
//                 key={index}
//                 className={`message ${msg.sender === currentUser.id ? "sender" : "receiver"}`}
//               >
//                 <div className="message-content">{msg.content}</div>
//                 <div className="message-timestamp">
//                   {new Date(msg.timestamp).toLocaleTimeString()}
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//           <form onSubmit={handleSendMessage} className="message-form">
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message..."
//             />
//             <button type="submit">Send</button>
//           </form>
//         </>
//       ) : (
//         <p className="no-chat-selected">Select a group to start chatting</p>
//       )}
//     </div>
//   );
// };

// export default ChatArea;

import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatArea.css";
import { getRoomMessages, getRoomMembers } from "../api/chat";
import { FaInfoCircle } from "react-icons/fa";

const ChatArea = ({ selectedGroup, currentUser }) => {
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
      const wsUrl = selectedGroup.is_dm
        ? `ws://127.0.0.1:8000/ws/chat/?receiver=${selectedGroup.receiver}&user=${currentUser.username}`
        : `ws://127.0.0.1:8000/ws/chat/${selectedGroup.id}/?user=${currentUser.username}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log("WebSocket Connected");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const formattedData = {
          content: data.message,
          timestamp: Date.now(),
          room: selectedGroup.id,
          sender: currentUser.id, // this is stupid change it later to data.senderID
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

  return (
    <div className="chat-area">
      {selectedGroup ? (
        <>
          <div className="chat-header">
            <div className="group-info">
              <img src="https://via.placeholder.com/40" alt="Group Profile" />
              <h2>{selectedGroup.name}</h2>
            </div>
            <FaInfoCircle className="info-icon" onClick={toggleMembersList} />
          </div>

          {showMembers && (
            <div className="members-dropdown">
              <ul>
                {members.map((member) => (
                  <li key={member.id}>{member.username}</li>
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
                  {"Aryan"}
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
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
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
