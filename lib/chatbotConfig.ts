import { createChatBotMessage } from 'react-chatbot-kit';
import React from 'react';

const Options = (props: any) => {
  const options = [
    {
      text: 'About Us',
      handler: () => {
        props.actionProvider.handleAboutUs();
      },
      id: 1,
    },
    {
      text: 'Our Services',
      handler: () => {
        props.actionProvider.handleServices();
      },
      id: 2,
    },
    {
      text: 'Contact Information',
      handler: () => {
        props.actionProvider.handleContact();
      },
      id: 3,
    },
    {
      text: 'Careers',
      handler: () => {
        props.actionProvider.handleCareers();
      },
      id: 4,
    },
    {
      text: 'Invent Academy',
      handler: () => {
        props.actionProvider.handleAcademy();
      },
      id: 5,
    },
  ];

  return (
    <div className="options-container">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={option.handler}
          className="option-button bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg mb-2 w-full text-left transition-colors duration-200"
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

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
      widgetFunc: (props: any) => React.createElement(Options, props),
    },
  ],
};

export default config;

