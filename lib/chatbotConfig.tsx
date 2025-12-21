import { createChatBotMessage } from 'react-chatbot-kit';
import ChatbotOptions from '@/components/ChatbotOptions';
import React from 'react';

const config = {
  initialMessages: [
    createChatBotMessage("Hello! Welcome to Invent Alliance Limited. How can I assist you today?", {
      widget: 'options',
    }),
  ],
  botName: 'Invent Alliance Support',
  customStyles: {
    botMessageBox: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    chatButton: {
      backgroundColor: '#3b82f6',
    },
  },
  widgets: [
    {
      widgetName: 'options',
      widgetFunc: (props: any) => React.createElement(ChatbotOptions, props),
      props: {},
      mapStateToProps: [],
    },
  ],
} as any;

export default config;

