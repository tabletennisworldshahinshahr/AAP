import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState } from './types';
import { sendMessageToGemini } from './services/gemini';
import { InputArea } from './components/InputArea';
import { MessageBubble } from './components/MessageBubble';
import { Stethoscope, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        role: 'model',
        text: 'سلام! دکتر دامیار هستم، متخصص ارشد بیماری‌های دامی. عکس دام بیمار رو بفرست یا مشکلش رو بگو (تایپ کن یا ویس بده) تا راهنماییت کنم.',
        timestamp: Date.now(),
      }
    ],
    isLoading: false,
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async (text: string, image: string | null, audio: string | null, audioMime: string) => {
    // Add User Message
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      image: image || undefined,
      audio: audio || undefined,
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
      error: null,
    }));

    // Call API
    const responseText = await sendMessageToGemini(
      text,
      chatState.messages,
      image,
      audio,
      audioMime
    );

    // Add Model Message
    const modelMsg: Message = {
      id: uuidv4(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, modelMsg],
      isLoading: false,
    }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1484557985045-7f5d30067e89?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Header */}
      <header className="bg-green-800 text-white p-4 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-green-800">
             <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">دکتر دامیار</h1>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col">
          {chatState.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {/* Loading Indicator */}
          {chatState.isLoading && (
            <div className="self-start flex items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-500 text-sm">
               <Stethoscope className="animate-pulse" size={16} />
               <span>دکتر در حال بررسی پرونده...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Disclaimer Banner */}
      <div className="bg-yellow-50 border-t border-yellow-200 p-2 text-center text-xs text-yellow-800 z-10 flex items-center justify-center gap-2">
        <AlertTriangle size={14} />
        <span>توجه: این هوش مصنوعی جایگزین دامپزشک حضوری نیست. در موارد اورژانسی حتما به کلینیک مراجعه کنید.</span>
      </div>

      {/* Input Area */}
      <div className="z-10">
        <InputArea onSend={handleSendMessage} isLoading={chatState.isLoading} />
      </div>
    </div>
  );
};

export default App;