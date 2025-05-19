//NextJS
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useDomainPreferences } from '../../context/DomainPreferencesContext';

//HeroUI
import { Button, Link } from '@heroui/react';

//Components
//Auth
import ProtectedRoute from '../../components/auth/ProtectedRoute';

//Chat
import { ChatContent } from '../../components/chat/ChatContent';
import ChatInput from '../../components/chat/ChatInput';
import ChatFollowup from '../../components/chat/ChatFollowup';

//Types
import { Message, Action } from '../../types/chat';

type StatusType = 'idle' | 'thinking' | 'searching' | 'typing' | 'done';

interface Chat {
  id: string;
  title: string;
  slug: string;
  messages: Message[];
  timestamp: number;
}

import { useRouter } from 'next/router';

export default function Chat() {
  const router = useRouter();
  const { slug } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusType>('idle');
  const { preferences } = useDomainPreferences();

  const handleEditMessage = (index: number, newContent: string) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[index].content = newContent;
      return updated;
    });
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [currentAction, setCurrentAction] = useState<StatusType>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [initialQuery, setInitialQuery] = useState<string>('');

  // Load chat and search history from localStorage and handle initial query
  useEffect(() => {
    if (!slug) return;

    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        const chats = JSON.parse(savedChats) as Chat[];
        const currentChat = chats.find(c => c.slug === slug);
        if (currentChat) {
          setMessages(currentChat.messages);
          // Set other additional data if available
          // Only set initial query if this is a new chat with no messages
          if (currentChat.messages.length === 0) {
            // Get the query from the slug
            const slugStr = Array.isArray(slug) ? slug[0] : slug;
            // Remove UUID (last segment after last hyphen)
            const queryFromSlug = slugStr.replace(/-[^-]*$/, '').replace(/-/g, ' ');
            setInitialQuery(queryFromSlug);
          }
        } else {
          // Create new chat if it doesn't exist
          const newChat: Chat = {
            id: crypto.randomUUID(),
            title: '',
            slug: Array.isArray(slug) ? slug[0] : slug,
            messages: [],
            timestamp: Date.now(),
          } as Chat;
          const updatedChats = [...chats, newChat];
          localStorage.setItem('chats', JSON.stringify(updatedChats));
          // Trigger storage event to update sidebar
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'chats',
            newValue: JSON.stringify(updatedChats)
          }));
        }
      } catch (e) {
        console.error('Error parsing chats:', e);
      }
    }
  }, [slug]);

  // Handle initial query from URL slug
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.isReady) {
        // First check for query parameter
        const queryParam = router.query.q as string;
        if (queryParam && !initialQuery) {
          const decodedQuery = decodeURIComponent(queryParam);
          setInitialQuery(decodedQuery);
          // Remove the query parameter from the URL without refreshing
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('q');
          window.history.replaceState({}, '', newUrl.toString());
        } 
        // Then check for slug
        else if (slug && !initialQuery) {
          const slugStr = Array.isArray(slug) ? slug[0] : slug;
          // Remove UUID (last segment after last hyphen)
          const queryFromSlug = slugStr.replace(/-[^-]*$/, '').replace(/-/g, ' ');
          setInitialQuery(queryFromSlug);
        }
        setIsInitialLoad(false);
      }
    };

    // Check immediately if router is ready
    handleRouteChange();
    
    // Also listen for route changes in case the query param is added after initial load
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.isReady, router.query.q, router.events]);

  // Handle question count and limits in a separate effect
  useEffect(() => {
    const questionCount = parseInt(localStorage.getItem('questionCount') || '0', 10);
    
    if (questionCount >= 10) {
      setIsLimitReached(true);
      setShowLimitDialog(true);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (!slug) return;

    const savedChats = localStorage.getItem('chats');
    if (!savedChats) {
      localStorage.setItem('chats', JSON.stringify([]));
      return;
    }

    const chats = JSON.parse(savedChats) as Chat[];
    const currentChatIndex = chats.findIndex(c => c.slug === slug);
    
    if (currentChatIndex === -1) {
      // Create new chat if it doesn't exist
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: '',
        slug: Array.isArray(slug) ? slug[0] : slug,
        messages: [],
        timestamp: Date.now(),
        actions: [],
        searchResults: [],
        searchImages: [],
        followupQuestions: []
      } as Chat;
      chats.push(newChat);
    }

    // Update existing chat
    const chatToUpdate = chats.find(c => c.slug === slug);
    if (chatToUpdate) {
      // Only update messages if we have new ones
      if (messages.length > 0) {
        chatToUpdate.messages = messages;
        chatToUpdate.timestamp = Date.now();
        chatToUpdate.title = messages[0].role === 'user' ? messages[0].content : chatToUpdate.title;
        
        // Save updated chats to localStorage
        localStorage.setItem('chats', JSON.stringify(chats));
        // Trigger storage event to update sidebar
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'chats',
          newValue: JSON.stringify(chats)
        }));
      }
    }
  }, [messages, slug]);

  // Update search history with new terms
  const handleSubmit = async (message: string, forceWebSearch: boolean = false, files?: File[]) => {
    // Clear the initial query after first submission
    if (initialQuery) {
      setInitialQuery('');
    }

    setIsLoading(true);
    setStatus('thinking');
    setActions([{ status: 'thinking', stepType: 'assistant', message: 'Miku is thinking...' }]);
    setCurrentAction('thinking');
    
    // Create user message with files
    const userMessage: Message = {
      role: 'user',
      content: message,
      files: files?.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      sources: [],
      actions: [],
      currentAction: 'idle'
    };
    
    // Update messages and save immediately
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Save to localStorage right away
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const chats = JSON.parse(savedChats) as Chat[];
      const chatToUpdate = chats.find(c => c.slug === slug);
      if (chatToUpdate) {
        chatToUpdate.messages = newMessages;
        localStorage.setItem('chats', JSON.stringify(chats));
      }
    }
    
    // Create assistant message placeholder
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      sources: [],
      actions: [],
      currentAction: 'idle'
    };
    
    // Update messages with assistant placeholder and save
    const messagesWithAssistant = [...newMessages, assistantMessage];
    setMessages(messagesWithAssistant);
    
    // Save to localStorage again with assistant placeholder
    if (savedChats) {
      const chats = JSON.parse(savedChats) as Chat[];
      const chatToUpdate = chats.find(c => c.slug === slug);
      if (chatToUpdate) {
        chatToUpdate.messages = messagesWithAssistant;
        localStorage.setItem('chats', JSON.stringify(chats));
      }
    }
    
    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append('messages', JSON.stringify(forceWebSearch ? 
        [...messages, 
          { role: 'system', content: 'Force web search for the next user query.' },
          userMessage
        ] : 
        [...messages, userMessage]
      ));
      formData.append('domainPreferences', JSON.stringify({
        includeDomains: preferences.includeDomains,
        excludeDomains: preferences.excludeDomains
      }));
      
      // Append files if they exist
      if (files) {
        files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await fetch('/api/chat/completion', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            console.log(data);
            
            // Update actions and current action
            if (data.actions) {
              setActions(data.actions);
            }
            if (data.currentAction) {
              setCurrentAction(data.currentAction);
              setStatus(data.currentAction);
              
              // Reset loading state when we're done
              if (data.currentAction === 'done') {
                setIsLoading(false);
              }
            }
            
            // Update the last message (assistant's message) and save immediately
            setMessages(prev => {
              const newMessages = [...prev];
              const lastAssistantIdx = newMessages.map(m => m.role).lastIndexOf('assistant');
              if (lastAssistantIdx >= 0) {
                const updated = { ...newMessages[lastAssistantIdx] };
                if (data.content) updated.content = (updated.content || '') + data.content;
                if ('actions' in data) updated.actions = data.actions;
                if ('searchResults' in data) updated.sources = data.searchResults;
                if ('searchImages' in data) updated.searchImages = data.searchImages;
                if ('followupQuestions' in data) updated.followupQuestions = data.followupQuestions;
                if ('currentAction' in data) {
                  updated.currentAction = data.currentAction;
                  setCurrentAction(data.currentAction);
                  setStatus(data.currentAction);
                  
                  // Reset loading state when we're done
                  if (data.currentAction === 'done') {
                    setIsLoading(false);
                  }
                }
                newMessages[lastAssistantIdx] = updated;
                
                // Save to localStorage immediately
                const savedChats = localStorage.getItem('chats');
                if (savedChats) {
                  const chats = JSON.parse(savedChats) as Chat[];
                  const chatToUpdate = chats.find(c => c.slug === slug);
                  if (chatToUpdate) {
                    chatToUpdate.messages = newMessages;
                    localStorage.setItem('chats', JSON.stringify(chats));
                  }
                }
              }
              return newMessages;
            });
          } catch (e) {
            console.error('Error parsing chunk:', e, 'Line:', line);
          }
        }
      }

      // Increment question count
      const newCount = parseInt(localStorage.getItem('questionCount') || '0', 10) + 1;
      localStorage.setItem('questionCount', newCount.toString());
      
      if (newCount >= 10) {
        setIsLimitReached(true);
        setShowLimitDialog(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
      setStatus('idle');
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Miku - Chat</title>
        <meta name="description" content="Chat with Miku AI" />
      </Head>
      <main className="">
        <div className="w-full md:max-w-4xl md:mx-auto pb-10 mb-36">
          <ChatContent
            messages={messages}
            isLoading={isLoading}
            status={status}
            actions={actions}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
          {!isLoading && messages.length > 0 && (
            <ChatFollowup
              lastMessage={messages[messages.length - 1]}
              onFollowupClick={(question) => handleSubmit(question)}
            />
          )}
        </div>
        <div className="fixed bottom-0 left-0 right-0 py-4">
          <div className="max-w-4xl mx-auto px-4">
            <ChatInput
              onSubmit={handleSubmit}
              disabled={isLoading}
              messages={messages}
              initialValue={initialQuery}
            />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}