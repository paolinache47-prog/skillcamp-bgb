import type { ReactNode, SVGProps } from 'react';

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Icon>
    <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon>
    <path d="M9 5.5v13M15 5.5v13" />
  </Icon>
);

export const ReplayIcon = () => (
  <Icon>
    <path d="M4 12a8 8 0 1 0 2.35-5.65" />
    <path d="M4 4.5V8h3.5" />
  </Icon>
);

export const ArrowRightIcon = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const TextIcon = () => (
  <Icon>
    <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />
  </Icon>
);

export const SoundIcon = () => (
  <Icon>
    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Icon>
);

export const MutedIcon = () => (
  <Icon>
    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" />
    <path d="M16 10l4 4M20 10l-4 4" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const InfoIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);
