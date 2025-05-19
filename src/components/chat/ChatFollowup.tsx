
// NextJS
import React from 'react';

// HeroUI
import { Button } from '@heroui/react';

// Types
import { Message } from '../../types/chat';

// Utils
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';

interface ChatFollowupProps {
  lastMessage?: Message;
  onFollowupClick: (question: string) => void;
}

export const ChatFollowup: React.FC<ChatFollowupProps> = ({ 
  lastMessage,
  onFollowupClick
}) => {
  // We'll only show followups if there's a last assistant message
  if (!lastMessage || lastMessage.role !== 'assistant') {
    return null;
  }
  
  // Debug: Log the message to see what we're getting
  console.log('ChatFollowup received message:', lastMessage);

  // Default questions if API doesn't provide any
  const defaultQuestions = [
    "Can you explain more about this topic?",
    "What are the key benefits of this approach?",
    "Are there any alternatives to consider?",
    "How can I implement this in practice?"
  ];
  
  // Use the followupQuestions from the API response if available, otherwise use defaults
  const followupQuestions = lastMessage.followupQuestions || defaultQuestions;

  return (
    <div className="flex items-start align-center justify-start">
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
          {followupQuestions.map((question, index) => (
            <Button 
              key={index}
              radius={"sm"}
              className="md:h-18 h-16 py-0 px-4 justify-start text-left break-words whitespace-normal max-w-3xl bg-default-50 hover:bg-default-100 text-default-700"
              onPress={() => onFollowupClick(question)}
            >
              <div className="markdown-button-content">
                <MarkdownRenderer content={question} />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatFollowup;
