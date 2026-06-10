/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Eye, Brain, HelpCircle, Loader, MessageSquare, Clipboard, AlertCircle } from 'lucide-react';
import { ERPDatabase } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  erpData: ERPDatabase;
}

export function AIAssistant({ erpData }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `👋 Greetings! I am **Astra**, your AI ERP Systems Strategist.\n\nI can analyze your current ledger, cross-reference inventory limits, compile sales funnel statistics, or craft professional customer emails on demand.\n\nTry one of the quick commands below!`
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || inputMsg;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    
    if (!customMessage) setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10), // Send last 10 messages for conversation thread
          erpData
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status.');
      }

      const data = await response.json();
      const botMessage: Message = {
        role: 'model',
        text: data.text || 'Sorry, I returned empty results.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError('Connection failure or Gemini key not defined. Operating with simulation.');
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ **API Key Simulation mode:** I cannot connect securely to the database. However, looking in local storage, you can address this issue by adding a **GEMINI_API_KEY** under the Settings tab or in AI Studio Secrets panel.\n\n*Quick diagnostic for **${erpData.profile.name}**:* \n- **Financial Health**: Ledger has **${erpData.ledger.length} transactions** totals.\n- **Low Stock warning**: **${erpData.inventory.filter(i => i.stock <= i.reorderLevel).length}** critical warehouse warnings active.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: `Reset code completed. Astra has cleared context. Send me a message to begin analytics for **${erpData.profile.name}**.`
      }
    ]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Quick Action Prompts
  const suggestionPrompts = [
    { label: "📊 Diagnostic Audit", prompt: "Conduct a financial and operational diagnostics audit of my current company ledger and operations. State P&L, areas of warnings and high costs." },
    { label: "📦 Inventory Check", prompt: "Provide detailed advice on our current inventory. Which items are running low, what quantities should we buy based on suppliers, and are we overstocked on anything?" },
    { label: "✉️ Collection Email", prompt: "Write a polite yet firm overdue payment collection email for customers with outstanding dues." },
    { label: "💵 Sales Forecast", prompt: "Review my current sales opportunities in the visual funnel. What is our weighted pipeline value, and what strategic advice can you provide to close pending deals?" }
  ];

  return (
    <div id="ai-assistant-root" className="flex flex-col h-full bg-slate-900 text-slate-100 border-l border-slate-800 md:w-96 w-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400 stroke-[2]" />
          <div>
            <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              Astra AI Consultant
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="font-mono text-[10px] text-slate-400">GEMINI ADVANCED ERP ADVISOR</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-slate-400 hover:text-indigo-300 font-mono text-[11px] px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition"
        >
          RESET
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="font-mono text-[10px] text-slate-500 mb-1 px-1">
              {m.role === 'user' ? 'Client Workspace' : 'Astra Advisor'}
            </span>
            <div className={`p-3 rounded-lg max-w-[90%] break-words shadow-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-800/90 text-slate-100 border border-slate-750 rounded-bl-none'
            }`}>
              {/* Parse headers/bullets inside messages logically */}
              <div className="space-y-2 whitespace-pre-wrap">
                {m.text}
              </div>

              {m.role === 'model' && m.text.includes('Subject:') && (
                <button
                  onClick={() => copyToClipboard(m.text)}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 hover:text-white px-2 py-1 bg-indigo-950/50 rounded hover:bg-indigo-900 border border-indigo-800/50 transition cursor-pointer"
                >
                  <Clipboard className="w-3 h-3" /> Copy Email Draft
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-indigo-400 p-2 text-xs font-mono">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Consulting enterprise ledger and models...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-md text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Quick Suggestions Shelf */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800/50">
        <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">QUICK DIAGNOSTIC CONSOLE</p>
        <div className="grid grid-cols-2 gap-1.5">
          {suggestionPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(p.prompt)}
              className="text-left text-[11px] p-2 rounded bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-900/50 transition truncate text-slate-300 disabled:opacity-50 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command input footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          placeholder="Ask Astra for structural advices..."
          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 outline-none transition disabled:opacity-50 font-sans"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputMsg.trim()}
          className="p-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 disabled:hover:bg-indigo-600 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
