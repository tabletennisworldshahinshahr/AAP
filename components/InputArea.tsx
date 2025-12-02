import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, X, Loader2, StopCircle } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, image: string | null, audio: string | null, audioMime: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("دسترسی به میکروفون امکان‌پذیر نیست.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !image && !audioBlob) || isLoading) return;

    let audioBase64: string | null = null;
    let audioMime = 'audio/webm';

    if (audioBlob) {
        audioMime = audioBlob.type;
        audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
        });
    }

    onSend(text, image, audioBase64, audioMime);
    
    // Reset state
    setText('');
    setImage(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
      
      {/* Previews */}
      <div className="flex gap-2 mb-2 overflow-x-auto">
        {image && (
          <div className="relative inline-block">
            <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300" />
            <button 
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {audioBlob && (
           <div className="relative flex items-center bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
             <span className="text-sm text-gray-700">پیام صوتی آماده ارسال</span>
             <button 
              onClick={() => setAudioBlob(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X size={14} />
            </button>
           </div>
        )}
      </div>

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
          title="افزودن عکس"
        >
          <ImageIcon size={24} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />

        {isRecording ? (
          <button
            onClick={stopRecording}
            className="p-3 text-red-600 bg-red-100 hover:bg-red-200 rounded-full animate-pulse transition-colors"
            title="توقف ضبط"
          >
            <StopCircle size={24} />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="p-3 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
            title="ضبط صدا"
          >
            <Mic size={24} />
          </button>
        )}

        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "در حال ضبط صدا..." : "پیام خود را بنویسید..."}
            className="w-full bg-transparent border-none focus:ring-0 resize-none p-3 max-h-32 min-h-[50px] outline-none"
            rows={1}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={isLoading || (!text && !image && !audioBlob)}
          className={`p-3 rounded-full transition-colors shadow-sm flex items-center justify-center
            ${isLoading || (!text && !image && !audioBlob)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="rtl:rotate-180" />}
        </button>
      </div>
    </div>
  );
};
