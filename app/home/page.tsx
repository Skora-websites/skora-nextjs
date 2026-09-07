import { redirect } from "next/navigation";

/** /home is consolidated into the canonical landing page at /. */
export default function HomeRedirect() {
  redirect("/");
}
