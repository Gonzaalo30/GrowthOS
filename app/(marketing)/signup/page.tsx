import { SignupForm } from "@/features/auth/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; error?: string }>;
}) {
  const { domain, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <SignupForm domain={domain} error={error} />
    </div>
  );
}
