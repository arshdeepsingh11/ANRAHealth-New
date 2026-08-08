export function PhysicianArt() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="34" fill="#DCEFE7" />
      <circle cx="60" cy="30" r="12" fill="#3B7EA1" />
      <path d="M32 68c4-16 16-24 28-24s24 8 28 24" fill="#3B7EA1" />
      <path d="M32 68c4-16 16-24 28-24s24 8 28 24" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
      <circle cx="82" cy="26" r="5" fill="#D65A5A" opacity="0.9" />
      <path d="M78 26h8M82 22v8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LocationArt() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="34" fill="#EAF3F7" />
      <path d="M60 20c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16z" fill="#3B7EA1" />
      <circle cx="60" cy="36" r="6" fill="white" />
    </svg>
  );
}

export function AppointmentArt() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="34" fill="#FBEDED" />
      <rect x="38" y="26" width="44" height="34" rx="4" fill="white" stroke="#D65A5A" strokeWidth="2.5" />
      <rect x="38" y="26" width="44" height="10" rx="4" fill="#D65A5A" />
      <path d="M48 50l7 7 15-15" stroke="#3E9C7A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
