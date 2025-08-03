import React, { useState } from "react";

interface RSVPHelpTooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function RSVPHelpTooltip({
  content,
  children,
}: RSVPHelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="rsvp-tooltip-container">
      <div
        className="rsvp-tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children}
      </div>
      {isVisible && (
        <div
          id="tooltip-content"
          className="rsvp-tooltip-content"
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
