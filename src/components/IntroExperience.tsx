"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

const FREEZE_AT = 14;
const SESSION_KEY = "anra_video_seen";

export default function IntroExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true);
  }, []);

  const finish = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setFading(true);
    setTimeout(() => setVisible(false), 600);
  };

  useEffect(() => {
    if (!visible) return;
    const video = videoRef.current;
    if (!video) return;

    // Try with sound first; browsers that block it fall back to muted autoplay.
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => finish());
    });

    const onTimeUpdate = () => {
      if (video.currentTime >= FREEZE_AT) finish();
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", finish);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", finish);
    };
  }, [visible]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease" }}
    >
      <video
        ref={videoRef}
        src="/videos/intro-alba.mp4"
        preload="auto"
        playsInline
        autoPlay
        className="absolute inset-0 w-full h-full object-contain"
      />
      <button
        onClick={finish}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white bg-white/15 backdrop-blur px-4 py-2 rounded-full"
      >
        Skip <X size={14} />
      </button>
      <button
        onClick={toggleMute}
        className="absolute top-5 left-5 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/90 bg-white/15 backdrop-blur"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}