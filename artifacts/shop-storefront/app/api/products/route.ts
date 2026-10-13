import { routeNotReady } from "@/lib/route-placeholder";

export async function GET() {
  return routeNotReady("Product list");
}

export async function POST() {
  return routeNotReady("Product creation");
}
