import { useEffect, useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MemoryHeader from '../components/memory/MemoryHeader';
import MemoryGraph from '../components/memory/MemoryGraph';
import { Message } from '../types/chat';

interface SearchTerm {
  term: string;
  count: number;
  relatedTerms: string[];
}

interface Chat {
  id: string;
  title: string;
  slug: string;
  messages: Message[];
  timestamp: number;
}

export default function Memory() {
  const [searchHistory, setSearchHistory] = useState<SearchTerm[]>([]);

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const chats = JSON.parse(savedChats);
      const terms = extractTermsFromChats(chats);
      setSearchHistory(terms);
    }
  }, []);

  const extractTermsFromChats = (chats: any[]) => {
    const termMap = new Map<string, { count: number; relatedTerms: Set<string> }>();

    chats.forEach(chat => {
      // Process title and messages
      const text = chat.title + ' ' + (chat.messages || []).map((m: Message) => m.content).join(' ');
      const words = text.toLowerCase().match(/[\w\-]+/g) || []; // Match words and hyphens

      // List of common conjunction words to ignore
      const conjunctions = new Set([
        'what', 'the', 'with', 'who', 'which', 'when', 'where', 'why', 'how',
        'a', 'an', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to',
        'for', 'of', 'by', 'from', 'with', 'without', 'about', 'between',
        'into', 'through', 'under', 'after', 'before', 'since', 'until',
        'while', 'as', 'because', 'though', 'although', 'unless',
        'than', 'like', 'such', 'other', 'some', 'any', 'many', 'few',
        'more', 'most', 'less', 'least', 'first', 'last', 'next', 'previous',
        'up', 'down', 'out', 'over', 'under', 'around', 'about', 'behind',
        'below', 'above', 'near', 'far', 'inside', 'outside', 'across',
        'along', 'among', 'behind', 'beside', 'beneath', 'beyond',
        'during', 'except', 'inside', 'near', 'off', 'past', 'round',
        'since', 'through', 'toward', 'under', 'underneath', 'until',
        'unto', 'upon', 'with', 'within', 'without'
      ].map(word => word.toLowerCase()));

      words.forEach(word => {
        const normalized = word.replace(/[^\w\-]/g, '').toLowerCase();
        // Ignore conjunctions and very short words
        if (normalized.length > 2 && !conjunctions.has(normalized)) {
          if (!termMap.has(normalized)) {
            termMap.set(normalized, { count: 0, relatedTerms: new Set() });
          }
          termMap.get(normalized)!.count++;
        }
      });

      // Build relationships between words
      for (let i = 0; i < words.length - 1; i++) {
        const word1 = words[i];
        const word2 = words[i + 1];
        if (word1.length > 2 && word2.length > 2) {
          const normalized1 = word1.replace(/[^\w\-]/g, '');
          const normalized2 = word2.replace(/[^\w\-]/g, '');
          if (termMap.has(normalized1) && termMap.has(normalized2)) {
            termMap.get(normalized1)!.relatedTerms.add(normalized2);
            termMap.get(normalized2)!.relatedTerms.add(normalized1);
          }
        }
      }
    });

    // Convert map to array of SearchTerm
    return Array.from(termMap.entries()).map(([term, data]) => ({
      term,
      count: data.count,
      relatedTerms: Array.from(data.relatedTerms)
    }));
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Search Memory - Miku AI</title>
        <meta name="description" content="View your search history and knowledge connections" />
      </Head>
      
      <div className="min-h-screen">
        <MemoryHeader />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Graph */}
            <div className="lg:col-span-2">
              <MemoryGraph searchHistory={searchHistory} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}