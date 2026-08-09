import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, FileText, Save, Check } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const INITIAL_NOTES: Note[] = [
  {
    id: 'note_1',
    title: 'Developer Checklist',
    content: '- Review PR #142 for performance updates\n- Set up staging environment variables\n- Deploy hotfix to production\n- Refactor state store for offline cache',
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'note_2',
    title: 'API Endpoints Scratchpad',
    content: '// GraphQL / REST endpoints\nPOST /api/v1/user/settings\nGET /api/v1/dashboard/stats\n\nHeaders: Authorization: Bearer <token>',
    updatedAt: Date.now() - 86400000
  }
];

export const DeveloperNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('developer_theme_notes_v1');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('developer_theme_notes_v1', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save developer notes:', e);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || '');
    }
  };

  const handleUpdateTitle = (title: string) => {
    setNotes(
      notes.map((n) => (n.id === activeNoteId ? { ...n, title, updatedAt: Date.now() } : n))
    );
    triggerSaveFeedback();
  };

  const handleUpdateContent = (content: string) => {
    setNotes(
      notes.map((n) => (n.id === activeNoteId ? { ...n, content, updatedAt: Date.now() } : n))
    );
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1200);
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-[#58A6FF]" />
          <h2 className="text-sm font-bold text-[#E6EDF3]">Developer Notes</h2>
          <span className="text-[10px] bg-[#1C212B] text-[#8B949E] px-2 py-0.5 rounded border border-[#30363D]">
            {notes.length} saved
          </span>
        </div>

        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#58A6FF]/10 text-[#58A6FF] hover:bg-[#58A6FF]/20 border border-[#58A6FF]/30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>New Note</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-[#8B949E] text-xs">
          No notes found. Click "New Note" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Notes List Sidebar */}
          <div className="md:col-span-4 space-y-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {notes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                    isActive
                      ? 'bg-[#1C212B] border-[#58A6FF] text-[#E6EDF3]'
                      : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:border-[#8B949E]/50'
                  }`}
                >
                  <div className="overflow-hidden flex-1">
                    <div className="font-semibold truncate text-[#E6EDF3]">
                      {note.title || 'Untitled'}
                    </div>
                    <div className="text-[10px] text-[#8B949E] truncate mt-0.5">
                      {note.content || 'Empty note...'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#8B949E] hover:text-[#F85149] transition-opacity cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Note Editor Area */}
          {activeNote && (
            <div className="md:col-span-8 bg-[#0D1117] border border-[#30363D] rounded p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#30363D]">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-transparent text-sm font-bold text-[#E6EDF3] focus:outline-none w-full placeholder-[#8B949E]"
                />
                <div className="flex items-center gap-1.5 text-[10px] text-[#8B949E] shrink-0">
                  {isSaved ? (
                    <span className="text-[#3FB950] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="w-3 h-3" /> Auto-saving
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Write code snippets, thoughts, or tasks here..."
                rows={8}
                className="w-full bg-transparent text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none resize-none custom-scrollbar leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
