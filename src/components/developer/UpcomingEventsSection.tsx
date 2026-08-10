import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Tag,
  ExternalLink,
  CheckCircle2,
  Video,
  X,
  Sparkles
} from 'lucide-react';

export interface UpcomingEventItem {
  id: string;
  title: string;
  time: string; // e.g., "10:30 AM" or "14:00"
  type: 'Meeting' | 'Work' | 'Learning' | 'Call' | 'Personal';
  linkUrl?: string;
  completed?: boolean;
}

const STORAGE_KEY = 'developer_upcoming_events_v1';

const INITIAL_EVENTS: UpcomingEventItem[] = [
  { id: 'ev1', time: '10:30 AM', title: 'Team Standup & Sprint Sync', type: 'Meeting', linkUrl: 'https://meet.google.com' },
  { id: 'ev2', time: '02:00 PM', title: 'Code Review & PR Triage', type: 'Work', linkUrl: 'https://github.com' },
  { id: 'ev3', time: '06:00 PM', title: 'System Architecture & Tech Study', type: 'Learning' }
];

export const UpcomingEventsSection: React.FC = () => {
  const [events, setEvents] = useState<UpcomingEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<UpcomingEventItem['type']>('Meeting');
  const [eventLink, setEventLink] = useState('');

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const saved = await storageService.local.get<UpcomingEventItem[]>(STORAGE_KEY, INITIAL_EVENTS);
        if (Array.isArray(saved)) {
          setEvents(saved);
        } else {
          setEvents(INITIAL_EVENTS);
        }
      } catch (e) {
        console.error('Failed to load upcoming events:', e);
        setEvents(INITIAL_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const saveEvents = async (newEvents: UpcomingEventItem[]) => {
    setEvents(newEvents);
    await storageService.local.set(STORAGE_KEY, newEvents);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventTime.trim()) return;

    let formattedLink = eventLink.trim();
    if (formattedLink && !/^https?:\/\//i.test(formattedLink)) {
      formattedLink = `https://${formattedLink}`;
    }

    const newEv: UpcomingEventItem = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: eventTitle.trim(),
      time: eventTime.trim(),
      type: eventType,
      linkUrl: formattedLink || undefined,
      completed: false
    };

    const updated = [...events, newEv];
    await saveEvents(updated);

    // Reset form
    setEventTitle('');
    setEventTime('');
    setEventLink('');
    setIsAddFormOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    const updated = events.filter((ev) => ev.id !== id);
    await saveEvents(updated);
  };

  const toggleEventCompleted = async (id: string) => {
    const updated = events.map((ev) => (ev.id === id ? { ...ev, completed: !ev.completed } : ev));
    await saveEvents(updated);
  };

  const getTypeStyle = (type: UpcomingEventItem['type']) => {
    switch (type) {
      case 'Meeting':
        return 'bg-[#1C212B] light:bg-blue-100 text-[#58A6FF] light:text-blue-800 border-[#388BFD] light:border-blue-300';
      case 'Work':
        return 'bg-[#0E4429] light:bg-emerald-100 text-[#39D353] light:text-emerald-800 border-[#26A641] light:border-emerald-300';
      case 'Learning':
        return 'bg-[#271052] light:bg-purple-100 text-[#D2A8FF] light:text-purple-800 border-[#A371F7] light:border-purple-300';
      case 'Call':
        return 'bg-[#341A00] light:bg-amber-100 text-[#F2CC60] light:text-amber-800 border-[#D29922] light:border-amber-300';
      default:
        return 'bg-[#161B22] light:bg-slate-100 text-[#8B949E] light:text-slate-700 border-[#30363D] light:border-slate-300';
    }
  };

  return (
    <div className="bg-[#0D1117] light:bg-white border border-[#30363D] light:border-slate-200 rounded-lg p-4 space-y-3 font-mono transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#30363D] light:border-slate-200">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#58A6FF] light:text-blue-600" />
          <h2 className="text-xs font-bold text-[#E6EDF3] light:text-slate-900">Upcoming Today & Reminders</h2>
          <span className="text-[10px] text-[#8B949E] light:text-slate-600 px-2 py-0.5 rounded-full bg-[#161B22] light:bg-slate-100 border border-[#30363D] light:border-slate-200">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="px-2.5 py-1 rounded bg-[#238636] hover:bg-[#2EA043] light:bg-emerald-600 light:hover:bg-emerald-700 border border-[#3FB950] light:border-emerald-500 font-bold text-xs text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Add Event Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleAddEvent}
          className="p-3.5 bg-[#161B22] light:bg-slate-50 border border-[#58A6FF]/40 light:border-blue-400 rounded-lg space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#58A6FF] light:text-blue-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2CC60] light:text-amber-500" />
              <span>Add New Event / Meeting</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-[#8B949E] light:text-slate-500 hover:text-[#E6EDF3] light:hover:text-slate-800 text-[11px] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Event Title */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#8B949E] light:text-slate-600 mb-1 block">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Design Sync with Client or Architecture Meeting"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0D1117] light:bg-white border border-[#30363D] light:border-slate-300 rounded text-[#E6EDF3] light:text-slate-900 focus:outline-none focus:border-[#58A6FF] light:focus:border-blue-500"
              />
            </div>

            {/* Time */}
            <div>
              <label className="text-[10px] font-bold text-[#8B949E] light:text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#58A6FF] light:text-blue-600" />
                <span>Time *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM or 15:30"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0D1117] light:bg-white border border-[#30363D] light:border-slate-300 rounded text-[#E6EDF3] light:text-slate-900 focus:outline-none focus:border-[#58A6FF] light:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Type */}
            <div>
              <label className="text-[10px] font-bold text-[#8B949E] light:text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#D2A8FF] light:text-purple-600" />
                <span>Event Category</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as UpcomingEventItem['type'])}
                className="w-full px-3 py-1.5 bg-[#0D1117] light:bg-white border border-[#30363D] light:border-slate-300 rounded text-[#E6EDF3] light:text-slate-900 focus:outline-none focus:border-[#58A6FF] light:focus:border-blue-500 cursor-pointer"
              >
                <option value="Meeting">Meeting</option>
                <option value="Work">Work</option>
                <option value="Learning">Learning</option>
                <option value="Call">Call</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* Link URL */}
            <div>
              <label className="text-[10px] font-bold text-[#8B949E] light:text-slate-600 mb-1 flex items-center gap-1">
                <Video className="w-3 h-3 text-[#3FB950] light:text-emerald-600" />
                <span>Meeting / Document Link (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="https://meet.google.com/..."
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0D1117] light:bg-white border border-[#30363D] light:border-slate-300 rounded text-[#E6EDF3] light:text-slate-900 focus:outline-none focus:border-[#58A6FF] light:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-[#30363D]/60 light:border-slate-200">
            <button
              type="submit"
              disabled={!eventTitle.trim() || !eventTime.trim()}
              className="px-3.5 py-1.5 rounded bg-[#238636] hover:bg-[#2EA043] light:bg-emerald-600 light:hover:bg-emerald-700 border border-[#3FB950] light:border-emerald-500 font-bold text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Save Event
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="text-xs text-[#8B949E] light:text-slate-500 py-2">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="p-4 text-center bg-[#161B22]/60 light:bg-slate-50 border border-[#30363D] light:border-slate-200 rounded-lg text-xs text-[#8B949E] light:text-slate-500">
          No upcoming events scheduled. Click "+ Add Event" above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`flex items-center justify-between gap-2 p-2.5 rounded bg-[#161B22] light:bg-slate-50 border transition-all group ${
                ev.completed
                  ? 'border-[#30363D]/60 light:border-slate-200 opacity-60 bg-[#161B22]/40 light:bg-slate-100/60'
                  : 'border-[#30363D] light:border-slate-200 hover:border-[#58A6FF]/50 light:hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleEventCompleted(ev.id)}
                  className={`px-2 py-1 rounded font-mono font-bold text-[10px] shrink-0 border cursor-pointer transition-colors ${getTypeStyle(
                    ev.type
                  )}`}
                  title="Toggle status"
                >
                  {ev.time}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        ev.completed ? 'line-through text-[#8B949E] light:text-slate-400' : 'text-[#E6EDF3] light:text-slate-800'
                      }`}
                    >
                      {ev.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#8B949E] light:text-slate-500 block">{ev.type}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {ev.linkUrl && (
                  <a
                    href={ev.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#58A6FF] light:text-blue-600 hover:text-[#79C0FF] light:hover:text-blue-700 hover:bg-[#21262D] light:hover:bg-slate-200 rounded transition-colors"
                    title="Open Event Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="p-1 text-[#8B949E] light:text-slate-400 hover:text-[#FF7B72] light:hover:text-rose-600 hover:bg-[#21262D] light:hover:bg-slate-200 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
