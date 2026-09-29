/**
 * Shared classes for the admin UI.
 *
 * These were copy-pasted verbatim across the SEO editor, post editor, blog
 * list, leads list, settings and login screens — keeping them here means a
 * styling change is made once instead of a dozen times.
 */

/** Compact input used by the SEO editor and the post editor. */
export const inputClass =
  "w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2.5 text-xs text-[#0B1310] font-bold placeholder:font-medium placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none transition-colors";

/** Label paired with `inputClass`. */
export const labelClass =
  "text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5";

/** Roomier input used by the settings screen (text values, passwords). */
export const inputClassLg =
  "w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]";

/** Input with padding for a leading icon (login screen). */
export const inputClassIcon =
  "w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors font-mono";

/** Label paired with `inputClassLg`. */
export const labelClassLg = "text-slate-600 font-bold uppercase block";

/** Label paired with `inputClassIcon`. */
export const labelClassIcon =
  "text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block";

/** Search field used at the top of the blog and leads lists. */
export const searchInputClass =
  "w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors shadow-sm";

/** Filter select used next to `searchInputClass`. */
export const searchSelectClass =
  "w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors cursor-pointer appearance-none font-mono shadow-sm";

/** Data table used by the blog and leads lists. */
export const adminTableClass = "w-full text-left text-xs text-slate-700";
