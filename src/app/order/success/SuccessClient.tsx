"use client";

import { useEffect } from "react";

export function SuccessClient() {
  useEffect(() => {
    localStorage.removeItem("om-cart");
  }, []);

  return null;
}
