interface Props { size?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const HomeIcon = ({ size = 22 }: Props) => (
  <svg {...base(size)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>
);

export const CalendarIcon = ({ size = 22 }: Props) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
);

export const ChartIcon = ({ size = 22 }: Props) => (
  <svg {...base(size)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);

export const MealIcon = ({ size = 22 }: Props) => (
  <svg {...base(size)}><path d="M6 3v8a3 3 0 0 0 6 0V3" /><path d="M9 11v10" /><path d="M17.5 3c-1.4 1.6-2 3.6-2 5.6 0 1.6.7 2.6 2 2.9V21" /></svg>
);

export const UserIcon = ({ size = 22 }: Props) => (
  <svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
);

export const CheckIcon = ({ size = 20 }: Props) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M4.5 12.5 9.5 17.5 19.5 6.5" /></svg>
);

export const ChevronRight = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M9 5l7 7-7 7" /></svg>
);

export const ChevronDown = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M5 9l7 7 7-7" /></svg>
);

export const ChevronLeft = ({ size = 20 }: Props) => (
  <svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>
);

export const PlayIcon = ({ size = 18 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
);

export const TimerIcon = ({ size = 20 }: Props) => (
  <svg {...base(size)}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
);

export const PlusIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
);

export const MinusIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M5 12h14" /></svg>
);

export const CloseIcon = ({ size = 20 }: Props) => (
  <svg {...base(size)} strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export const FlameIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.2 1.5 1 2.5 2 2.5 1.2 0 1.8-1.2 1.5-3-.2-1.6-.5-3-.5-4z" /></svg>
);

export const TrophyIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7 11M17 6h3v1.5A3.5 3.5 0 0 1 17 11" /><path d="M12 14v3M9 20h6M10 17h4" /></svg>
);

export const CameraIcon = ({ size = 20 }: Props) => (
  <svg {...base(size)}><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.1-2h7.4l1.1 2h1.7A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" /><circle cx="12" cy="13" r="3.5" /></svg>
);

export const TrashIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
);

export const HeartIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20z" /></svg>
);

export const InfoIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);

export const DownloadIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" /></svg>
);

export const UploadIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14" /></svg>
);

export const MoonIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
);

export const WalkIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><circle cx="13" cy="4" r="1.8" /><path d="M11 21l1.5-6L9.5 12l1-5 3.5 2 2.5 2M10.5 21 8 17M12.5 15l3 2 .5 4" /></svg>
);

export const DropIcon = ({ size = 18 }: Props) => (
  <svg {...base(size)}><path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3z" /></svg>
);
