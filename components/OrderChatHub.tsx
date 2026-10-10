'use client';

import { useLocale } from 'next-intl';

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

/** Every label in the thread, plus the ready-made lines each side can start from. */
const COPY = {
  en: {
    title: 'Messages with the studio', status: 'Status', note: 'Order notes stay in your private portal',
    empty: 'No messages yet', emptyBody: 'Write to the studio about this artwork; the reply lands here.',
    studio: 'Studio', customer: 'Customer', quick: 'Quick reply',
    placeholderOperator: 'Write to the customer about the preview, the files or the schedule…',
    placeholderCustomer: 'Ask the studio something about your artwork…',
    send: 'Send', failed: 'The message could not be sent.',
    customerChips: [
      'Could the shapes be simplified a little more?',
      'Could the lettering be slightly bolder?',
      'Is the color separation right for screen printing?',
      'The preview looks great, thank you!',
    ],
    operatorChips: [
      'Your artwork has been reviewed; redrawing has started.',
      'A watermarked preview is ready for you.',
      'Your revision notes are applied and the draft is updated.',
      'Your master files are prepared and unlocked.',
    ],
  },
  de: {
    title: 'Nachrichten an das Studio', status: 'Status', note: 'Auftragsnotizen bleiben in Ihrem privaten Portal',
    empty: 'Noch keine Nachrichten', emptyBody: 'Schreiben Sie dem Studio zu dieser Zeichnung; die Antwort erscheint hier.',
    studio: 'Studio', customer: 'Kunde', quick: 'Schnellantwort',
    placeholderOperator: 'Schreiben Sie dem Kunden zur Vorschau, den Dateien oder dem Zeitplan…',
    placeholderCustomer: 'Stellen Sie dem Studio eine Frage zu Ihrer Zeichnung…',
    send: 'Senden', failed: 'Die Nachricht konnte nicht gesendet werden.',
    customerChips: [
      'Könnten die Formen etwas weiter vereinfacht werden?',
      'Könnte die Schrift etwas kräftiger sein?',
      'Passt die Farbtrennung zum Siebdruck?',
      'Die Vorschau sieht großartig aus, danke!',
    ],
    operatorChips: [
      'Ihre Grafik wurde geprüft; die Neuzeichnung hat begonnen.',
      'Eine Vorschau mit Wasserzeichen liegt für Sie bereit.',
      'Ihre Korrekturwünsche sind eingearbeitet, der Entwurf ist aktualisiert.',
      'Ihre Master-Dateien sind vorbereitet und freigeschaltet.',
    ],
  },
  tr: {
    title: 'Stüdyo ile mesajlar', status: 'Durum', note: 'Sipariş notları özel portalınızda kalır',
    empty: 'Henüz mesaj yok', emptyBody: 'Bu çizim hakkında stüdyoya yazın; yanıt burada görünür.',
    studio: 'Stüdyo', customer: 'Müşteri', quick: 'Hızlı yanıt',
    placeholderOperator: 'Müşteriye önizleme, dosyalar veya takvim hakkında yazın…',
    placeholderCustomer: 'Çiziminizle ilgili stüdyoya bir şey sorun…',
    send: 'Gönder', failed: 'Mesaj gönderilemedi.',
    customerChips: [
      'Şekiller biraz daha sadeleştirilebilir mi?',
      'Yazı biraz daha kalın olabilir mi?',
      'Renk ayrımı serigrafi baskıya uygun mu?',
      'Önizleme harika görünüyor, teşekkürler!',
    ],
    operatorChips: [
      'Görseliniz incelendi, yeniden çizim başladı.',
      'Filigranlı önizlemeniz hazır.',
      'Revizyon notlarınız uygulandı, taslak güncellendi.',
      'Master dosyalarınız hazırlandı ve açıldı.',
    ],
  },
} as const;

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
  const locale = useLocale();
  const copy = COPY[locale === 'tr' || locale === 'de' ? locale : 'en'];
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
      setErrorMessage(err instanceof Error ? err.message : copy.failed);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickChipClick = (chipText: string) => {
    setInputMessage(chipText);
  };

  const quickChips = currentUserType === 'operator' ? copy.operatorChips : copy.customerChips;

  return (
    <div className={`flex flex-col border border-ink bg-paper-2 overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-rule bg-paper px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ok-tint text-signal-ink">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold tracking-[-0.015em] text-ink">{copy.title}</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
              </span>
            </div>
            <p className="text-[10px] text-ink-3">
              {projectTitle}{orderStatus ? ` · ${copy.status}: ${orderStatus}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-3">
          <ShieldCheck className="h-3.5 w-3.5 text-signal-ink" />
          <span className="hidden sm:inline font-medium">{copy.note}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[380px] min-h-[220px] bg-paper-2"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-ink-3">
            <Sparkles className="h-8 w-8 text-paper-3 mb-2" />
            <p className="text-sm font-semibold text-ink">{copy.empty}</p>
            <p className="mt-1 max-w-sm text-[12px] leading-5 text-ink-3">{copy.emptyBody}</p>
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
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-ink-3">
                  {isOperator ? (
                    <span className="inline-flex items-center gap-1 font-bold text-signal-ink">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{msg.sender_name || 'Senior Vector Artist'}</span>
                      <span className="rounded-sm bg-signal-tint px-1 py-0.2 text-[9px] font-semibold text-signal-ink">{copy.studio}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <User className="h-3 w-3 text-ink-3" />
                      <span>{msg.sender_name || copy.customer}</span>
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
                        ? 'bg-ink text-white rounded-tr-xs'
                        : 'bg-ink text-white rounded-tr-xs'
                      : isOperator
                      ? 'bg-signal-tint border border-ok-line text-ink rounded-tl-xs'
                      : 'bg-paper border border-rule text-ink rounded-tl-xs'
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
      <div className="border-t border-rule/60 bg-paper px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{copy.quick}</span>
        {quickChips.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickChipClick(chip)}
            className="shrink-0 rounded-full border border-rule bg-paper-2 px-2.5 py-1 text-[11px] text-ink-3 hover:border-ink hover:text-ink transition-colors"
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
      <form onSubmit={handleSendMessage} className="border-t border-rule bg-paper-2 p-3 sm:p-4 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          maxLength={INPUT_LIMITS.message}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            currentUserType === 'operator'
              ? copy.placeholderOperator
              : copy.placeholderCustomer
          }
          className="flex-1 border border-rule-strong bg-paper px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-3 focus:border-ink focus:bg-paper-2 focus:outline-hidden transition-all"
        />

        <button
          type="submit"
          disabled={isSending || !inputMessage.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-signal hover:text-ink disabled:opacity-40"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{copy.send}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
