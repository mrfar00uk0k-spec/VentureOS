"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "At least 8 characters."),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      setConfirmedEmail(values.email);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (confirmedEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <GlassCard className="w-full max-w-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Check your email</h1>
          <p className="mt-2 text-sm text-text-secondary">
            We sent a verification link to {confirmedEmail}. Confirm it, then log in.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-text-secondary">Start validating in minutes.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-tertiary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-bright hover:underline">
            Log in
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
