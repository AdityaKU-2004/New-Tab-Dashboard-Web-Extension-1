import { useState, useEffect } from 'react';

export interface ClockInfo {
  hours: string;
  minutes: string;
  seconds: string;
  ampm: string;
  dayName: string;
  formattedDate: string;
  greeting: string;
}

export function useClock(is12Hour: boolean = true) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rawHours = now.getHours();
  const rawMinutes = now.getMinutes();
  const rawSeconds = now.getSeconds();

  let displayHours = rawHours;
  let ampm = '';

  if (is12Hour) {
    ampm = rawHours >= 12 ? 'PM' : 'AM';
    displayHours = rawHours % 12 || 12;
  }

  const hours = String(displayHours).padStart(2, '0');
  const minutes = String(rawMinutes).padStart(2, '0');
  const seconds = String(rawSeconds).padStart(2, '0');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];

  const formattedDate = now.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let greeting = 'Good morning';
  if (rawHours >= 12 && rawHours < 17) {
    greeting = 'Good afternoon';
  } else if (rawHours >= 17 || rawHours < 4) {
    greeting = 'Good evening';
  }

  return {
    hours,
    minutes,
    seconds,
    ampm,
    dayName,
    formattedDate,
    greeting,
    rawDate: now
  };
}
