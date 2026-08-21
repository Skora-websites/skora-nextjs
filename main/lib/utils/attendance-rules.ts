/**
 * Office Timings: Mon-Fri, 10:00 AM to 7:00 PM (10:00 - 19:00), lunch break 2:00 PM - 2:30 PM (14:00 - 14:30)
 */

export const OFFICE_START_HOUR = 10; // 10:00 AM
export const OFFICE_END_HOUR = 19;   // 7:00 PM
export const LUNCH_START_HOUR = 14;  // 2:00 PM
export const LUNCH_END_HOUR = 14.5;  // 2:30 PM
export const LUNCH_DURATION_HOURS = 0.5; // 30 minutes
export const LATE_THRESHOLD_MINUTES = 15; // Grace period after 10:00 AM

// Half-day session hour ranges
export const HALF_DAY_MORNING_START = 10; // 10:00 AM
export const HALF_DAY_MORNING_END = 14;   // 2:00 PM
export const HALF_DAY_AFTERNOON_START = 14.5; // 2:30 PM
export const HALF_DAY_AFTERNOON_END = 19;     // 7:00 PM

export function evaluatePunchStatus(punchInDate: Date): 'PRESENT' | 'LATE' {
  const hours = punchInDate.getHours();
  const minutes = punchInDate.getMinutes();
  
  if (hours > OFFICE_START_HOUR || (hours === OFFICE_START_HOUR && minutes > LATE_THRESHOLD_MINUTES)) {
    return 'LATE';
  }
  return 'PRESENT';
}

export function calculateOvertimeHours(punchOutDate: Date): number {
  const endOfDay = new Date(punchOutDate);
  endOfDay.setHours(OFFICE_END_HOUR, 0, 0, 0);

  if (punchOutDate > endOfDay) {
    const diffMs = punchOutDate.getTime() - endOfDay.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10;
  }
  return 0;
}

/**
 * Calculate effective work hours, automatically deducting 30-min lunch break
 * if the work window spans the lunch period (14:00 - 14:30).
 */
export function calculateEffectiveWorkHours(punchIn: Date, punchOut: Date): number {
  const totalMs = punchOut.getTime() - punchIn.getTime();
  let totalHours = totalMs / (1000 * 60 * 60);

  // Check if work spans the lunch break
  const punchInHour = punchIn.getHours() + punchIn.getMinutes() / 60;
  const punchOutHour = punchOut.getHours() + punchOut.getMinutes() / 60;

  if (punchInHour < LUNCH_START_HOUR && punchOutHour > LUNCH_END_HOUR) {
    // Work spans full lunch break — deduct 30 minutes
    totalHours -= LUNCH_DURATION_HOURS;
  }

  return Math.max(0, Math.round(totalHours * 10) / 10);
}

/**
 * Get effective work hours for a half-day session.
 */
export function getHalfDayHours(session: 'MORNING' | 'AFTERNOON'): number {
  if (session === 'MORNING') {
    return HALF_DAY_MORNING_END - HALF_DAY_MORNING_START; // 4 hours
  }
  return HALF_DAY_AFTERNOON_END - HALF_DAY_AFTERNOON_START; // 4.5 hours
}

export function getEscalationTargetRole(userRole: string): 'MANAGER' | 'SUPER_ADMIN' {
  if (userRole === 'HR_ADMIN' || userRole === 'MANAGER') {
    return 'SUPER_ADMIN';
  }
  return 'MANAGER'; // Default for standard employees
}
