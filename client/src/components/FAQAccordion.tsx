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
    answer:
      'Semi-formal attire is recommended. The ceremony and reception are outdoors, so consider bringing a light jacket for the evening.',
  },
  {
    question: 'Where is the venue?',
    answer: (
      <>
        Venue at the Grove
        <br />
        7010 S. 27th Ave
        <br />
        Phoenix, AZ 85041
        <br />
        <a
          href="https://www.venueatthegrove.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit venue website
        </a>
      </>
    ),
  },
  {
    question: 'Is the ceremony indoors or outdoors?',
    answer:
      'The ceremony and reception will be held outdoors at Venue at the Grove. An indoor space is available as a backup in case of weather.',
  },
  {
    question: 'Is there parking at the venue?',
    answer: 'Yes, free parking is available on site.',
  },
  {
    question: 'Will there be a bar?',
    answer: 'Yes! An open bar will be provided throughout the evening.',
  },
  {
    question: 'Can I bring a plus one?',
    answer:
      'Please check your RSVP page for details about your party size, or feel free to reach out to Dominique or Justin directly with any questions.',
  },
  {
    question: 'Are children welcome?',
    answer:
      'Please check your RSVP page for details about your party, or reach out to Dominique or Justin if you have questions.',
  },
  {
    question: 'When is the RSVP deadline?',
    answer: 'Please RSVP by September 8, 2026.',
  },
];

/**
 * Accordion component for wedding FAQs with keyboard navigation and ARIA support.
 * Only one panel can be open at a time.
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
