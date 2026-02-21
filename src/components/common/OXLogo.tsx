const OXLogo = ({ className = "h-9 w-9" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ox-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(225 73% 57%)" />
        <stop offset="1" stopColor="hsl(262 83% 58%)" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#ox-grad)" />
    {/* O */}
    <path
      d="M8 20c0-4.4 3.1-8 7-8s7 3.6 7 8-3.1 8-7 8-7-3.6-7-8zm3.5 0c0 2.5 1.6 4.5 3.5 4.5s3.5-2 3.5-4.5-1.6-4.5-3.5-4.5-3.5 2-3.5 4.5z"
      fill="white"
    />
    {/* X with upward arrow on right stroke */}
    <path
      d="M23.5 28l4.5-8-4.5-8h4l2.5 4.5L32.5 12h4l-4.5 8 4.5 8h-4l-2.5-4.5L27.5 28h-4z"
      fill="white"
    />
    {/* Growth arrow */}
    <path
      d="M30 6l3.5 4h-2.2v3h-2.6v-3H26.5L30 6z"
      fill="white"
      opacity="0.9"
    />
  </svg>
);

export default OXLogo;
