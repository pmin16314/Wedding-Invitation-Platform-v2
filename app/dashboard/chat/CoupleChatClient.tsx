"use client";
import { useState, useEffect, useRef } from "react";

interface Message { id:string;senderRole:string;senderName:string;content:string;isRead:boolean;createdAt:string; }

export default function CoupleChatClient({ messages: init, weddingId }: { messages: Message[]; weddingId: string; primaryColor: string }) {
  const [messages, setMessages] = useState(init);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const esRef      = useRef<EventSource | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    esRef.current?.close();

    const es = new EventSource(`/api/chat/sse?weddingId=${weddingId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === "message") {
        setMessages(ms => {
          if (ms.some(m => m.id === d.message.id)) return ms;
          return [...ms, d.message];
        });
      }
    };

    return () => { es.close(); esRef.current = null; };
  }, [weddingId]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId, content }),
    });
    const j = await res.json();
    setSending(false);
    if (j.ok) {
      if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
      setMessages(ms => ms.some(m => m.id === j.data.message.id) ? ms : [...ms, j.data.message]);
    } else {
      setInput(content);
    }
  }

  return (
    <div className="db-chat-wrap">
      {/* Header */}
      <div className="db-chat-header">
        <div className="db-chat-avatar">V</div>
        <div>
          <div className="db-chat-support-name">Vowly Support</div>
          <div className="db-chat-support-sub">We typically reply within a few hours</div>
        </div>
        <div className="db-chat-status">
          <div className="db-chat-status-dot" />
          <span className="db-chat-status-lbl">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="db-chat-messages">
        {messages.map(m => {
          const isCouple = m.senderRole === "COUPLE";
          const isSystem = m.senderRole === "SYSTEM";
          return (
            <div key={m.id} className={`db-chat-msg-row ${isSystem?"system":isCouple?"mine":"theirs"}`}>
              <div
                className={`db-chat-bubble${isSystem ? " system" : ""}`}
                style={isSystem ? {} : isCouple ? {
                  background: "var(--charcoal)",
                  color: "white",
                  borderBottomRightRadius: 4,
                } : {
                  background: "var(--ivory-deep)",
                  color: "var(--charcoal)",
                  border: "1px solid var(--ivory-border)",
                  borderBottomLeftRadius: 4,
                }}
              >
                {m.content}
              </div>
              <div className="db-chat-time">
                {m.senderName} · {new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="db-chat-input-row">
        <textarea
          className="db-chat-input"
          placeholder="Type a message… (Enter to send)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
        />
        <button className="db-btn db-btn-primary" onClick={send} disabled={sending || !input.trim()}>
          {sending ? <span className="db-spinner" /> : "Send"}
        </button>
      </div>
    </div>
  );
}
