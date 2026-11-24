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
  Mail,
  ExternalLink,
} from 'lucide-react';
import { playMessageSentSound } from '@/utils/soundEffects';

interface ChatMessage {
  id: string;
  sender: 'user' | 'huseyin';
  text: string;
  time: string;
  status?: 'sending' | 'delivered';
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
    id: 'huseyin',
    name: 'Hüseyin Korumtaş',
    role: 'Creative Producer & Audio Lead',
    avatarText: 'HK',
    avatarBg: 'bg-gradient-to-tr from-blue-500 to-indigo-600',
    unread: false,
    messages: [
      {
        id: 'h1',
        sender: 'huseyin',
        text: 'Hey there! Welcome to my creative workspace. 👋',
        time: '10:30',
      },
      {
        id: 'h2',
        sender: 'huseyin',
        text: 'Feel free to leave a direct message for music production, commercial jingles, or creative collaborations. Messages are sent straight to my inbox at korumtashuseyin@gmail.com.',
        time: '10:31',
      },
    ],
  },
  {
    id: 'collaboration',
    name: 'Projects & Collaborations',
    role: 'Commercial & Audio Inquiries',
    avatarText: 'HK',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    unread: false,
    messages: [
      {
        id: 'r1',
        sender: 'huseyin',
        text: 'Hello! Looking to produce an advertising jingle, club release, or bespoke sound identity?',
        time: 'Yesterday',
      },
      {
        id: 'r2',
        sender: 'user',
        text: 'Yes! Loved your audiovisual rhythm and sound design work and would like to discuss an upcoming campaign.',
        time: 'Yesterday',
        status: 'delivered',
      },
    ],
  },
];

export const MessagesApp: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('huseyin');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'threads' | 'chat'>('chat');

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

    if (activeThread.id === 'huseyin') {
      if (!name.trim()) {
        setFormError('Please enter your name.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setFormError('Please provide a valid email address (e.g. name@domain.com).');
        return;
      }
    }

    const currentText = messageText.trim();
    const senderName = name.trim() || 'Visitor';
    const senderEmail = email.trim();

    // Optimistically append sent bubble
    playMessageSentSound();
    const userMsgId = 'msg-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: currentText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
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
      if (activeThread.id === 'huseyin') {
        // Send to real contact API route which forwards to korumtashuseyin@gmail.com
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
            sender: 'huseyin',
            text: `Thanks for reaching out, ${senderName}! I've received your note and will get back to you shortly at ${senderEmail}. Best regards! 👋 — Hüseyin Korumtaş`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setThreads((prev) =>
            prev.map((t) =>
              t.id === 'huseyin'
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
      <div
        className={`${
          mobileView === 'chat' ? 'hidden' : 'flex'
        } md:flex w-full md:w-60 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 flex-col justify-between backdrop-blur-md`}
      >
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
                className="w-full h-8 pl-8 pr-3 text-base sm:text-xs rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50"
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
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setMobileView('chat');
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-200'
                  }`}
                >
                  {/* Contact Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white shadow-xs ${thread.avatarBg}`}
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
      <div
        className={`${
          mobileView === 'threads' ? 'hidden' : 'flex'
        } md:flex flex-1 flex-col h-full overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/40`}
      >
        {/* Chat Header */}
        <div className="h-12 px-3 sm:px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileView('threads')}
              className="flex md:hidden items-center gap-1 text-[#007AFF] hover:underline font-semibold text-xs mr-1 cursor-pointer"
            >
              <span>‹ Chats</span>
            </button>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${activeThread.avatarBg}`}
            >
              {activeThread.avatarText}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeThread.name}</span>
                {activeThread.id === 'huseyin' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-normal">
                    Available for Projects
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                {activeThread.role} · korumtashuseyin@gmail.com
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
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-neutral-500 mt-1 px-1">
                  <span>{msg.time}</span>
                  {isUser && (
                    <>
                      <span>•</span>
                      <span className="text-[#007AFF] font-medium flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3" />
                        <span>Delivered</span>
                      </span>
                    </>
                  )}
                </div>
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
          {/* Visitor Name & Email Row (when contacting Hüseyin) */}
          {activeThread.id === 'huseyin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Your Name (e.g. Alex Smith)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 px-3 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-base sm:text-xs"
              />
              <input
                type="email"
                placeholder="Your Email (e.g. alex@company.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 px-3 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-base sm:text-xs"
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
                  activeThread.id === 'huseyin'
                    ? 'Write your message or project inquiry...'
                    : `Message ${activeThread.name}...`
                }
                className="w-full h-9 pl-3.5 pr-8 rounded-full bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 text-base sm:text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !messageText.trim()}
              className="w-8.5 h-8.5 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-40 disabled:hover:bg-[#007AFF] text-white flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
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
