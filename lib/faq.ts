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
    question: "Do you work with clients outside the UK?",
    answer:
      "We do. Most projects run remotely across UK, EU and India time zones with a shared board, weekly demos and written status updates.",
  },
];
