import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, FileUp, MessageSquare, Loader2, User, Bot, Trash2 } from 'lucide-react';
import api from '../api/axios';
import type { Chat as ChatType, ChatMessage, PdfFile } from '../types';

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
    fetchFiles();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chat/my-chats');
      setChats(res.data);
      if (res.data.length > 0 && !activeChat) {
        setActiveChat(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch chats', err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get('/pdf/my-files');
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const res = await api.get(`/chat/history/${chatId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const createNewChat = async () => {
    const title = prompt('Enter chat title:') || 'New Chat';
    try {
      const res = await api.post('/chat/new', title, {
        headers: { 'Content-Type': 'application/json' }
      });
      setChats([res.data, ...chats]);
      setActiveChat(res.data);
    } catch (err) {
      console.error('Failed to create chat', err);
    }
  };

  const deleteChat = async (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    console.log('Attempting to delete chat:', chatId);
    try {
      const res = await api.delete(`/chat/${chatId}`);
      console.log('Delete response:', res.data);
      
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
      alert('Chat deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete chat:', err);
      alert(`Failed to delete chat: ${err.response?.data || err.message}`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      content: input,
      role: 'user',
      sentAt: new Date().toISOString()
    };

    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/ask', {
        chatId: activeChat.id,
        question: input
      });
      
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        content: res.data.answer,
        role: 'assistant',
        sentAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.post('/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles();
      alert('PDFs processed successfully!');
    } catch (err) {
      console.error('Upload error', err);
      alert('Failed to upload PDFs');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen pt-20 overflow-hidden bg-bg-dark">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 flex flex-col glass-card">
        <div className="p-4 border-b border-white/5 space-y-4">
          <button 
            onClick={createNewChat}
            className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
          >
            <Plus size={18} /> New Chat
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              multiple 
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden" 
              id="pdf-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="pdf-upload"
              className={`w-full py-3 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'} border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-sm transition-all`}
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
              {uploading ? 'Processing...' : 'Upload PDFs'}
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[10px] uppercase tracking-widest opacity-40 px-3 py-2">Your Conversations</p>
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`group w-full p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${activeChat?.id === chat.id ? 'bg-primary/20 border border-primary/20 text-white' : 'hover:bg-white/5 text-white/60'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <MessageSquare size={16} />
                <span className="truncate text-sm font-medium">{chat.title}</span>
              </div>
              <button
                onClick={(e) => deleteChat(e, chat.id)}
                className="opacity-30 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3 px-1">Processed Documents</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-2 text-[11px] opacity-60 bg-white/5 p-2 rounded-lg truncate">
                <FileUp size={12} />
                <span className="truncate">{file.fileName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Bot size={64} strokeWidth={1} />
              <div>
                <h3 className="text-xl font-medium">Hello! I'm your PDF Assistant</h3>
                <p className="text-sm">Ask me anything about your uploaded documents.</p>
              </div>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/10'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'glass-card border border-white/5 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5 bg-bg-dark/50 backdrop-blur-xl">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative group"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeChat ? "Type your message here..." : "Select a chat to start..."}
              disabled={!activeChat || loading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-primary focus:bg-white/10 transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={!activeChat || !input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary hover:bg-primary/80 disabled:opacity-30 disabled:hover:bg-primary rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[10px] text-center mt-4 opacity-40">AI assistant may provide inaccurate info. Verify your sources.</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
