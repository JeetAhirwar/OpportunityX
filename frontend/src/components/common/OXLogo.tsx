const OXLogo = ({ className = "h-9 w-9" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="OpportunityX by GhostCode Dynamics">
    <defs>
      <linearGradient id="ox-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(231 92% 66%)" />
        <stop offset="0.55" stopColor="hsl(187 96% 46%)" />
        <stop offset="1" stopColor="hsl(262 83% 62%)" />
      </linearGradient>
      <filter id="ox-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.29 0 0 0 0 0.64 0 0 0 0 1 0 0 0 0.55 0" />
        <feBlend in2="SourceGraphic" mode="screen" />
      </filter>
    </defs>
    <rect width="40" height="40" rx="10" fill="hsl(224 48% 5%)" />
    <rect x="1" y="1" width="38" height="38" rx="9" fill="url(#ox-grad)" opacity="0.18" />
    <path d="M8 30V10l12-5 12 5v20l-12 5-12-5Z" fill="url(#ox-grad)" opacity="0.94" filter="url(#ox-glow)" />
    <path
      d="M8 20c0-4.4 3.1-8 7-8s7 3.6 7 8-3.1 8-7 8-7-3.6-7-8zm3.5 0c0 2.5 1.6 4.5 3.5 4.5s3.5-2 3.5-4.5-1.6-4.5-3.5-4.5-3.5 2-3.5 4.5z"
      fill="white"
    />
    <path
      d="M23.5 28l4.5-8-4.5-8h4l2.5 4.5L32.5 12h4l-4.5 8 4.5 8h-4l-2.5-4.5L27.5 28h-4z"
      fill="white"
    />
    <path
      d="M30 6l3.5 4h-2.2v3h-2.6v-3H26.5L30 6z"
      fill="white"
      opacity="0.9"
    />
  </svg>
);

export default OXLogo;
