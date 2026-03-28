"use client";
import { useState, useEffect } from "react";

function calc(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days:0, hours:0, mins:0, secs:0, past:true };
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000)  / 60000),
    secs:  Math.floor((diff % 60000)    / 1000),
    past:  false,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="db-countdown-unit-wrap">
      <div className="db-countdown-num">{String(value).padStart(2,"0")}</div>
      <div className="db-countdown-unit">{label}</div>
    </div>
  );
}

function Colon() {
  return <div className="db-countdown-colon">:</div>;
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [t, setT] = useState<ReturnType<typeof calc> | null>(null);

  useEffect(() => {
    setT(calc(targetDate));
    const id = setInterval(() => setT(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!t) return <div className="db-countdown-placeholder" />;
  if (t.past) return <p className="db-countdown-past">The big day has passed!</p>;

  return (
    <div className="db-countdown">
      <Unit value={t.days}  label="DAYS" />
      <Colon />
      <Unit value={t.hours} label="HRS" />
      <Colon />
      <Unit value={t.mins}  label="MINS" />
      <Colon />
      <Unit value={t.secs}  label="SECS" />
    </div>
  );
}
