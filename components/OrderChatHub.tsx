'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrderMessage, OrderStatus } from '@/lib/types';
import { addOrderMessage, fetchOrderMessages } from '@/lib/services/orders';
import { createClient } from '@/lib/supabase/client';
import { INPUT_LIMITS } from '@/lib/security';
import {
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface OrderChatHubProps {
  orderId: string;
  initialMessages?: OrderMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'customer' | 'operator';
  projectTitle?: string;
  orderStatus?: OrderStatus;
  className?: string;
}

const CUSTOMER_QUICK_CHIPS = [
  'Düğüm noktalarını biraz daha sadeleştirebilir miyiz?',
  'Yazı fontunu biraz kalınlaştırabilir misiniz?',
  'Renk ayrımı serigrafi baskıya uygun mu?',
  'Önizleme harika görünüyor, teşekkürler!',
];

const OPERATOR_QUICK_CHIPS = [
  'Görseliniz incelendi, manuel çizim aşamasına geçildi.',
  'Su damgalı taslak önizlemeniz hazırlandı.',
  'Revizyon notlarınız uygulandı, taslak güncellendi.',
  'Master üretim dosyalarınız hazırlandı ve kilit açıldı.',
];

export default function OrderChatHub({
  orderId,
  initialMessages = [],
  currentUserId,
  currentUserName,
  currentUserType,
  projectTitle = 'Order',
  orderStatus,
  className = '',
}: OrderChatHubProps) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Polling & Realtime subscription
  useEffect(() => {
    let isSubscribed = true;

    async function loadLatestMessages() {
      try {
        const latest = await fetchOrderMessages(orderId);
        if (isSubscribed && latest && latest.length > 0) {
          setMessages(latest);
        }
      } catch {
        // silent polling catch
      }
    }

    // 5-second polling interval
    const interval = setInterval(loadLatestMessages, 5000);

    // Optional Supabase Realtime channel
    const supabase = createClient();
    let realtimeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    if (supabase) {
      try {
        realtimeChannel = supabase
          .channel(`order-chat-${orderId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'order_messages',
              filter: `order_id=eq.${orderId}`,
            },
            (payload) => {
              const newMsg = payload.new as OrderMessage;
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => scrollToBottom(), 100);
            }
          )
          .subscribe();
      } catch {
        // Fallback to polling
      }
    }

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [orderId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setErrorMessage(null);
    setIsSending(true);

    try {
      const created = await addOrderMessage(
        orderId,
        currentUserId,
        currentUserName,
        currentUserType,
        text
      );

      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });

      setInputMessage('');
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickChipClick = (chipText: string) => {
    setInputMessage(chipText);
  };

  const quickChips = currentUserType === 'operator' ? OPERATOR_QUICK_CHIPS : CUSTOMER_QUICK_CHIPS;

  return (
    <div className={`flex flex-col rounded-2xl border border-[#EAE8E3] bg-white shadow-xs overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#F9F8F6] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-[#18794E]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#141414]">
                Stüdyo &amp; Sanatçı İletişim Hattı
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
            </div>
            <p className="text-[10px] text-[#737373]">
              {projectTitle} {orderStatus ? `· Durum: ${orderStatus}` : ''} · İki yönlü canlı mesajlaşma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#737373]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#18794E]" />
          <span className="hidden sm:inline font-medium">Uçtan Uca Şifreli Sipariş Notları</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[380px] min-h-[220px] bg-white"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#737373]">
            <Sparkles className="h-8 w-8 text-[#CCC] mb-2" />
            <p className="text-xs font-semibold text-[#141414]">Henüz mesajlaşma başlatılmadı</p>
            <p className="text-[11px] text-[#737373] mt-0.5 max-w-sm">
              Çizim toleransları, detay seviyesi veya teslimat süreciyle ilgili sanatçınıza buradan anında not iletebilirsiniz.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId || (currentUserType === 'customer' && msg.sender_type === 'customer') || (currentUserType === 'operator' && msg.sender_type === 'operator');
            const isOperator = msg.sender_type === 'operator';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender badge & time */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#737373]">
                  {isOperator ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[#18794E]">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{msg.sender_name || 'Senior Vector Artist'}</span>
                      <span className="rounded-sm bg-[#E9F9EE] px-1 py-0.2 text-[9px] font-semibold text-[#18794E]">Stüdyo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#141414]">
                      <User className="h-3 w-3 text-[#737373]" />
                      <span>{msg.sender_name || 'Müşteri'}</span>
                    </span>
                  )}
                  <span>·</span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-2xs ${
                    isMe
                      ? isOperator
                        ? 'bg-[#18794E] text-white rounded-tr-xs'
                        : 'bg-[#141414] text-white rounded-tr-xs'
                      : isOperator
                      ? 'bg-[#E9F9EE] border border-emerald-200 text-[#141414] rounded-tl-xs'
                      : 'bg-[#F9F8F6] border border-[#EAE8E3] text-[#141414] rounded-tl-xs'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="border-t border-[#EAE8E3]/60 bg-[#F9F8F6] px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-[#737373] uppercase shrink-0">Hızlı Yanıt:</span>
        {quickChips.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickChipClick(chip)}
            className="shrink-0 rounded-full border border-[#EAE8E3] bg-white px-2.5 py-1 text-[11px] text-[#737373] hover:border-[#18794E] hover:text-[#141414] transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-[#EAE8E3] bg-white p-3 sm:p-4 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          maxLength={INPUT_LIMITS.message}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            currentUserType === 'operator'
              ? 'Müşteriye teknik detay, önizleme durumu veya not yazın...'
              : 'Sanatçıya talimat veya çizim hakkında bir mesaj yazın...'
          }
          className="flex-1 rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-2.5 text-xs sm:text-sm text-[#141414] placeholder:text-[#999] focus:border-[#18794E] focus:bg-white focus:outline-hidden transition-all"
        />

        <button
          type="submit"
          disabled={isSending || !inputMessage.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#18794E] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#115C3B] disabled:opacity-40 transition-colors shadow-xs"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gönder</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
