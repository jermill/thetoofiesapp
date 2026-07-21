/** Flat nav icons — stroke, currentColor, no emoji/unicode placeholders. */

import type { ReactNode } from 'react';

type IconProps = { size?: number; className?: string };

function Svg({
  size = 22,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  );
}

export function IconMove(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="5.5" r="2" />
      <path d="M10.2 8.2 8.4 12.5l2.8 1.6-1.2 5.4" />
      <path d="M8.4 12.5 5.2 14.2" />
      <circle cx="16.2" cy="5.8" r="2" />
      <path d="M14.6 8.6 16.5 12l-2.4 2 1.6 4.8" />
      <path d="M16.5 12 19.4 13.4" />
    </Svg>
  );
}

export function IconLog(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function IconBuddies(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8.2" cy="8" r="2.4" />
      <path d="M3.8 18.2c.4-2.8 2.2-4.2 4.4-4.2s4 1.4 4.4 4.2" />
      <circle cx="16.2" cy="8.4" r="2.2" />
      <path d="M12.6 18.2c.5-2.4 2-3.6 3.6-3.6 2 0 3.6 1.4 4 3.6" />
    </Svg>
  );
}

export function IconYou(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c.8-3.4 3-5.1 6.5-5.1s5.7 1.7 6.5 5.1" />
    </Svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 13.4 9l5.1 1.4-5.1 1.4L12 17.2l-1.4-5.4L5.5 10.4 10.6 9 12 3.5Z" />
    </Svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 10.2a5 5 0 0 1 10 0c0 4.2 1.4 5.4 1.4 5.4H5.6S7 14.4 7 10.2Z" />
      <path d="M10.2 18.2a1.8 1.8 0 0 0 3.6 0" />
    </Svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 8.5h3l1.4-2h6.2l1.4 2H19.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.2" r="3.1" />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s6-5.2 6-10.2A6 6 0 0 0 6 10.8C6 15.8 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.1" />
    </Svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 19 6.2v5.4c0 4.4-2.9 7.4-7 8.9-4.1-1.5-7-4.5-7-8.9V6.2L12 3.5Z" />
    </Svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19.2 5.8 13.4a3.8 3.8 0 0 1 5.4-5.4l.8.8.8-.8a3.8 3.8 0 1 1 5.4 5.4L12 19.2Z" />
    </Svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15.2 3.8A7.8 7.8 0 1 0 20.2 14 6.2 6.2 0 0 1 15.2 3.8Z" />
    </Svg>
  );
}

export function IconWidget(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </Svg>
  );
}
