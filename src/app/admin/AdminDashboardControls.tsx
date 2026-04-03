"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

type AdminDashboardControlsProps = {
  initialQuery: string;
  initialStatus: string;
  initialType: string;
  activeOrderCount: number;
};

function playOrderChime() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const masterGain = context.createGain();
  masterGain.gain.value = 0.05;
  masterGain.connect(context.destination);

  const notes = [
    { frequency: 783.99, duration: 0.16, start: 0 },
    { frequency: 987.77, duration: 0.2, start: 0.18 },
    { frequency: 1174.66, duration: 0.26, start: 0.4 },
  ];

  const now = context.currentTime;
  notes.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = note.frequency;
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(0.22, now + note.start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now + note.start);
    oscillator.stop(now + note.start + note.duration);
  });

  window.setTimeout(() => {
    void context.close();
  }, 1200);
}

export function AdminDashboardControls({
  initialQuery,
  initialStatus,
  initialType,
  activeOrderCount,
}: AdminDashboardControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [orderType, setOrderType] = useState(initialType);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const previousActiveCountRef = useRef(activeOrderCount);

  useEffect(() => {
    setQuery(initialQuery);
    setStatus(initialStatus);
    setOrderType(initialType);
  }, [initialQuery, initialStatus, initialType]);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem("om-admin-order-sound");
    if (savedPreference === "off") {
      setSoundEnabled(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const previousActiveCount = previousActiveCountRef.current;
    if (soundEnabled && activeOrderCount > previousActiveCount) {
      playOrderChime();
    }
    previousActiveCountRef.current = activeOrderCount;
  }, [activeOrderCount, soundEnabled]);

  useEffect(() => {
    window.localStorage.setItem("om-admin-order-sound", soundEnabled ? "on" : "off");
  }, [soundEnabled]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    if (status && status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    if (orderType && orderType !== "ALL") {
      params.set("type", orderType);
    } else {
      params.delete("type");
    }

    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const clearSearch = () => {
    setQuery("");
    setStatus("ALL");
    setOrderType("ALL");
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-gradient-to-r from-white via-white to-[#faf5eb] p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by customer, phone, order ID, item, or note"
              className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-900 shadow-inner outline-none transition focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A]/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#C41E3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a01830] disabled:opacity-60"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Clear
            </button>
          </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A]/20"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING_PAYMENT">Pending payment</option>
              <option value="PAID">Paid</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PAYMENT_FAILED">Payment failed</option>
            </select>

            <select
              value={orderType}
              onChange={(event) => setOrderType(event.target.value)}
              className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A]/20"
            >
              <option value="ALL">All order types</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f8efe0] px-4 py-2 font-medium text-stone-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Auto-refresh every 5s
          </span>
          <button
            type="button"
            onClick={() => setSoundEnabled((current) => !current)}
            className={`rounded-full px-4 py-2 font-semibold transition ${
              soundEnabled
                ? "border border-[#d3b87b] bg-[#fff6df] text-stone-800 hover:bg-[#faefce]"
                : "border border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
            }`}
          >
            {soundEnabled ? "Order Sound On" : "Order Sound Off"}
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}
