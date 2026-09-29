"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ContactModal from "@/components/ContactModal";

interface ConsultationState {
  /** Opens the shared consultation modal, optionally pre-selecting a service. */
  openConsultation: (service?: string) => void;
  /** Closes the shared consultation modal. */
  closeConsultation: () => void;
}

const ConsultationContext = createContext<ConsultationState>({
  openConsultation: () => {},
  closeConsultation: () => {},
});

/**
 * One consultation modal for the whole site.
 *
 * The modal (and the navbar/progress bar around it) live in the root layout,
 * outside ScrollSmoother's transformed wrapper — fixed-positioned elements
 * inside the wrapper would scroll away with the content. Pages and components
 * ask for it through this context instead of each mounting their own copy.
 */
export function ConsultationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [service, setService] = useState("");

  const openConsultation = useCallback((nextService?: string) => {
    setService(nextService ?? "");
    setIsOpen(true);
  }, []);

  const closeConsultation = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openConsultation, closeConsultation }),
    [openConsultation, closeConsultation]
  );

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      <ContactModal
        isOpen={isOpen}
        onClose={closeConsultation}
        defaultService={service}
      />
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  return useContext(ConsultationContext);
}
