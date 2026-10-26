import { redirect } from "next/navigation";

import { getSession } from "@/app/server/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
