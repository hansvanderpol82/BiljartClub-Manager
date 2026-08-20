import React, { useState } from 'react';
import { User, BoardMessage } from '../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { MessageSquare, Paperclip, CheckCircle2, Archive, Trash2, Send, Download, UserCircle, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  key?: string;
  message: BoardMessage;
  currentUser: User;
  users: User[];
  onAction: (msgId: string, action: "read" | "keep" | "archive" | "delete", value?: boolean) => void;
  onReply: (msgId: string, content: string) => void;
  showKeepOnHomeOption?: boolean;
}

export function BoardMessageCard({ message, currentUser, users, onAction, onReply, showKeepOnHomeOption = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const author = users.find(u => u.id === message.authorId);
  const isRead = message.readBy?.includes(currentUser.id);
  const isKept = message.keptOnHomeBy?.includes(currentUser.id);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(message.id, replyText);
    setReplyText("");
  };

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden transition-colors", isRead ? "border-slate-200 dark:border-slate-800" : "border-emerald-200 dark:border-emerald-800")}>
      <div 
        className={cn("p-4 md:p-6 cursor-pointer flex gap-4", !isRead && "bg-emerald-50/50 dark:bg-emerald-900/10")}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="hidden sm:flex shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center text-slate-400">
          <MessageSquare size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={cn("text-lg font-bold truncate", isRead ? "text-slate-800 dark:text-white" : "text-emerald-800 dark:text-emerald-400")}>
                {message.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Van: {author?.name || 'Onbekend'} • {format(new Date(message.createdAt), "d MMM yyyy, HH:mm", { locale: nl })}
              </p>
            </div>
            {message.attachment && (
              <div className="shrink-0 text-slate-400" title="Bevat bijlage">
                <Paperclip size={20} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-4 md:p-6 space-y-6">
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {message.content}
              </div>

              {message.attachment && (
                <a 
                  href={message.attachment.dataUrl} 
                  download={message.attachment.name}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.dataUrl} alt={message.attachment.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Paperclip size={24} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{message.attachment.name}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      <Download size={14} /> Downloaden
                    </span>
                  </div>
                </a>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {!isRead && (
                  <button 
                    onClick={() => onAction(message.id, "read")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <CheckCircle2 size={16} /> Markeer als gelezen
                  </button>
                )}
                {(showKeepOnHomeOption || isKept) && (
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isKept}
                      onChange={(e) => onAction(message.id, "keep", e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Pin size={16} /> Op Home pagina houden
                  </label>
                )}
                <div className="flex-1" />
                <button 
                  onClick={() => onAction(message.id, "archive")}
                  className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  title="Archiveren"
                >
                  <Archive size={18} />
                </button>
                <button 
                  onClick={() => onAction(message.id, "delete")}
                  className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Replies */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 md:p-6 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} /> Reacties ({message.replies?.length || 0})
                </h4>
                
                <div className="space-y-4">
                  {message.replies?.map(reply => {
                    const replyAuthor = users.find(u => u.id === reply.authorId);
                    return (
                      <div key={reply.id} className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                          <UserCircle size={18} />
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl rounded-tl-none p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <span className="font-bold text-sm text-slate-800 dark:text-white">{replyAuthor?.name || 'Onbekend'}</span>
                            <span className="text-xs text-slate-500">{format(new Date(reply.createdAt), "d MMM, HH:mm", { locale: nl })}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    placeholder="Schrijf een reactie..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="shrink-0 w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
