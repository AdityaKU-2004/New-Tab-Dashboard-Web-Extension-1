import React, { useState } from 'react';
import { Todo } from '../../types';
import { motion } from 'motion/react';
import { Check, Trash2, Star, Edit2, CheckSquare, Calendar, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { cn } from '../../utils/cn';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const toggleTodo = useDashboardStore((state) => state.toggleTodo);
  const deleteTodo = useDashboardStore((state) => state.deleteTodo);
  const editTodo = useDashboardStore((state) => state.editTodo);
  const toggleStarTodo = useDashboardStore((state) => state.toggleStarTodo);
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      editTodo(todo.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout={enableAnimations}
      initial={enableAnimations ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group flex items-center justify-between gap-2.5 p-2.5 rounded-xl transition-all border shadow-sm',
        todo.completed
          ? 'bg-white/5 border-white/10 text-white/50 light:bg-slate-100 light:border-slate-200 light:text-slate-400'
          : 'bg-white/10 hover:bg-white/15 border-white/15 text-white light:bg-white light:border-slate-200 light:text-slate-800'
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => toggleTodo(todo.id)}
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-lg border transition-all cursor-pointer flex-shrink-0',
            todo.completed
              ? 'bg-accent border-accent text-white'
              : 'border-white/40 hover:border-accent light:border-slate-400 bg-transparent'
          )}
          title={todo.completed ? 'Mark incomplete' : 'Mark completed'}
        >
          {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Text Content */}
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
            className="flex-1 px-2 py-0.5 bg-slate-900/60 light:bg-white light:text-slate-900 light:border-slate-300 rounded text-xs text-white border border-accent/50 focus:outline-none"
          />
        ) : (
          <div className="flex-1 min-w-0">
            {(() => {
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const matches = todo.text.match(urlRegex);
              const hasUrl = matches && matches.length > 0;
              const detectedUrl = hasUrl ? matches[0] : null;

              return (
                <div className="space-y-0.5">
                  <span
                    onClick={() => toggleTodo(todo.id)}
                    className={cn(
                      'block text-xs font-medium cursor-pointer truncate transition-all',
                      todo.completed && 'line-through opacity-60'
                    )}
                  >
                    {todo.text}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {todo.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/50 light:text-slate-500">
                        <Calendar className="w-2.5 h-2.5" /> {todo.dueDate}
                      </span>
                    )}

                    {detectedUrl && (
                      <a
                        href={detectedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline font-mono truncate max-w-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{detectedUrl}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => toggleStarTodo(todo.id)}
          className={cn(
            'p-1 rounded text-white/50 hover:text-amber-400 light:text-slate-400 light:hover:text-amber-500 transition-colors cursor-pointer',
            todo.starred && 'text-amber-400 light:text-amber-500'
          )}
          title="Star task"
        >
          <Star className={cn('w-3.5 h-3.5', todo.starred && 'fill-amber-400 light:fill-amber-500')} />
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 rounded text-white/50 hover:text-white light:text-slate-400 light:hover:text-slate-800 transition-colors cursor-pointer"
          title="Edit task"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => deleteTodo(todo.id)}
          className="p-1 rounded text-white/50 hover:text-rose-400 light:text-slate-400 light:hover:text-rose-600 transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
