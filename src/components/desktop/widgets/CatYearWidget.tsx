'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DesktopCardItem } from '@/types/os';
import { Sparkles, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CatYearWidgetProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

// Western Zodiac Signs (Ordered by calendar year)
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', order: '1st sign', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', symbol: '♉', order: '2nd sign', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', symbol: '♊', order: '3rd sign', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', symbol: '♋', order: '4th sign', start: [6, 21], end: [7, 22] },
  { name: 'Leo', symbol: '♌', order: '5th sign', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', symbol: '♍', order: '6th sign', start: [8, 23], end: [9, 22] },
  { name: 'Libra', symbol: '♎', order: '7th sign', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', symbol: '♏', order: '8th sign', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', order: '9th sign', start: [11, 22], end: [12, 21] },
  { name: 'Capricorn', symbol: '♑', order: '10th sign', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', symbol: '♒', order: '11th sign', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', symbol: '♓', order: '12th sign', start: [2, 19], end: [3, 20] },
];

// Chinese Zodiac Animals
const CHINESE_ANIMALS = [
  { name: 'Rat', symbol: '🐀', order: '1st sign' },
  { name: 'Ox', symbol: '🐂', order: '2nd sign' },
  { name: 'Tiger', symbol: '🐅', order: '3rd sign' },
  { name: 'Rabbit', symbol: '🐇', order: '4th sign' },
  { name: 'Dragon', symbol: '🐉', order: '5th sign' },
  { name: 'Snake', symbol: '🐍', order: '6th sign' },
  { name: 'Horse', symbol: '🐎', order: '7th sign' },
  { name: 'Goat', symbol: '🐐', order: '8th sign' },
  { name: 'Monkey', symbol: '🐒', order: '9th sign' },
  { name: 'Rooster', symbol: '🐓', order: '10th sign' },
  { name: 'Dog', symbol: '🐕', order: '11th sign' },
  { name: 'Pig', symbol: '🐖', order: '12th sign' },
];

const CHINESE_ELEMENTS = [
  { name: 'Metal', symbol: '🪙' },
  { name: 'Metal', symbol: '🪙' },
  { name: 'Water', symbol: '💧' },
  { name: 'Water', symbol: '💧' },
  { name: 'Wood', symbol: '🪵' },
  { name: 'Wood', symbol: '🪵' },
  { name: 'Fire', symbol: '🔥' },
  { name: 'Fire', symbol: '🔥' },
  { name: 'Earth', symbol: '🌍' },
  { name: 'Earth', symbol: '🌍' },
];

// Calculation Helpers
function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split('')
    .reduce((acc, c) => acc + parseInt(c, 10), 0);
}

function reduceToSingleDigit(num: number, preserveMaster = true): { reduced: number; raw: number } {
  if (preserveMaster && (num === 11 || num === 22 || num === 33)) {
    return { reduced: num, raw: num };
  }
  let cur = num;
  while (cur > 9) {
    if (preserveMaster && (cur === 11 || cur === 22 || cur === 33)) break;
    cur = sumDigits(cur);
  }
  return { reduced: cur, raw: num };
}

function calculateLifePath(month: number, day: number, year: number) {
  const yearSum = sumDigits(year);
  const rawTotal = month + day + yearSum;
  const { reduced } = reduceToSingleDigit(rawTotal, true);
  return {
    reduced,
    raw: rawTotal,
    formatted: reduced === rawTotal ? `${reduced}` : `${reduced}/${rawTotal}`,
  };
}

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC_SIGNS) {
    const [sM, sD] = z.start;
    const [eM, eD] = z.end;
    if (sM === 12 && eM === 1) {
      if ((month === 12 && day >= sD) || (month === 1 && day <= eD)) return z;
    } else if (
      (month === sM && day >= sD) ||
      (month === eM && day <= eD) ||
      (month > sM && month < eM)
    ) {
      return z;
    }
  }
  return ZODIAC_SIGNS[11]; // default Pisces
}

function getChineseZodiac(year: number) {
  const animalIdx = (year - 4) % 12;
  const animal = CHINESE_ANIMALS[animalIdx >= 0 ? animalIdx : animalIdx + 12];
  const elemIdx = (year - 4) % 10;
  const element = CHINESE_ELEMENTS[elemIdx >= 0 ? elemIdx : elemIdx + 10];
  return { animal, element };
}

function getDayOfYear(year: number, month: number, day: number): number {
  const target = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  const diff = target.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function CatYearWidget({ item }: CatYearWidgetProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'reading'>('calendar');

  // Calendar State (Default November 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(22); // Day 22 selected

  // Birthdate Reading State (Empty by default unless saved in localStorage: Day / Month / Year)
  const [birthDay, setBirthDay] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [clearedSuccess, setClearedSuccess] = useState<boolean>(false);

  // Load saved birthdate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('macos_reading_birthdate');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.day) setBirthDay(parsed.day);
        if (parsed.month) setBirthMonth(parsed.month);
        if (parsed.year) setBirthYear(parsed.year);
      }
    } catch {
      // ignore SSR or storage exceptions
    }
  }, []);

  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  // Compute Days for the Calendar View
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const yearDigits = sumDigits(currentYear);

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const raw = currentMonth + d + yearDigits;
      const { reduced } = reduceToSingleDigit(raw, true);

      // Master numbers (11, 22, 33, 28, 29)
      const isMaster =
        reduced === 11 ||
        reduced === 22 ||
        reduced === 33 ||
        raw === 22 ||
        raw === 28 ||
        raw === 29;

      days.push({
        day: d,
        raw,
        reduced,
        formatted: reduced === raw ? `${reduced}` : `${reduced}/${raw}`,
        isMaster,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Selected Date Info (Formatted in Day / Month / Year)
  const selectedDateInfo = useMemo(() => {
    const lp = calculateLifePath(currentMonth, selectedDay, currentYear);
    const zodiac = getZodiac(currentMonth, selectedDay);
    const cz = getChineseZodiac(currentYear);
    const dayPadded = String(selectedDay).padStart(2, '0');
    const monthPadded = String(currentMonth).padStart(2, '0');
    return {
      dateStr: `${dayPadded} / ${monthPadded} / ${currentYear}`,
      lp: `LP ${lp.formatted}`,
      animal: `${cz.animal.symbol} ${cz.animal.name}`,
      zodiac: `${zodiac.symbol} ${zodiac.name}`,
    };
  }, [currentMonth, selectedDay, currentYear]);

  // Is valid birthdate entered?
  const isBirthdateEntered = useMemo(() => {
    const d = parseInt(birthDay, 10);
    const m = parseInt(birthMonth, 10);
    const y = parseInt(birthYear, 10);
    return Boolean(
      !isNaN(d) && d >= 1 && d <= 31 &&
      !isNaN(m) && m >= 1 && m <= 12 &&
      !isNaN(y) && y >= 1900 && y <= 2100 &&
      birthYear.length === 4
    );
  }, [birthDay, birthMonth, birthYear]);

  // Birthdate Reading Info (Calculations based strictly on Day / Month / Year)
  const readingInfo = useMemo(() => {
    if (!isBirthdateEntered) return null;

    const d = parseInt(birthDay, 10);
    const m = parseInt(birthMonth, 10);
    const y = parseInt(birthYear, 10);

    const lp = calculateLifePath(m, d, y);
    const zodiac = getZodiac(m, d);
    const cz = getChineseZodiac(y);
    const dayOfYear = getDayOfYear(y, m, d);
    const weekOfYear = Math.ceil(dayOfYear / 7);

    // Current Year 2026 data
    const age = 2026 - y;
    const currentYearDigits = sumDigits(2026);
    const pyRaw = m + d + currentYearDigits;
    const { reduced: pyReduced } = reduceToSingleDigit(pyRaw, true);

    return {
      lpFormatted: `Life Path ${lp.formatted}`,
      zodiac,
      dayNumber: d,
      dayOfYear,
      weekOfYear,
      chineseZodiac: cz,
      age: Math.max(0, age),
      personalYear: `${pyReduced}/${pyRaw} Personal Year (2026)`,
    };
  }, [birthDay, birthMonth, birthYear, isBirthdateEntered]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        'macos_reading_birthdate',
        JSON.stringify({ day: birthDay, month: birthMonth, year: birthYear })
      );
    } catch {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleClear = () => {
    setBirthDay('');
    setBirthMonth('');
    setBirthYear('');
    try {
      localStorage.removeItem('macos_reading_birthdate');
    } catch {
      // ignore
    }
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 1500);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative w-76 p-3 rounded-2xl backdrop-blur-2xl bg-[#FFE4BA]/92 dark:bg-neutral-900/92 border border-amber-300/60 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200 font-sans text-slate-800 dark:text-neutral-100">
      {/* Top Header & Tab Toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/10 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold font-mono tracking-tight text-amber-950 dark:text-amber-200">
            Numerology & Astrology
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('calendar');
            }}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-neutral-800 text-amber-900 dark:text-white font-bold shadow-xs'
                : 'text-amber-900/70 dark:text-neutral-400 hover:text-amber-950'
            }`}
          >
            <CalendarIcon className="w-2.5 h-2.5" />
            <span>Calendar</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('reading');
            }}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'reading'
                ? 'bg-white dark:bg-neutral-800 text-amber-900 dark:text-white font-bold shadow-xs'
                : 'text-amber-900/70 dark:text-neutral-400 hover:text-amber-950'
            }`}
          >
            <User className="w-2.5 h-2.5" />
            <span>Reading</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CALENDAR GRID */}
      {activeTab === 'calendar' ? (
        <div className="flex flex-col gap-1.5">
          {/* Month & Navigation Bar */}
          <div className="flex items-center justify-between px-1 text-xs font-bold text-amber-950 dark:text-amber-100">
            <span>
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevMonth();
                }}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextMonth();
                }}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Table */}
          <div className="rounded-xl overflow-hidden border border-sky-300/80 dark:border-neutral-700 bg-sky-100/60 dark:bg-neutral-950 shadow-inner">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-[9px] font-semibold text-center py-1 bg-sky-200/70 dark:bg-sky-950/70 text-sky-900 dark:text-sky-300 border-b border-sky-300/70 dark:border-neutral-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 gap-0.5 p-0.5 bg-sky-200/40 dark:bg-neutral-900">
              {calendarDays.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-10 bg-sky-50/30 dark:bg-neutral-900/30 opacity-20"
                    />
                  );
                }

                const isSelected = selectedDay === cell.day;

                // Color styles
                let cellClasses =
                  'bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border-sky-200/60 dark:border-neutral-700';
                let subColor = 'text-slate-500 dark:text-neutral-400';

                if (cell.isMaster) {
                  // Dark Burgundy Master Day
                  cellClasses =
                    'bg-[#380e0e] text-white border-red-950/80 shadow-xs font-semibold';
                  subColor = 'text-red-400 font-bold';
                }

                if (isSelected) {
                  // Selected Day: Emerald Green with Yellow Border
                  cellClasses =
                    'bg-emerald-700 text-white border-2 border-yellow-300 shadow-md font-bold z-10';
                  subColor = 'text-emerald-200 font-bold';
                }

                return (
                  <div
                    key={`day-${cell.day}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDay(cell.day);
                    }}
                    className={`h-10 flex flex-col items-center justify-center p-0.5 rounded cursor-pointer transition-transform active:scale-95 ${cellClasses}`}
                  >
                    {isSelected && (
                      <span className="text-[7px] leading-none text-yellow-300 -mt-0.5">
                        ♐
                      </span>
                    )}
                    <span className="text-[10px] font-bold leading-tight">
                      {cell.day}
                    </span>
                    <span className={`text-[8px] font-mono leading-none ${subColor}`}>
                      {cell.formatted}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Summary in Day / Month / Year format */}
          <div className="p-2 rounded-xl bg-sky-200/40 dark:bg-neutral-800/60 border border-sky-300/60 dark:border-white/5 text-[10px] leading-tight flex flex-col gap-0.5">
            <span className="text-[9px] text-sky-800 dark:text-neutral-400">
              Selected Date: (click any day in the grid)
            </span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>{selectedDateInfo.dateStr}</span>
              <span className="text-amber-600 dark:text-amber-400">
                {selectedDateInfo.lp}
              </span>
              <span>{selectedDateInfo.animal}</span>
              <span>{selectedDateInfo.zodiac}</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: BIRTHDATE READING PROFILE (Strict Day / Month / Year order, empty by default) */
        <div className="flex flex-col gap-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Enter a birthdate
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 text-[10px] font-medium text-amber-900 dark:text-neutral-200 border border-amber-300 dark:border-white/10 hover:bg-amber-50 cursor-pointer flex items-center gap-0.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Saved!</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 text-[10px] font-medium text-amber-900 dark:text-neutral-200 border border-amber-300 dark:border-white/10 hover:bg-amber-50 cursor-pointer"
              >
                {clearedSuccess ? (
                  <span className="text-amber-700 dark:text-amber-400 font-bold">Cleared</span>
                ) : (
                  <span>Clear</span>
                )}
              </button>
            </div>
          </div>

          {/* Life Path Banner */}
          <div className="p-1 rounded-xl bg-amber-200/80 dark:bg-amber-950/50 border border-amber-400/50 text-center">
            <span className="text-sm font-extrabold font-mono text-amber-950 dark:text-amber-200 tracking-tight">
              {readingInfo ? readingInfo.lpFormatted : 'Life Path — / —'}
            </span>
          </div>

          {/* Birthdate Input Box: DAY / MONTH / YEAR (DD / MM / YYYY) */}
          <div className="p-1.5 rounded-xl bg-white dark:bg-neutral-950 border-2 border-amber-500/50 flex items-center justify-center gap-2 font-mono text-base font-bold text-slate-800 dark:text-white shadow-xs">
            {/* Day (DD) */}
            <div className="flex flex-col items-center">
              <input
                type="text"
                maxLength={2}
                value={birthDay}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setBirthDay(val);
                  if (val.length === 2 && monthInputRef.current) {
                    monthInputRef.current.focus();
                  }
                }}
                placeholder="DD"
                className="w-9 text-center bg-transparent focus:outline-none focus:text-amber-600 placeholder:text-neutral-400 placeholder:font-normal"
              />
              <span className="text-[8px] text-neutral-400 font-sans font-normal -mt-0.5">Day</span>
            </div>

            <span className="text-amber-400 text-lg mb-2">/</span>

            {/* Month (MM) */}
            <div className="flex flex-col items-center">
              <input
                ref={monthInputRef}
                type="text"
                maxLength={2}
                value={birthMonth}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setBirthMonth(val);
                  if (val.length === 2 && yearInputRef.current) {
                    yearInputRef.current.focus();
                  }
                }}
                placeholder="MM"
                className="w-9 text-center bg-transparent focus:outline-none focus:text-amber-600 placeholder:text-neutral-400 placeholder:font-normal"
              />
              <span className="text-[8px] text-neutral-400 font-sans font-normal -mt-0.5">Month</span>
            </div>

            <span className="text-amber-400 text-lg mb-2">/</span>

            {/* Year (YYYY) */}
            <div className="flex flex-col items-center">
              <input
                ref={yearInputRef}
                type="text"
                maxLength={4}
                value={birthYear}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
                placeholder="YYYY"
                className="w-16 text-center bg-transparent focus:outline-none focus:text-amber-600 placeholder:text-neutral-400 placeholder:font-normal"
              />
              <span className="text-[8px] text-neutral-400 font-sans font-normal -mt-0.5">Year</span>
            </div>
          </div>

          {/* 3 Energy Cards */}
          {readingInfo ? (
            <div className="grid grid-cols-3 gap-1 text-center">
              {/* Card 1: Western Zodiac */}
              <div className="p-1.5 rounded-xl bg-amber-100/70 dark:bg-neutral-800/80 border border-amber-300/40 flex flex-col items-center justify-center">
                <span className="text-sm">{readingInfo.zodiac.symbol}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {readingInfo.zodiac.name}
                </span>
                <span className="text-[8px] text-amber-800/70 dark:text-neutral-400 italic">
                  {readingInfo.zodiac.order}
                </span>
              </div>

              {/* Card 2: Secondary Energy */}
              <div className="p-1.5 rounded-xl bg-amber-100/70 dark:bg-neutral-800/80 border border-amber-300/40 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {readingInfo.dayNumber}
                </span>
                <span className="text-[8px] font-semibold text-slate-700 dark:text-neutral-300 leading-tight">
                  secondary energy
                </span>
                <span className="text-[7px] text-amber-800/70 dark:text-neutral-400 italic mt-0.5">
                  Day {readingInfo.dayOfYear} • Week {readingInfo.weekOfYear}
                </span>
              </div>

              {/* Card 3: Chinese Zodiac */}
              <div className="p-1.5 rounded-xl bg-amber-100/70 dark:bg-neutral-800/80 border border-amber-300/40 flex flex-col items-center justify-center">
                <div className="flex items-center gap-0.5 text-xs">
                  <span>{readingInfo.chineseZodiac.element.symbol}</span>
                  <span>{readingInfo.chineseZodiac.animal.symbol}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {readingInfo.chineseZodiac.animal.name}
                </span>
                <span className="text-[8px] text-amber-800/70 dark:text-neutral-400 italic">
                  {readingInfo.chineseZodiac.element.name} • {readingInfo.chineseZodiac.animal.order}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 text-center py-2 opacity-60">
              <div className="p-2 rounded-xl bg-amber-100/40 dark:bg-neutral-800/40 border border-dashed border-amber-300/40 flex flex-col items-center justify-center">
                <span className="text-sm">✨</span>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Zodiac</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-100/40 dark:bg-neutral-800/40 border border-dashed border-amber-300/40 flex flex-col items-center justify-center">
                <span className="text-sm">⚡</span>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Secondary Energy</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-100/40 dark:bg-neutral-800/40 border border-dashed border-amber-300/40 flex flex-col items-center justify-center">
                <span className="text-sm">🐉</span>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Chinese Zodiac</span>
              </div>
            </div>
          )}

          {/* Bottom Insights Row */}
          {readingInfo ? (
            <div className="p-1.5 rounded-xl bg-amber-100/40 dark:bg-neutral-800/40 border border-amber-300/30 text-[9px] flex items-center justify-between text-amber-950 dark:text-amber-200 font-medium">
              <span>{readingInfo.age} years old</span>
              <span className="font-bold">{readingInfo.personalYear}</span>
              <span>🐎 Horse, neutral sign</span>
            </div>
          ) : (
            <div className="p-1.5 rounded-xl bg-amber-100/30 dark:bg-neutral-800/30 text-[9px] text-center text-amber-900/60 dark:text-neutral-400">
              Enter your birthdate to reveal your cosmic profile
            </div>
          )}
        </div>
      )}
    </div>
  );
}
