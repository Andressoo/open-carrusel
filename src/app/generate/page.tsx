import { redirect } from "next/navigation";

// Superseded by /brief/new (batch mode uses the same /api/ai/generate-batch).
export default function GenerateRedirect() {
  redirect("/brief/new");
}
