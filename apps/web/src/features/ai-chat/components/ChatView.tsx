'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { useAiChat } from '@/lib/hooks/use-ai-chat'
import { cn } from '@/lib/utils'

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="mb-2 mt-5 text-xl font-bold text-foreground first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5 text-[17px] font-bold text-foreground first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-4 text-[15px] font-bold text-foreground first:mt-0">{children}</h3>,
  p:  ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a:  ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-[hsl(var(--primary))] underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 tabular-nums text-[13px] text-foreground">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-[hsl(var(--muted))] p-3 tabular-nums text-[13px] leading-relaxed text-foreground last:mb-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-[hsl(var(--primary)/0.4)] pl-3 text-foreground-soft last:mb-0">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-[hsl(var(--border))] px-3 py-1.5 text-left font-semibold text-foreground">{children}</th>,
  td: ({ children }) => <td className="border-b border-[hsl(var(--border))] px-3 py-1.5 text-foreground-soft">{children}</td>,
  hr: () => <hr className="my-4 border-[hsl(var(--border))]" />,
}

const SUGGESTIONS = [
  'Comment calculer mon risk/reward idéal ?',
  "Qu'est-ce que le revenge trading et comment l'éviter ?",
  'Explique-moi le profit factor simplement.',
  'Quelles règles de gestion du risque pour débuter ?',
]

export function ChatView() {
  const { messages, send, stop, isStreaming, error } = useAiChat()
  const [draft, setDraft]   = useState('')
  const scrollRef           = useRef<HTMLDivElement>(null)
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submit(text: string) {
    if (!text.trim() || isStreaming) return
    setDraft('')
    void send(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(draft)
    }
  }

  function autoGrow() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[46rem] flex-col px-4 sm:px-6">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.12)]">
                <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <h1 className="font-primary text-4xl leading-tight text-foreground sm:text-[2.75rem]">
                Comment puis-je vous aider aujourd&apos;hui&nbsp;?
              </h1>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-xl border border-[hsl(var(--border))] bg-card px-4 py-3 text-left text-sm text-foreground-soft transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-8">
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} content={m.content} streaming={isStreaming && m.id === messages[messages.length - 1]?.id && m.role === 'assistant'} />
              ))}
              {error && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[hsl(var(--border))] bg-background/95 px-4 pb-4 pt-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto w-full max-w-[46rem]">
          <div className="flex items-end gap-2 rounded-2xl border border-[hsl(var(--border))] bg-card px-3 py-2 shadow-sm focus-within:border-[hsl(var(--primary)/0.5)]">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); autoGrow() }}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Écris ton message à MERKURE IA..."
              className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-soft/60 focus:outline-none"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Arrêter la génération"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit(draft)}
                disabled={!draft.trim()}
                aria-label="Envoyer le message"
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                  draft.trim()
                    ? 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(243_90%_58%)]'
                    : 'bg-[hsl(var(--muted))] text-foreground-soft/50',
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-foreground-soft/70">
            MERKURE IA peut se tromper. Vérifie les informations importantes.
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ role, content, streaming }: { role: 'user' | 'assistant'; content: string; streaming: boolean }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {content}
        </ReactMarkdown>
        {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground-soft align-middle" />}
      </div>
    </div>
  )
}
