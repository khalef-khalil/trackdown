"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { calculateCurrentValue, getMaxDecimalPlaces, formatCount, formatDecimalString, CountdownData } from "@/lib/countdown";

export default function Home() {
  // Use string state for inputs to allow empty and decimal values
  const [startValueInput, setStartValueInput] = useState("100");
  const [rateInput, setRateInput] = useState("1");
  const [countdown, setCountdown] = useState<CountdownData | null>(null);
  const [currentValue, setCurrentValue] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createSupabaseBrowserClient();

  // Parse input values as floats, fallback to 0 if invalid
  const startValue = parseFloat(startValueInput) || 0;
  const rate = parseFloat(rateInput) || 0;

  const loadCountdown = useCallback(async () => {
    try {
      const response = await fetch('/api/countdown');
      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
        setCurrentValue(calculateCurrentValue(data));
        
        // Only update input fields if this is the first load and no countdown exists
        if (!countdown) {
          // Convert to proper decimal strings to avoid scientific notation
          const startValueStr = formatDecimalString(data.start_value);
          const rateStr = formatDecimalString(data.rate_per_second);
          
          setStartValueInput(startValueStr);
          setRateInput(rateStr);
        }
      } else {
        // No countdown exists, create default
        setCountdown(null);
        setCurrentValue(startValue);
      }
    } catch (error) {
      console.error('Failed to load countdown:', error);
      setCurrentValue(startValue);
    } finally {
      setIsLoading(false);
    }
  }, [startValue, countdown]);

  const refreshCountdown = useCallback(async () => {
    try {
      const response = await fetch('/api/countdown');
      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
        setCurrentValue(calculateCurrentValue(data));
      }
    } catch (error) {
      console.error('Failed to refresh countdown:', error);
    }
  }, []);

  // Load initial countdown data
  useEffect(() => {
    loadCountdown();
  }, [loadCountdown]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('countdown_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'countdowns'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          refreshCountdown();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshCountdown]);

  // Update current value every second when running
  useEffect(() => {
    if (countdown?.is_running) {
      intervalRef.current = setInterval(() => {
        if (countdown) {
          const newValue = calculateCurrentValue(countdown);
          setCurrentValue(newValue);
          
          // Stop if reached zero
          if (newValue <= 0) {
            clearInterval(intervalRef.current!);
            setCountdown(prev => prev ? { ...prev, is_running: false } : null);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdown) {
        setCurrentValue(calculateCurrentValue(countdown));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countdown]);

  // Start countdown
  const handleStart = async () => {
    try {
      const response = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startValue, rate })
      });

      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
        setCurrentValue(calculateCurrentValue(data));
      }
    } catch (error) {
      console.error('Failed to start countdown:', error);
    }
  };

  // Pause countdown
  const handlePause = async () => {
    try {
      const response = await fetch('/api/countdown/control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' })
      });

      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
      }
    } catch (error) {
      console.error('Failed to pause countdown:', error);
    }
  };

  // Resume countdown
  const handleResume = async () => {
    try {
      const response = await fetch('/api/countdown/control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' })
      });

      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
      }
    } catch (error) {
      console.error('Failed to resume countdown:', error);
    }
  };

  // Reset countdown
  const handleReset = async () => {
    try {
      const response = await fetch('/api/countdown/control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', startValue, rate })
      });

      if (response.ok) {
        const data = await response.json();
        setCountdown(data);
        setCurrentValue(calculateCurrentValue(data));
      }
    } catch (error) {
      console.error('Failed to reset countdown:', error);
    }
  };

  // Update start value input
  const handleStartValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only valid float input (including empty string)
    if (/^\d*\.?\d*$/.test(val)) {
      setStartValueInput(val);
    }
  };

  // Update rate input
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only valid float input (including empty string)
    if (/^\d*\.?\d*$/.test(val)) {
      setRateInput(val);
    }
  };

  // Calculate display values
  const maxDecimals = getMaxDecimalPlaces(startValueInput, rateInput);
  const displayValue = formatCount(currentValue, maxDecimals);
  const isRunning = countdown?.is_running || false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 flex flex-col items-center gap-10 w-full max-w-lg border border-gray-200/50">
        <h1 className="text-3xl font-light text-gray-800 tracking-wide">Countdown Timer</h1>
        <div className="flex flex-col gap-6 w-full">
          <label className="flex flex-col text-gray-700 font-medium">
            Start Value
            <input
              type="text"
              inputMode="decimal"
              value={startValueInput}
              onChange={handleStartValueChange}
              className="mt-2 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50 text-gray-900 font-mono text-lg transition-all"
              disabled={isRunning}
              placeholder="0"
              aria-label="Start Value"
            />
          </label>
          <label className="flex flex-col text-gray-700 font-medium">
            Rate (per second)
            <input
              type="text"
              inputMode="decimal"
              value={rateInput}
              onChange={handleRateChange}
              className="mt-2 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50 text-gray-900 font-mono text-lg transition-all"
              disabled={isRunning}
              placeholder="0"
              aria-label="Rate per second"
            />
          </label>
        </div>
        <div className="text-5xl font-extralight text-gray-900 tracking-wider mb-6 select-none font-mono min-w-[400px] text-center">
          {displayValue}
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={currentValue === 0 || rate === 0}
              className="px-8 py-3 rounded-lg bg-gray-800 text-white font-medium shadow-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Start Countdown"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3 rounded-lg bg-gray-600 text-white font-medium shadow-lg hover:bg-gray-500 transition-all duration-200"
              aria-label="Pause Countdown"
            >
              Pause
            </button>
          )}
          {!isRunning && countdown && (
            <button
              onClick={handleResume}
              className="px-8 py-3 rounded-lg bg-gray-600 text-white font-medium shadow-lg hover:bg-gray-500 transition-all duration-200"
              aria-label="Resume Countdown"
            >
              Resume
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium shadow-lg hover:bg-gray-200 transition-all duration-200"
            aria-label="Reset Countdown"
          >
            Reset
          </button>
        </div>
      </div>
      <footer className="mt-16 text-gray-400 text-sm font-light">Track Down</footer>
    </div>
  );
}
