import { redirect } from "next/navigation";

/** Compatibilidade: `/login` redireciona para `/` preservando callbackUrl. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const homeUrl = params.callbackUrl
    ? `/?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
    : "/";
  redirect(homeUrl);
}
