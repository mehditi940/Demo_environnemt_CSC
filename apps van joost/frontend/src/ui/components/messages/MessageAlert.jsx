import React from 'react';
import '../../styles/components/messages/MessageAlert.css'
const MessageAlert = ({ message,  onClose }) => {
//   const getColor = () => {
//     switch (type) {
//       case 'success':
//         return 'bg-green-100 text-green-800 border-green-300';
//       case 'error':
//         return 'bg-red-100 text-red-800 border-red-300';
//       case 'warning':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//       default:
//         return 'bg-blue-100 text-blue-800 border-blue-300';
//     }
//   };

  if (!message) return null; // geen bericht? Niks renderen

  return (
    <div className='message-alert-container'>	

      <span>{message}</span>
      {onClose && (
        <button onClick={onClose}>
        </button>
      )}
      
    </div>
  );
};

export default MessageAlert;
