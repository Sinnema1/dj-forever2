import React, { useState, ReactNode } from 'react';
// Styles now imported globally via main.tsx

/**
 * Interface for FAQ data structure
 */
export interface FAQ {
  /** The question text */
  question: string;
  /** The answer content - can include React elements */
  answer: ReactNode;
}

/**
 * Static FAQ data for the wedding website
 */
const faqs: FAQ[] = [
  {
    question: 'What is the dress code?',
    answer: 'Semi-formal attire is recommended.',
  },
  {
    question: 'Can I bring a plus one?',
    answer: 'Please refer to your invitation for details about guests.',
  },
  {
    question: 'Is there parking at the venue?',
    answer: 'Yes, free parking is available on site.',
  },
  {
    question: 'Are children welcome?',
    answer: 'Children are welcome unless otherwise noted on your invitation.',
  },
];

/**
 * FAQAccordion - Collapsible Frequently Asked Questions Component
 *
 * An accessible accordion component that displays wedding-related FAQs.
 * Each question can be clicked to expand and reveal the answer. Only one
 * section can be open at a time for a clean, organized presentation.
 *
 * @features
 * - **Accessibility**: Proper ARIA attributes and keyboard navigation
 * - **Single Panel**: Only one FAQ open at a time for clarity
 * - **Smooth Animation**: CSS transitions for expand/collapse
 * - **Flexible Content**: Supports rich content in answers (React elements)
 * - **Responsive Design**: Mobile-friendly touch targets
 * - **Semantic HTML**: Uses proper button and heading structure
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FAQAccordion />
 *
 * // The component renders all predefined FAQs
 * // Users can click questions to toggle answers
 * ```
 *
 * @accessibility
 * - Uses `button` elements for proper keyboard navigation
 * - Implements `aria-expanded` for screen readers
 * - Provides clear focus indicators
 * - Supports Enter and Space key activation
 */
const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className="faq-accordion">
      {faqs.map((faq, idx) => (
        <div key={faq.question} className="faq-item">
          <button
            className={`faq-question ${openIndex === idx ? 'open' : ''}`}
            onClick={() => toggle(idx)}
            aria-expanded={openIndex === idx}
          >
            <span>{faq.question}</span>
            <svg
              className="faq-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <line
                x1="10"
                y1="4"
                x2="10"
                y2="16"
                stroke="currentColor"
                strokeWidth="2"
                className="vertical"
              />
              <line
                x1="4"
                y1="10"
                x2="16"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
                className="horizontal"
              />
            </svg>
          </button>
          <div
            className={`faq-answer-wrapper ${
              openIndex === idx ? 'expanded' : ''
            }`}
          >
            <div className="faq-answer">{faq.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
