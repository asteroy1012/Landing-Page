const ICONS = {
  forecast: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path
        d="M2 22 L9 13 L14 18 L22 6 L28 11"
        stroke="#14170f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="6" r="2" fill="#e2984a" />
    </svg>
  ),
  shield: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path
        d="M15 2 L26 7 V15 C26 22 21 26 15 28 C9 26 4 22 4 15 V7 Z"
        stroke="#14170f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11 15 L14 18 L20 11" stroke="#e2984a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  badge: (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="12" r="9" stroke="#14170f" strokeWidth="1.6" />
      <path d="M10 19 L7 28 L15 24 L23 28 L20 19" stroke="#14170f" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 12 L14 15 L19 9" stroke="#e2984a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function ProjectIcon({ name }) {
  return <div className="card-icon">{ICONS[name]}</div>
}
