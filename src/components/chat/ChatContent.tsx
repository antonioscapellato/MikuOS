import React, { useState } from 'react';

// Utils
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';

// Types
import { Message, SearchResult, SearchImage, Action } from '../../types/chat';

// HeroUI
import { Tabs, Tab, Link, addToast, Button, Textarea, Chip, Image } from "@heroui/react";

// Components
import ChatImageVisualizer from './ChatImageVisualizer';

// PostHog
import { usePostHog } from 'posthog-js/react';

// Icons
import { AiOutlineGlobal, AiOutlineMore, AiOutlineEdit, AiOutlineDelete, AiOutlineCopy, AiOutlineCheck, AiOutlineClose, AiOutlinePicture, AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { IoCopyOutline } from "react-icons/io5";
import { FiDelete, FiEdit3 } from "react-icons/fi";
import { BiSolidHandDown, BiSolidHandUp } from "react-icons/bi";
import { LuFile } from 'react-icons/lu';

type StatusType = 'idle' | 'thinking' | 'searching' | 'typing' | 'done';

interface ChatContentProps {
  messages: Message[];
  isLoading: boolean;
  status: StatusType;
  actions: Action[];
  onEditMessage?: (index: number, newContent: string) => void;
  onDeleteMessage?: (index: number) => void;
}

export const ChatContent: React.FC<ChatContentProps> = ({ 
  messages,
  isLoading,
  actions,
  onEditMessage = () => {},
  onDeleteMessage = () => {}
}) => {
  const posthog = usePostHog();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageDescription, setSelectedImageDescription] = useState<string | null>(null);
  const [isImageVisualizerOpen, setIsImageVisualizerOpen] = useState(false);
  const [ratedMessages, setRatedMessages] = useState<Record<number, number>>({});

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Capture message copy event
    posthog?.capture('message', {
      type: 'copy',
      content_length: text.length
    });
  };

  const startEditing = (index: number, content: string) => {
    setEditingIndex(index);
    setEditText(content);
    // We don't capture an event here as this is just starting the edit process
    // The actual edit event will be captured when the edit is saved
  };

  const saveEdit = (index: number) => {
    if (editText.trim()) {
      // Capture message edit event
      posthog?.capture('message', {
        type: 'edit',
        message_id: index,
        content_length: editText.trim().length
      });
      onEditMessage(index, editText);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    // Capture message delete event
    posthog?.capture('message', {
      type: 'delete',
      message_id: index
    });
    onDeleteMessage(index);
  };

  const handleImageClick = (imageUrl: string, description?: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageDescription(description || null);
    setIsImageVisualizerOpen(true);
  };

  const handleImageVisualizerChange = (isOpen: boolean) => {
    setIsImageVisualizerOpen(isOpen);
    // Clear the selected image after a short delay when closing
    if (!isOpen) {
      setTimeout(() => {
        setSelectedImage(null);
        setSelectedImageDescription(null);
      }, 300);
    }
  };

  const handleRateMessage = (messageIndex: number, rating: number) => {
    // Prevent rating the same message multiple times with different ratings
    if (ratedMessages[messageIndex] !== undefined && ratedMessages[messageIndex] !== rating) {
      // If changing from one rating to another, capture the event
      posthog?.capture('message', {
        type: 'rating',
        value: rating,
        message_id: messageIndex,
        previous_rating: ratedMessages[messageIndex]
      });
    } else if (ratedMessages[messageIndex] === undefined) {
      // Only capture if not previously rated
      posthog?.capture('message', {
        type: 'rating',
        value: rating,
        message_id: messageIndex
      });
    }
    
    // Update the rated messages state
    setRatedMessages(prev => ({
      ...prev,
      [messageIndex]: rating
    }));
    
    // Show feedback toast
    addToast({
      title: rating === 1 ? "Thanks for the positive feedback!" : "Thanks for your feedback",
      description: rating === 1 ? "We're glad this response was helpful." : "We'll use this to improve future responses.",
      color: rating === 1 ? "success" : "default",
    });
  };

  // Scroll to bottom when new messages are added or when loading state changes
  React.useEffect(() => {
    // Only auto-scroll if we're at or near the bottom already
    // This prevents auto-scrolling when user is viewing previous messages
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Small delay to ensure DOM has updated
    setTimeout(scrollToBottom, 100);
  }, [messages, isLoading, actions]);

  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-4 py-4 mt-16">


      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-default-400">Start a conversation with Miku</p>
        </div>
      )}

      {messages.map((message, index) => {
        if (message.role === 'user') {
          return (
            <div key={index} className="mt-16">
              <div className="group relative">
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold mb-4">{message.content}</h1>
                </div>
                {message.files && message.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center gap-2 bg-default-100 px-3 py-1 rounded-full">
                        <LuFile className="text-default-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="overflow-x-auto max-w-full">
              <Tabs aria-label="Chat options" variant='underlined'>
                <Tab key="answer" title="Answer">
                  {messages[index + 1]?.content && (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                    {editingIndex === index + 1 ? (
                      <div className="flex flex-col space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                          maxRows={40}
                        />
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" className={"bg-default-100 text-default-600"} onPress={() => saveEdit(index + 1)}>
                            <AiOutlineCheck /> Save
                          </Button>
                          <Button size="sm" className={"bg-default-100 text-default-600"} onPress={cancelEdit}>
                            <AiOutlineClose /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <MarkdownRenderer content={messages[index + 1].content} />
                        <div className="flex mt-2 justify-between">
                          <div className="flex">
                            <Button
                              key="copy-ai"
                              isIconOnly
                              className="bg-transparent text-default-500 hover:text-default-600"
                              startContent={<IoCopyOutline size={16} />}
                              onPress={() => {
                                handleCopy(messages[index + 1].content);
                                addToast({
                                  title: "Copied to clipboard",
                                  description: "Message copied successfully",
                                  color: "default",
                                });
                              }}
                            />
                            <Button
                              key="rate-good"
                              isIconOnly
                              className={`${ratedMessages[index + 1] === 1 ? 'bg-success-100 text-success-600' : 'bg-transparent text-default-500 hover:text-success-600'}`}
                              startContent={<AiOutlineLike size={18} />}
                              onPress={() => handleRateMessage(index + 1, 1)}
                              aria-label="Good response"
                            />
                            <Button
                              key="rate-bad"
                              isIconOnly
                              className={`${ratedMessages[index + 1] === -1 ? 'bg-transparent text-danger-400' : 'bg-transparent text-default-500 hover:text-danger-600'}`}
                              startContent={<AiOutlineDislike size={18} />}
                              onPress={() => handleRateMessage(index + 1, -1)}
                              aria-label="Bad response"
                            />
                            <Button
                              key="edit-ai"
                              isIconOnly
                              className="bg-transparent text-default-500 hover:text-default-600"
                              startContent={<FiEdit3 size={16} />}
                              onPress={() => startEditing(index + 1, messages[index + 1].content)}
                            />
                            <Button
                              key="delete-ai"
                              isIconOnly
                              className="bg-transparent text-default-500 hover:text-default-600"
                              startContent={<FiDelete size={16} />}
                              onPress={() => {
                                handleDelete(index) 
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                  )}
                </Tab>
                <Tab  
                  key="sources"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Sources</span>
                      <div className="text-xs text-default-500 rounded-full px-2 py-1 bg-default-50">
                        {messages[index + 1]?.sources?.length}
                      </div>
                    </div>
                  }
                >
                {!messages[index + 1]?.sources?.length ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No sources found for this answer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages[index + 1]?.sources?.map((result, i) => (
                        <div key={i} className="">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-default-900 truncate">
                                {result.title}
                              </h3>
                              <p className="text-sm text-default-500 truncate">
                                {result.content}
                              </p>
                              <Link 
                                href={result.url} 
                                isExternal 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                {result.url}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab>
                <Tab 
                  key="images"
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Images</span>
                      <div className="text-xs text-default-500 rounded-full px-2 py-1 bg-default-50">
                        {messages[index + 1]?.searchImages?.length || 0}
                      </div>
                    </div>
                  }
                >
                  {!messages[index + 1]?.searchImages?.length ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No images found for this answer.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                      {messages[index + 1]?.searchImages?.map((image, i) => (
                        <div key={i} className="overflow-hidden">
                          <div 
                            className="aspect-w-16 aspect-h-9 relative cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(image.url, image.description)}
                          >
                            <Image 
                              src={image.url} 
                              alt={image.description || 'Search result image'} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab>
                <Tab 
                  key="actions" 
                  title={
                    <div className="flex items-center space-x-2">
                      <span>Actions</span>
                      <div className="text-xs text-default-500 rounded-full px-2 py-1 bg-default-50">
                        {messages[index + 1]?.actions?.length || 0}
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {messages[index + 1]?.actions?.length ? (
                      messages[index + 1]?.actions?.map((action, i) => (
                        <div key={i} className="border-l-2 border-green-400 pl-4">
                          <p className="text-sm text-default-600">{action?.stepType}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No actions recorded for this message.</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
          );
        }
        return null;
      })}

      <div ref={messagesEndRef} />

      {/* Image Visualizer */}
      {selectedImage && (
        <ChatImageVisualizer
          isOpen={isImageVisualizerOpen}
          onOpenChange={handleImageVisualizerChange}
          imageUrl={selectedImage}
          imageDescription={selectedImageDescription || undefined}
        />
      )}

      {isLoading && (
        <div className="flex flex-col justify-start space-y-2">
          <div className="flex flex-col space-y-2">
            <div className="animate-pulse w-full h-48 rounded-xl bg-default-100"></div>
            <div className="animate-pulse w-full h-12 rounded-xl bg-default-100"></div>
            <div className="animate-pulse w-full h-12 rounded-xl bg-default-100"></div>
            <div className="animate-pulse w-full h-12 rounded-xl bg-default-100"></div>
          </div>
        </div>
      )}

    </div>
  );
};
