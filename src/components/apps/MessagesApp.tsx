'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Search,
  CheckCheck,
  User,
  Sparkles,
  Smile,
  Paperclip,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'chris';
  text: string;
  time: string;
}

interface ChatThread {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  unread: boolean;
  messages: ChatMessage[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'chris',
    name: 'Chris Gu',
    role: 'Lead Frontend & Design Engineer',
    avatarText: 'CG',
    avatarBg: 'bg-gradient-to-tr from-blue-500 to-indigo-600',
    unread: false,
    messages: [
      {
        id: 'c1',
        sender: 'chris',
        text: 'Hey there! Welcome to my macOS Web OS playground. 👋',
        time: '10:30 AM',
      },
      {
        id: 'c2',
        sender: 'chris',
        text: 'Feel free to leave a direct inquiry, discuss open roles, or say hi! Fill in your details below and hit send.',
        time: '10:31 AM',
      },
    ],
  },
  {
    id: 'recruiter',
    name: 'Recruiter / Talent Partner',
    role: 'Hiring Team',
    avatarText: 'RP',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    unread: false,
    messages: [
      {
        id: 'r1',
        sender: 'chris',
        text: 'Hi Chris! Are you open to Lead Frontend / Staff Design Engineer roles for 2026?',
        time: 'Yesterday',
      },
      {
        id: 'r2',
        sender: 'user',
        text: 'Yes! Particularly excited about spatial interfaces, design systems, and high-performance WebGL/React platforms.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'Design Lead',
    avatarText: 'SJ',
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-pink-600',
    unread: false,
    messages: [
      {
        id: 's1',
        sender: 'chris',
        text: 'Hey! Loved the tactile desktop release 🔥 The physics & stickers feel super organic.',
        time: 'Tuesday',
      },
      {
        id: 's2',
        sender: 'user',
        text: 'Thanks Sarah! Tuning the spring damping curves on the dock was a ton of fun.',
        time: 'Tuesday',
      },
      {
        id: 's3',
        sender: 'chris',
        text: 'Can we collaborate on the next spatial canvas?',
        time: 'Tuesday',
      },
    ],
  },
];

export const MessagesApp: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('chris');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!messageText.trim()) {
      return;
    }

    if (activeThread.id === 'chris') {
      if (!name.trim()) {
        setFormError('Please enter your name.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setFormError('Please provide a valid email address.');
        return;
      }
    }

    const currentText = messageText.trim();
    const senderName = name.trim() || 'Visitor';
    const senderEmail = email.trim();

    // Optimistically append sent bubble
    const userMsgId = 'msg-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: currentText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, messages: [...t.messages, newMsg] }
          : t
      )
    );
    setMessageText('');
    setIsSubmitting(true);

    try {
      if (activeThread.id === 'chris') {
        // Send to real contact API route
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: senderName,
            email: senderEmail,
            message: currentText,
          }),
        });

        // Show typing indicator
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          const autoReply: ChatMessage = {
            id: 'reply-' + Date.now(),
            sender: 'chris',
            text: `Thanks for reaching out, ${senderName}! I've received your note and will get back to you shortly at ${senderEmail}. Feel free to test the other apps! 🦆`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setThreads((prev) =>
            prev.map((t) =>
              t.id === 'chris'
                ? { ...t, messages: [...t.messages, autoReply] }
                : t
            )
          );
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Left Sidebar: Conversations */}
      <div className="w-60 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* Search Header */}
          <div className="p-3 border-b border-black/5 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-7 pl-8 pr-3 text-xs rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="p-2 flex flex-col gap-1">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThread.id;
              const lastMessage = thread.messages[thread.messages.length - 1];

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-200'
                  }`}
                >
                  {/* Contact Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white ${thread.avatarBg}`}
                  >
                    {thread.avatarText}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold text-xs truncate ${
                          isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {thread.name}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-white/80' : 'text-slate-400 dark:text-neutral-500'
                        }`}
                      >
                        {lastMessage ? lastMessage.time : ''}
                      </span>
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                      }`}
                    >
                      {lastMessage ? lastMessage.text : thread.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer status */}
        <div className="p-3 border-t border-black/5 dark:border-white/5 text-[11px] text-center text-slate-400 dark:text-neutral-500 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>iMessage Connected</span>
        </div>
      </div>

      {/* 2. Right Pane: Chat Window & Input */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40">
        {/* Chat Header */}
        <div className="h-12 px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${activeThread.avatarBg}`}
            >
              {activeThread.avatarText}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeThread.name}</span>
                {activeThread.id === 'chris' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-normal">
                    Available
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                {activeThread.role}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 custom-scrollbar">
          {activeThread.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#007AFF] text-white rounded-br-sm shadow-xs'
                      : 'bg-neutral-200/80 dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 rounded-bl-sm border border-black/5 dark:border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 rounded-bl-sm w-fit border border-black/5 dark:border-white/5">
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-neutral-400 rounded-full animate-bounce" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mx-4 mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Contact Input / Message Composer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-black/5 dark:border-white/5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col gap-2 shrink-0"
        >
          {/* Visitor Name & Email Row (when contacting Chris) */}
          {activeThread.id === 'chris' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Your Name (e.g. Alex Smith)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-7 px-3 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-xs"
              />
              <input
                type="email"
                placeholder="Your Email (e.g. alex@company.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-7 px-3 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-xs"
              />
            </div>
          )}

          {/* Message input & Send Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  activeThread.id === 'chris'
                    ? 'Write your message or inquiry...'
                    : `Message ${activeThread.name}...`
                }
                className="w-full h-8.5 pl-3 pr-8 rounded-full bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !messageText.trim()}
              className="w-8.5 h-8.5 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-40 disabled:hover:bg-[#007AFF] text-white flex items-center justify-center transition-all shadow-sm shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
