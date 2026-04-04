"use client";

import { useEffect, useState } from "react";

type OrderingMaintenanceModalProps = {
  allowDismiss?: boolean;
};

const DOORDASH_ORDER_URL =
  "https://www.doordash.com/store/om-indian-restaurant-new-york-1230170/38564352/";

export default function OrderingMaintenanceModal({
  allowDismiss = false,
}: OrderingMaintenanceModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (allowDismiss && isDismissed) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [allowDismiss, isDismissed]);

  if (allowDismiss && isDismissed) {
    return null;
  }

  return (
    <div
      aria-labelledby="ordering-maintenance-title"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${
        isVisible ? "bg-stone-950/70 opacity-100 backdrop-blur-sm" : "bg-stone-950/0 opacity-0"
      }`}
      role="dialog"
    >
      <div
        className={`w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-stone-950 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-all duration-300 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
        }`}
      >
        <div className="bg-gradient-to-r from-[#C41E3A] via-[#8f1128] to-stone-950 px-6 py-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
            Temporary Notice
          </p>
          <h2 id="ordering-maintenance-title" className="mt-3 text-3xl font-bold tracking-tight">
            Online ordering is temporarily paused
          </h2>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-3">
            <p className="text-base leading-7 text-stone-200">
              Our website checkout is under maintenance while we finish live payment setup.
            </p>
            <p className="text-sm leading-6 text-stone-300">
              Please place your order through DoorDash for now. We&apos;ll be back shortly.
            </p>
          </div>

          <div className="flex justify-center">
            <a
              className="group inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/15 bg-white px-5 py-4 text-base font-semibold text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:ring-offset-2 focus:ring-offset-stone-950"
              href={DOORDASH_ORDER_URL}
              rel="noreferrer"
              target="_blank"
            >
              <span>Order on DoorDash</span>
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5">
                {"->"}
              </span>
            </a>
          </div>

          {allowDismiss ? (
            <div className="border-t border-white/10 pt-4">
              <button
                className="text-sm font-medium text-stone-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:ring-offset-2 focus:ring-offset-stone-950"
                onClick={() => setIsDismissed(true)}
                type="button"
              >
                Continue to menu only
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
