import { createChatBotMessage } from 'react-chatbot-kit';

class ActionProvider {
  createChatBotMessage: any;
  setState: any;

  constructor(createChatBotMessage: any, setStateFunc: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleGreeting() {
    const message = this.createChatBotMessage(
      "Hello! I'm here to help you learn more about Invent Alliance Limited. What would you like to know?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleAboutUs() {
    const message = this.createChatBotMessage(
      "Invent Alliance Limited is a globally recognized, diversified multi-sector enterprise that specializes in creating innovative business ecosystems through strategic partnerships and collaborative value creation. We operate on the principle of co-opetition; a forward-thinking business model that harmonizes collaboration with competitive excellence. Would you like to know more about our services or contact information?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleServices() {
    const message = this.createChatBotMessage(
      "We offer a wide range of services including:\n\n• Bakery Services & Consultancy\n• Business Process Outsourcing\n• Virtual Office & Hosted Services\n• High Tech Logistics\n• Invent Power Systems\n• Invent Properties (Real Estate)\n• Invent Shortlet\n\nWould you like more details about any specific service?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleContact() {
    const message = this.createChatBotMessage(
      "You can reach us through:\n\n📍 Address: The Invent HQ, Lagos, Nigeria\n📧 Email: info@inventallianceco.com\n📞 Phone: +234 (0) 906 276 4054\n\nYou can also use our contact form on the website for inquiries. Would you like to know more about our services?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleCareers() {
    const message = this.createChatBotMessage(
      "We're always looking for talented individuals to join our team! Visit our Careers page to see open positions and learn more about working at Invent Alliance Limited. You can also submit your application directly through our website. Would you like information about our company culture or specific job openings?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleAcademy() {
    const message = this.createChatBotMessage(
      "Invent Academy offers training programs for aspiring bakery professionals and confectionery investors. We have two streams:\n\n• Aspiring Bakery Professional (16+ years)\n• Confectionery and Bakery Investor (18+ years)\n\nTraining is facilitated by our team of seasoned professionals. Visit our Invent Academy Registration page to apply!",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleThanks() {
    const message = this.createChatBotMessage(
      "You're welcome! Is there anything else I can help you with?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  handleGoodbye() {
    const message = this.createChatBotMessage(
      "Thank you for visiting Invent Alliance Limited! Have a great day, and feel free to come back if you have any questions.",
    );
    this.updateChatbotState(message);
  }

  handleDefault() {
    const message = this.createChatBotMessage(
      "I'm here to help you learn more about Invent Alliance Limited. You can ask me about our company, services, contact information, careers, or Invent Academy. What would you like to know?",
      { widget: 'options' }
    );
    this.updateChatbotState(message);
  }

  updateChatbotState(message: any) {
    this.setState((prevState: any) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;

