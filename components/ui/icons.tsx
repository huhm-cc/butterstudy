/** 一致的線條圖標(1.6 描邊、24 網格、繼承 currentColor)。 */
type P = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconUpload = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 16V4m0 0L8 8m4-4 4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const IconSparkles = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3Z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </svg>
);

export const IconList = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

export const IconChat = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 12a7 7 0 0 1-7 7H9l-4 2 .8-3.5A7 7 0 0 1 13 5a7 7 0 0 1 7 7Z" />
    <path d="M9.5 12h.01M13 12h.01M16.5 12h.01" />
  </svg>
);

export const IconPencil = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
    <path d="M14.5 6.5l3 3" />
  </svg>
);

export const IconChart = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 20V10m5 10V4m5 16v-7m5 7V8" />
  </svg>
);

export const IconBook = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const IconArrow = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const IconFlame = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21c3.3 0 6-2.5 6-5.8 0-4.5-4.2-5.4-4.2-9.2C12 5 8.5 6.6 8.5 9.6c0 1.4.6 2.4.6 3.4 0 1-.8 1.6-1.6 1.6-1 0-1.7-.6-2-1.6 0 4.3 2.3 9 6.5 9Z" />
  </svg>
);

export const IconGlobe = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconMedal = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M9 13.7 7.5 21l4.5-2.4L16.5 21 15 13.7" />
  </svg>
);

export const IconTarget = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconFile = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 3.5h7.5L19 9v11.5H6V3.5Z" />
    <path d="M13.5 3.5V9H19" />
  </svg>
);

export const IconLogout = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M15 17l5-5-5-5" />
    <path d="M20 12H9" />
    <path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
  </svg>
);