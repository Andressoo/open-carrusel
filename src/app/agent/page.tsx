import { redirect } from "next/navigation";

// Superseded by /brief/new (single mode uses the same /api/agent/chat).
export default function AgentRedirect() {
  redirect("/brief/new");
}
