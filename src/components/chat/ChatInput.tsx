import { Button, Textarea } from '@heroui/react';
import { useState, useEffect } from 'react';
import { LuSend } from 'react-icons/lu';
import { LuSearch } from 'react-icons/lu';
import { LuPaperclip } from 'react-icons/lu';

interface ChatInputProps {
  onSubmit: (message: string, forceWebSearch?: boolean, files?: File[]) => void;
  disabled?: boolean;
  messages: any[]; // Add messages prop to check if we should show suggestions
  initialValue?: string;
}

const SUGGESTED_QUERIES = [
  "What are the best AI startups right now?",
  "What's the latest breakthrough in quantum computing?",
  "What are the trending tech innovations in 2025?",
  "What are the latest developments in renewable energy?"
];

// Add search detection patterns
const SEARCH_PATTERNS = [
  /^search for/i,
  /^find/i,
  /^look up/i,
  /^what is/i,
  /^who is/i,
  /^where is/i,
  /^when did/i,
  /^how to/i,
  /^latest news about/i,
  /^tell me about/i,
  /^information about/i,
  /^details about/i,
  /^news about/i,
  /^updates on/i,
  /^recent developments in/i,
  /^trending in/i,
  /^best/i,
  /^top/i,
  /^compare/i,
  /^difference between/i
];

export default function ChatInput({ onSubmit, disabled, messages = [], initialValue = '' }: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Function to detect if message should trigger search
  const shouldTriggerSearch = (text: string): boolean => {
    return SEARCH_PATTERNS.some(pattern => pattern.test(text.trim()));
  };

  // Update message state and check for search triggers
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Auto-enable search if message matches search patterns
    if (shouldTriggerSearch(newMessage)) {
      setSearchEnabled(true);
    }
  };

  // Clear textarea if there are existing messages
  useEffect(() => {
    if (messages.length > 0) {
      setMessage('');
    }
  }, [messages]);

  // Update message state when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (query: string) => {
    onSubmit(query, searchEnabled);
  };

  return (
    <div className="z-40 w-full">
      {messages.length === 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 max-w-[500px] mx-auto">
          {SUGGESTED_QUERIES.map((query, index) => (
            <Button
              key={index}
              onPress={() => handleSuggestionClick(query)}
              disabled={disabled}
              className="w-full h-auto min-h-[80px] px-4 py-2 backdrop-blur-3xl text-default-500 duration-1000 hover:text-default-900 hover:border-default-800 bg-transparent border border-default-200 rounded-xl"
            >
              <div className="w-full">
                <p className="text-sm text-left break-words whitespace-normal m-0 p-0">
                  {query}
                </p>
              </div>
            </Button>
          ))}
        </div>
      )}
      <form 
        onSubmit={handleSubmit} 
        className="relative"
      >
        <div className="relative flex flex-col gap-2">
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-default-50 rounded-lg">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-default-100 px-3 py-1 rounded-full">
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-default-500 hover:text-default-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <Textarea
            className={"bg-default-100 bg-opacity-80 backdrop-blur-sm"}
            variant="bordered"
            minRows={4}
            size='lg'
            value={message}
            onChange={handleMessageChange}
            disabled={disabled}
            placeholder={searchEnabled ? "Search the web..." : "Ask me anything..."}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            endContent={
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  //disabled={disabled}
                  disabled={true}
                />
                <Button
                  type="button"
                  isIconOnly
                  size="md"
                  //isDisabled={disabled}
                  isDisabled={true}
                  className={disabled ? "bg-default-800 text-white" : "bg-default-100 text-default-400"}
                  onPress={() => document.getElementById('file-upload')?.click()}
                >
                  <LuPaperclip />
                </Button>
                <Button
                  type="submit"
                  isIconOnly
                  size="md"
                  isDisabled={disabled || (!message.trim() && selectedFiles.length === 0)}
                  className={searchEnabled ? "bg-default-900 disabled:text-default-500 disabled:bg-default-200 text-default-100" : "bg-default-800 disabled:text-default-500 disabled:bg-default-200 text-default-100"}
                >
                  {searchEnabled ? <LuSearch /> : <LuSend />}
                </Button>
              </div>
            }
          />
          <Button
            size="sm"
            radius="full"
            onPress={() => setSearchEnabled(!searchEnabled)}
            className={`absolute z-20 m-2 bottom-1 left-1 ${searchEnabled ? "bg-default-900 text-default-100" : "bg-default-50 text-default-900"}`}
            startContent={<LuSearch size={16} />}
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

