"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

export default function LayoutChrome() {
  const pathname = usePathname();
  if (pathname === "/") return null; // ALBA is the companion here, not the old widget
  return <ChatWidget />;
}