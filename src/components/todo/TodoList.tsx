import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { TodoItem } from './TodoItem';
import { useDashboardStore } from '../../store/useDashboardStore';
import { TodoFilter } from '../../types';
import { CheckSquare, Plus, Trash, ListFilter } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export const TodoList: React.FC = () => {
  const [inputTask, setInputTask] = useState('');
  const todos = useDashboardStore((state) => state.todos);
  const filter = useDashboardStore((state) => state.todoFilter);
  const addTodo = useDashboardStore((state) => state.addTodo);
  const setFilter = useDashboardStore((state) => state.setTodoFilter);
  const clearCompleted = useDashboardStore((state) => state.clearCompletedTodos);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTask.trim()) return;
    addTodo(inputTask.trim());
    setInputTask('');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <DashboardCard
      title="Tasks & Todos"
      subtitle={`${completedCount} of ${totalCount} completed`}
      icon={CheckSquare}
      headerAction={
        completedCount > 0 ? (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-[10px] font-medium text-white/60 hover:text-rose-400 light:text-slate-500 light:hover:text-rose-600 transition-colors cursor-pointer"
            title="Clear completed tasks"
          >
            Clear Done
          </button>
        ) : undefined
      }
    >
      {/* Input Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputTask}
          onChange={(e) => setInputTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 bg-white/10 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 light:bg-slate-100 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-white/60 light:text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 light:bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white/5 light:bg-slate-200/60 p-1 rounded-xl mb-3 border border-white/10 light:border-slate-300">
        {(['all', 'active', 'completed'] as TodoFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-white/70 hover:text-white light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56 pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <div className="py-6 text-center text-xs text-white/50 light:text-slate-400 italic">
            No tasks found.
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
