import { NextResponse } from "next/server";

export function routeNotReady(feature: string) {
  return NextResponse.json(
    { error: `${feature} is scaffolded but not implemented yet.` },
    { status: 501 },
  );
}
