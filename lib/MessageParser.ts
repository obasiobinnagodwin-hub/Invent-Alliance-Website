class MessageParser {
  actionProvider: any;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
      return this.actionProvider.handleGreeting();
    }

    if (lowerCaseMessage.includes('about') || lowerCaseMessage.includes('company') || lowerCaseMessage.includes('who')) {
      return this.actionProvider.handleAboutUs();
    }

    if (lowerCaseMessage.includes('service') || lowerCaseMessage.includes('product') || lowerCaseMessage.includes('what do you do')) {
      return this.actionProvider.handleServices();
    }

    if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('email') || lowerCaseMessage.includes('phone') || lowerCaseMessage.includes('address')) {
      return this.actionProvider.handleContact();
    }

    if (lowerCaseMessage.includes('career') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('employment') || lowerCaseMessage.includes('hire')) {
      return this.actionProvider.handleCareers();
    }

    if (lowerCaseMessage.includes('academy') || lowerCaseMessage.includes('training') || lowerCaseMessage.includes('learn') || lowerCaseMessage.includes('course')) {
      return this.actionProvider.handleAcademy();
    }

    if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('thanks')) {
      return this.actionProvider.handleThanks();
    }

    if (lowerCaseMessage.includes('bye') || lowerCaseMessage.includes('goodbye') || lowerCaseMessage.includes('see you')) {
      return this.actionProvider.handleGoodbye();
    }

    return this.actionProvider.handleDefault();
  }
}

export default MessageParser;

