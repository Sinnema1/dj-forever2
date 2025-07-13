import React, { useState, ReactNode } from "react";
import "../assets/FAQ.css";

export interface FAQ {
  question: string;
  answer: ReactNode;
}

const faqs: FAQ[] = [
  {
    question: "What is the dress code?",
    answer: "Semi-formal attire is recommended.",
  },
  {
    question: "Can I bring a plus one?",
    answer: "Please refer to your invitation for details about guests.",
  },
  {
    question: "Is there parking at the venue?",
    answer: "Yes, free parking is available on site.",
  },
  {
    question: "Are children welcome?",
    answer: "Children are welcome unless otherwise noted on your invitation.",
  },
];

const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className="faq-accordion">
      {faqs.map((faq, idx) => (
        <div key={idx} className="faq-item">
          <button
            className={`faq-question ${openIndex === idx ? "open" : ""}`}
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
              openIndex === idx ? "expanded" : ""
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