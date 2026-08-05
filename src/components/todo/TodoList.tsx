import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { TodoItem } from './TodoItem';
import { useDashboardStore } from '../../store/useDashboardStore';
import { TodoFilter } from '../../types';
import { CheckSquare, Plus, Trash, ListFilter, Calendar } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export const TodoList: React.FC = () => {
  const [inputTask, setInputTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todos = useDashboardStore((state) => state.todos);
  const filter = useDashboardStore((state) => state.todoFilter);
  const addTodo = useDashboardStore((state) => state.addTodo);
  const setFilter = useDashboardStore((state) => state.setTodoFilter);
  const clearCompleted = useDashboardStore((state) => state.clearCompletedTodos);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputTask.trim();
    if (!trimmed) return;

    addTodo(trimmed, dueDate || undefined);

    // If viewing completed filter, automatically switch to 'all' so the newly created active task is visible
    if (filter === 'completed') {
      setFilter('all');
    }

    setInputTask('');
    setDueDate('');
    setShowDatePicker(false);
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
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3.5 py-2.5 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-white/30 light:bg-slate-100 light:text-slate-900 light:placeholder-slate-400 light:border-slate-300 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
              dueDate
                ? 'bg-accent-soft border-accent text-accent'
                : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20'
            }`}
            title="Set due date"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            type="submit"
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-2xl bg-accent text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-lg hover:opacity-90 backdrop-blur-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Optional Due Date Picker input */}
        {showDatePicker && (
          <div className="flex items-center gap-2 px-1">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-1.5 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white text-xs focus:outline-none light:bg-slate-100 light:text-slate-900 light:border-slate-300"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
              >
                Clear date
              </button>
            )}
          </div>
        )}
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
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white/5 light:bg-slate-200/60 p-1 rounded-2xl mb-3 border border-white/10 light:border-slate-300">
        {(['all', 'active', 'completed'] as TodoFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 rounded-xl text-[11px] font-semibold capitalize transition-all cursor-pointer ${
              filter === f
                ? 'bg-accent text-white shadow-md'
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
