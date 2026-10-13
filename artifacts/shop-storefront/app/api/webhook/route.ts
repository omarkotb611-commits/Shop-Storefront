import { routeNotReady } from "@/lib/route-placeholder";

export async function POST() {
  return routeNotReady("Stripe webhook");
}
