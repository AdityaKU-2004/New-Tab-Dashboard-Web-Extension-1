import React, { useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { IconButton } from '../ui/IconButton';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboardStore } from '../../store/useDashboardStore';

export const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const enableAnimations = useDashboardStore((state) => state.settings.enableAnimations);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build grid days
  const calendarDays = [];
  // Empty slots before 1st day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <DashboardCard
      title={`${monthNames[month]} ${year}`}
      icon={CalendarIcon}
      headerAction={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToday}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white light:bg-slate-200 light:text-slate-800 transition-colors cursor-pointer"
          >
            Today
          </button>
          <IconButton
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
            onClick={handlePrevMonth}
            variant="ghost"
            size="sm"
            tooltip="Previous month"
          />
          <IconButton
            icon={<ChevronRight className="w-3.5 h-3.5" />}
            onClick={handleNextMonth}
            variant="ghost"
            size="sm"
            tooltip="Next month"
          />
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <span key={day} className="text-[10px] font-bold text-white/50 light:text-slate-400 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={enableAnimations ? { opacity: 0, x: 10 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1 text-center"
          >
            {calendarDays.map((dayNumber, idx) => {
              if (dayNumber === null) {
                return <div key={`empty-${idx}`} className="h-7 sm:h-8" />;
              }

              const isToday = isCurrentMonth && today.getDate() === dayNumber;
              const isSelected =
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === dayNumber;

              return (
                <button
                  key={`day-${dayNumber}`}
                  type="button"
                  onClick={() => setSelectedDate(new Date(year, month, dayNumber))}
                  className={`h-7 sm:h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isToday
                      ? 'bg-accent text-white font-bold shadow-lg shadow-accent/30 ring-2 border-accent-full'
                      : isSelected
                      ? 'bg-white/20 text-white border border-white/40 light:bg-slate-300 light:text-slate-900'
                      : 'hover:bg-white/10 text-white/80 light:text-slate-700 light:hover:bg-slate-200'
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardCard>
  );
};
