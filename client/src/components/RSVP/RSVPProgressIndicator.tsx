import React from "react";

interface RSVPProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function RSVPProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: RSVPProgressIndicatorProps) {
  return (
    <div className="rsvp-progress-container">
      <div className="rsvp-progress-bar">
        <div
          className="rsvp-progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="rsvp-progress-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`rsvp-progress-step ${
              index < currentStep
                ? "completed"
                : index === currentStep
                  ? "current"
                  : "pending"
            }`}
          >
            <div className="step-indicator">
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
