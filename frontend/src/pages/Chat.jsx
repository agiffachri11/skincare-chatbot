import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <ChatBot />
    </div>
  );
};

export default Chat;