"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";

const newProjectSchema = z.object({
  name: z.string().min(2, "Give your project a short name.").max(120),
  idea: z.string().min(10, "A sentence or two is enough to start.").max(2000),
});
type NewProjectValues = z.infer<typeof newProjectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewProjectValues>({ resolver: zodResolver(newProjectSchema) });

  async function onSubmit(values: NewProjectValues) {
    setFormError(null);
    try {
      const { data: project } = await apiClient.post("/projects", values);
      await apiClient.post("/analysis/start", { projectId: project.id, idea: values.idea });
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-text-primary">Describe your idea</h1>
      <p className="mt-1 text-sm text-text-secondary">
        One or two sentences is enough — the AI researches the rest.
      </p>

      <GlassCard className="mt-6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Project name" error={errors.name?.message} {...register("name")} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Your idea</label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-300 ease-out-expo focus:border-accent focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(61,107,255,0.15)]"
              placeholder="e.g. An AI-powered CRM built specifically for dental clinics"
              {...register("idea")}
            />
            {errors.idea?.message && <p className="mt-1.5 text-xs text-red-400">{errors.idea.message}</p>}
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Starting validation..." : "Start Validation"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
