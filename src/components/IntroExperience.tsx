"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

const FREEZE_AT = 8.2;
const SESSION_KEY = "anra_video_seen";
const CAPTION = "Welcome to AnraHealth. I'm ALBA, your AI health companion.";

type Stage = "checking" | "gate" | "video" | "done";

export default function IntroExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<Stage>("checking");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    setStage(seen ? "done" : "gate");
  }, []);

  useEffect(() => {
    if (stage !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.currentTime >= FREEZE_AT) {
        video.pause();
        sessionStorage.setItem(SESSION_KEY, "1");
        setStage("done");
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [stage]);

  const handleEnter = () => {
    setStage("video");
    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => setStage("done"));
      });
    });
  };

  const handleSkipVideo = () => {
    videoRef.current?.pause();
    sessionStorage.setItem(SESSION_KEY, "1");
    setStage("done");
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  // "checking" and "done" both render nothing — this way server and
  // client agree on the very first paint, no hydration mismatch.
  if (stage === "checking" || stage === "done") return null;

  return (
    <div className="fixed inset-0 z-[100] bg-graphite-900 overflow-hidden">
      <video ref={videoRef} src="/videos/intro-alba.mp4" poster="/images/intro-poster.jpg" preload="auto" playsInline className="absolute inset-0 w-full h-full object-cover" />
      {stage === "gate" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-graphite-900/55 backdrop-blur-sm">
          <p className="text-xs font-semibold tracking-widest uppercase text-gold-300 mb-4">ANRA Health</p>
          <button onClick={handleEnter} className="gold-gloss px-8 py-4 rounded-full text-base font-semibold shadow-glow transition-transform hover:scale-105">Enter ANRA Health</button>
          <p className="text-xs text-white/60 mt-4">Sound on for the full experience</p>
        </div>
      )}
      {stage === "video" && (
        <>
          <button onClick={handleSkipVideo} className="absolute top-5 right-5 z-20 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white glass px-3 py-2 rounded-full transition-colors">Skip <X size={13} /></button>
          <button onClick={toggleMute} className="absolute top-5 left-5 z-20 glass w-9 h-9 rounded-full flex items-center justify-center text-white/85 hover:text-white transition-colors" aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center text-sm text-white/90 max-w-md px-4">{CAPTION}</p>
        </>
      )}
    </div>
  );
}