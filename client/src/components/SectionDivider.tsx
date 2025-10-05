import theme from '../theme/theme';

interface SectionDividerProps {
  position: 'top' | 'bottom';
  color?: string;
  invert?: boolean;
}

export default function SectionDivider({
  position,
  color = theme.colors.sage,
  invert = false,
}: SectionDividerProps) {
  return (
    <div
      className={`section-divider section-divider-${position} ${invert ? 'invert' : ''}`}
      style={{ color }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,0L120,5.3C240,11,480,21,720,32C960,43,1200,53,1320,53.3L1440,53L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
        ></path>
      </svg>
    </div>
  );
}
