'use client';

import React from 'react';

interface ChatbotOptionsProps {
  actionProvider: any;
}

export default function ChatbotOptions({ actionProvider }: ChatbotOptionsProps) {
  const options = [
    {
      text: 'About Us',
      handler: () => {
        actionProvider.handleAboutUs();
      },
      id: 1,
    },
    {
      text: 'Our Services',
      handler: () => {
        actionProvider.handleServices();
      },
      id: 2,
    },
    {
      text: 'Contact Information',
      handler: () => {
        actionProvider.handleContact();
      },
      id: 3,
    },
    {
      text: 'Careers',
      handler: () => {
        actionProvider.handleCareers();
      },
      id: 4,
    },
    {
      text: 'Invent Academy',
      handler: () => {
        actionProvider.handleAcademy();
      },
      id: 5,
    },
  ];

  return (
    <div className="options-container p-4">
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
}

