'use client';

import React, { useState } from 'react';

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-step-border dark:border-step-dark-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex items-center justify-between hover:text-step-primary-600 dark:hover:text-step-primary-500 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-step-text-main dark:text-step-dark-text-main pr-4">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-step-text-muted dark:text-step-dark-text-muted transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  items: { question: string; answer: string }[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <AccordionItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

