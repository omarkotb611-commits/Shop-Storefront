import { routeNotReady } from "@/lib/route-placeholder";

export async function GET() {
  return routeNotReady("Product details");
}
