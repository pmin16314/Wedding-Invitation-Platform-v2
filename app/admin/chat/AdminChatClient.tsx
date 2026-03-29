"use client";
import { useState, useEffect, useRef } from "react";

interface Wedding { id:string;slug:string;name:string;lastMessage:string|null;lastMessageAt:string|null;unreadCount:number;status:string;package:string; }
interface Message  { id:string;senderRole:string;senderName:string;content:string;isRead:boolean;createdAt:string; }

export default function AdminChatClient({ weddings: initial, initialWeddingId }: { weddings: Wedding[]; initialWeddingId?: string }) {
  const [weddings,  setWeddings]  = useState(initial);
  const [selected,  setSelected]  = useState<string | null>(initialWeddingId ?? initial[0]?.id ?? null);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [search,    setSearch]    = useState("");
  const [sending,   setSending]   = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const esRef      = useRef<EventSource | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selected) return;
    fetch(`/api/chat/messages?weddingId=${selected}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setMessages(j.data.messages); });
    setWeddings(ws => ws.map(w => w.id === selected ? { ...w, unreadCount: 0 } : w));
  }, [selected]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SSE real-time connection — reconnects when selected changes
  useEffect(() => {
    if (!selected) return;
    // Close previous connection
    esRef.current?.close();

    const es = new EventSource(`/api/chat/sse?weddingId=${selected}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === "message") {
        setMessages(ms => {
          // Avoid duplicates (our own sent message is already added optimistically)
          if (ms.some(m => m.id === d.message.id)) return ms;
          return [...ms, d.message];
        });
      }
    };

    es.onerror = () => {
      // Browser will auto-reconnect SSE — no action needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [selected]);

  async function send() {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const content = input.trim();
    setInput(""); // clear immediately for UX
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId: selected, content }),
    });
    const j = await res.json();
    setSending(false);
    if (j.ok) {
      // Reset textarea height
      if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
      // Add optimistically — SSE deduplication above handles if SSE also delivers it
      setMessages(ms => ms.some(m => m.id === j.data.message.id) ? ms : [...ms, j.data.message]);
      // Update sidebar preview
      setWeddings(ws => ws.map(w => w.id === selected
        ? { ...w, lastMessage: content, lastMessageAt: j.data.message.createdAt }
        : w
      ));
    } else {
      setInput(content); // restore on failure
    }
  }

  const filtered        = weddings.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  const selectedWedding = weddings.find(w => w.id === selected);

  return (
    <div className="a-chat-layout">
      {/* ── Conversation list ── */}
      <div className="a-chat-list">
        <div className="a-chat-list-header">
          <input
            className="a-chat-list-search"
            placeholder="Search weddings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="a-chat-list-items">
        {filtered.map(w => (
          <div
            key={w.id}
            className={`a-chat-item${selected === w.id ? " active" : ""}`}
            onClick={() => setSelected(w.id)}
          >
            <div className="a-chat-item-avatar">{w.name.charAt(0)}</div>
            <div className="a-chat-item-body">
              <div className="a-chat-item-top">
                <span className="a-chat-item-name">{w.name}</span>
                {w.lastMessageAt && (
                  <span className="a-chat-item-time">
                    {new Date(w.lastMessageAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
              <div className="a-chat-item-bottom">
                <span className="a-chat-item-preview">{w.lastMessage ?? "No messages yet"}</span>
                {w.unreadCount > 0 && <span className="a-chat-unread">{w.unreadCount}</span>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="a-empty a-chat-empty">
            <div className="a-empty-text">No weddings found</div>
          </div>
        )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      {selected && selectedWedding ? (
        <div className="a-chat-panel">
          {/* Header */}
          <div className="a-chat-panel-header">
            <div className="a-chat-item-avatar">{selectedWedding.name.charAt(0)}</div>
            <div>
              <div className="a-chat-panel-name">{selectedWedding.name}</div>
              <div className="a-chat-panel-meta">
                <span className={`a-badge a-badge-${selectedWedding.status.toLowerCase()}`}>
                  {selectedWedding.status}
                </span>
                <span className={`a-badge a-badge-${selectedWedding.package.toLowerCase()}`}>
                  {selectedWedding.package}
                </span>
              </div>
            </div>
            <a href={`/admin/weddings/${selected}`} className="a-btn a-btn-sm a-btn-outline a-chat-panel-action">
              Edit ↗
            </a>
          </div>

          {/* Messages */}
          <div className="a-chat-messages">
            {messages.map(m => {
              const isAdmin  = m.senderRole === "ADMIN";
              const isSystem = m.senderRole === "SYSTEM";
              return (
                <div key={m.id} className={`a-chat-msg-row ${isSystem?"system":isAdmin?"admin":"couple"}`}>
                  <div
                    className={`a-chat-bubble${isSystem ? " system" : ""}`}
                    style={isSystem ? {} : isAdmin ? {
                      background: "var(--charcoal)",
                      color: "white",
                      borderBottomRightRadius: 4,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    } : {
                      background: "var(--ivory-deep)",
                      color: "var(--charcoal)",
                      border: "1px solid var(--ivory-border)",
                      borderBottomLeftRadius: 4,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.content}
                  </div>
                  <div className="a-chat-time">
                    {m.senderName} · {new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="a-chat-input-row">
            <textarea
              ref={textareaRef}
              className="a-chat-input"
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Auto-grow
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
            />
            <button className="a-btn a-btn-primary" style={{ height: '44px' }} onClick={send} disabled={sending || !input.trim()}>
              {sending ? <span className="a-spinner" /> : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <div className="a-chat-no-select">
          <div className="a-empty">
            <div className="a-empty-icon">💬</div>
            <div className="a-empty-title">Select a conversation</div>
            <div className="a-empty-text">Choose a wedding from the list to start chatting.</div>
          </div>
        </div>
      )}
    </div>
  );
}
