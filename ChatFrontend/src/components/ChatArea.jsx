// import React, { useState, useEffect, useRef } from "react";
// import "../styles/ChatArea.css";

// const ChatArea = ({ selectedGroup, currentUser }) => {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       type: "chat_message",
//       message: "Hello How are you?",
//       sender: "receiver",
//       group: 1,
//     },
//     {
//       type: "chat_message",
//       message: "Hello?",
//       sender: "receiver",
//       group: 1,
//     },
//     {
//       type: 'chat_message',
//       message: "I am Fine How do you do?",
//       sender: "sender",
//       group: 2
//     }
//   ]);
//   const [socket, setSocket] = useState(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // Scroll to the bottom of the chat
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messagesEndRef]); //Corrected dependency

//   useEffect(() => {
//     if (selectedGroup) {
//       // Create WebSocket connection
//       const ws = new WebSocket(
//         `ws://your-backend-url/ws/chat/${selectedGroup.id}/`
//       );

//       ws.onopen = () => {
//         console.log("WebSocket Connected");
//       };

//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         setMessages((prevMessages) => [...prevMessages, data]);
//       };

//       ws.onclose = () => {
//         console.log("WebSocket Disconnected");
//       };

//       setSocket(ws);

//       // Clean up the WebSocket connection when the component unmounts or the group changes
//       return () => {
//         ws.close();
//       };
//     }
//   }, [selectedGroup]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (message.trim() && socket) {
//       const messageData = {
//         type: "chat_message",
//         message: message,
//         sender: currentUser.id,
//         group: selectedGroup.id,
//       };
//       socket.send(JSON.stringify(messageData));
//       setMessage("");
//     }
//   };

//   return (
//     <div className="chat-area">
//       {selectedGroup ? (
//         <>
//           <h2>{selectedGroup.name}</h2>
//           <div className="chat-messages">
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`message ${
//                   msg.sender === currentUser.id ? "sender" : "receiver"
//                 }`}
//               >
//                 <div className="message-content">{msg.message}</div>
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

const ChatArea = ({ selectedGroup, currentUser }) => {
  const [message, setMessage] = useState("");
  
  // Store messages in an object segregated by group ID
  const [messagesByGroup, setMessagesByGroup] = useState({
    1: [
      { type: "chat_message", message: "Hello How are you?", sender: 2, timestamp: Date.now() },
      { type: "chat_message", message: "Hello?", sender: 2, timestamp: Date.now() }
    ],
    2: [
      { type: "chat_message", message: "I am Fine How do you do?", sender: 1, timestamp: Date.now() }
    ]
  });

  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByGroup, selectedGroup]);

  // WebSocket setup and cleanup
  useEffect(() => {
    if (selectedGroup) {
      const ws = new WebSocket(`ws://your-backend-url/ws/chat/${selectedGroup.id}/`);

      ws.onopen = () => console.log("WebSocket Connected");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        setMessagesByGroup((prevMessages) => ({
          ...prevMessages,
          [selectedGroup.id]: [...(prevMessages[selectedGroup.id] || []), data]
        }));
      };

      ws.onclose = () => console.log("WebSocket Disconnected");

      setSocket(ws);

      return () => ws.close();
    }
  }, [selectedGroup]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const messageData = {
        type: "chat_message",
        message,
        sender: currentUser.id,
        group: selectedGroup.id,
        timestamp: Date.now()
      };

      socket.send(JSON.stringify(messageData));

      // Update messages locally
      setMessagesByGroup((prevMessages) => ({
        ...prevMessages,
        [selectedGroup.id]: [...(prevMessages[selectedGroup.id] || []), messageData]
      }));

      setMessage("");
    }
  };

  return (
    <div className="chat-area">
      {selectedGroup ? (
        <>
          <h2>{selectedGroup.name}</h2>
          <div className="chat-messages">
            {(messagesByGroup[selectedGroup.id] || []).map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === currentUser.id ? "sender" : "receiver"}`}
              >
                <div className="message-content">{msg.message}</div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
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
