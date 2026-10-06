/**
 * FAQ shown on /contact. Kept in lib (not in the page) so both the server
 * page — which builds the FAQPage JSON-LD — and the client form component
 * that renders the list read the exact same source.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const CONTACT_FAQ: FaqItem[] = [
  {
    question: "How quickly will I hear back?",
    answer:
      "Every enquiry gets a reply within 4 business hours, Monday to Saturday. If it is urgent, message us on WhatsApp and we will pick it up the same day.",
  },
  {
    question: "Do you work to a fixed price?",
    answer:
      "Yes. After a short scoping call we send a fixed quote with deliverables, timeline and payment milestones — no open-ended hourly billing.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A marketing site runs 3 to 5 weeks, an app or custom platform 8 to 14 weeks. You get a dated plan before work starts and a staging link to review each week.",
  },
  {
    question: "Will my information stay private?",
    answer:
      "Yes. We sign an NDA before any detailed discussion and your files, credentials and customer data stay on accounts you control.",
  },
  {
    question: "Can you work with our team remotely?",
    answer:
      "Yes — we are based in Noida, Uttar Pradesh and work remotely with teams across India and further time zones. Every engagement runs on a shared board with weekly demos and written status updates, so nobody has to be in a meeting to know where the project stands.",
  },
];
