import React from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Volume2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md
          ${isUser ? 'bg-blue-600 text-white' : 'bg-green-700 text-white'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col gap-2 p-4 rounded-2xl shadow-sm border
          ${isUser 
            ? 'bg-blue-50 border-blue-100 text-gray-800 rounded-tr-none' 
            : 'bg-white border-gray-200 text-gray-800 rounded-tl-none'
          }`}>
          
          {/* Metadata: User name */}
          <span className={`text-xs font-bold ${isUser ? 'text-blue-600 text-left' : 'text-green-700 text-right'}`}>
            {isUser ? 'دامدار (شما)' : 'دکتر دامیار'}
          </span>

          {/* Image Attachment */}
          {message.image && (
            <div className="mb-2">
              <img 
                src={message.image} 
                alt="Uploaded" 
                className="max-w-full rounded-lg border border-gray-200 max-h-64 object-cover" 
              />
            </div>
          )}

          {/* Audio Indicator (Basic) */}
          {message.audio && (
            <div className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg text-sm mb-2 w-fit">
               <Volume2 size={16} />
               <span>پیام صوتی ارسال شد</span>
            </div>
          )}

          {/* Text Content */}
          <div className={`markdown-content leading-relaxed text-sm md:text-base ${!isUser ? 'text-right' : 'text-left'}`}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
          
          {/* Timestamp */}
          <span className="text-[10px] text-gray-400 self-end mt-1">
            {new Date(message.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
          </span>

        </div>
      </div>
    </div>
  );
};
