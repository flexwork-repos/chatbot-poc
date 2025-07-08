import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChatProvider } from './contexts/ChatContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/index.css';
import ChatBotWindow from './components/ChatBotWindow/ChatBotWindow';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChatProvider>
      {/* <App /> */}
      <ChatBotWindow />
    </ChatProvider>
  </React.StrictMode>
); 