"use client";
import { useState, useRef } from "react";

export default function Home() {
  // Use string state for inputs to allow empty and decimal values
  const [startValueInput, setStartValueInput] = useState("100");
  const [rateInput, setRateInput] = useState("1");
  // Store the actual number values for countdown logic
  const [count, setCount] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse input values as floats, fallback to 0 if invalid
  const startValue = parseFloat(startValueInput) || 0;
  const rate = parseFloat(rateInput) || 0;

  // Calculate maximum decimal places needed
  const getMaxDecimalPlaces = () => {
    const startDecimals = startValueInput.includes('.') ? startValueInput.split('.')[1].length : 0;
    const rateDecimals = rateInput.includes('.') ? rateInput.split('.')[1].length : 0;
    return Math.max(startDecimals, rateDecimals);
  };

  // Format count with appropriate decimal places
  const formatCount = (value: number) => {
    const maxDecimals = getMaxDecimalPlaces();
    return value.toFixed(maxDecimals);
  };

  // Start countdown
  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const next = prev - rate;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  // Pause countdown
  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Reset countdown
  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCount(startValue);
  };

  // Update start value input
  const handleStartValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only valid float input (including empty string)
    if (/^\d*\.?\d*$/.test(val)) {
      setStartValueInput(val);
      if (val === "") {
        setCount(0);
      } else {
        setCount(parseFloat(val) || 0);
      }
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
            />
          </label>
        </div>
        <div className="text-5xl font-extralight text-gray-900 tracking-wider mb-6 select-none font-mono min-w-[400px] text-center">
          {Number.isNaN(count) ? "0" : formatCount(count)}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={isRunning || count === 0 || rate === 0}
            className="px-8 py-3 rounded-lg bg-gray-800 text-white font-medium shadow-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            Start
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="px-8 py-3 rounded-lg bg-gray-600 text-white font-medium shadow-lg hover:bg-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200"
          >
            Pause
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium shadow-lg hover:bg-gray-200 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>
      <footer className="mt-16 text-gray-400 text-sm font-light">Track Down</footer>
    </div>
  );
}
