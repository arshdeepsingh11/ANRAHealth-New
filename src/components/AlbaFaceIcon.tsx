import React from "react";

export default function AlbaFaceIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2.5c-3.3 0-5.7 2.6-5.7 6 0 1.6.4 3 1 4.1-.7.3-1.3.9-1.3 1.7 0 1.1 1 1.9 2.2 1.9.2 1.6 1.9 2.8 3.8 2.8s3.6-1.2 3.8-2.8c1.2 0 2.2-.8 2.2-1.9 0-.8-.6-1.4-1.3-1.7.6-1.1 1-2.5 1-4.1 0-3.4-2.4-6-5.7-6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 11.5c.3.4.7.6 1 .6M14.5 11.5c-.3.4-.7.6-1 .6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 14.8c.7.5 1.6.8 2.5.8s1.8-.3 2.5-.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.3 8.5c1.5-1 3.6-1.5 5.7-1.5s4.2.5 5.7 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}