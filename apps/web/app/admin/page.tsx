"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { apiClient } from "@/lib/api-client";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  createdAt: string;
}

interface AdminStats {
  userCount: number;
  projectCount: number;
  completedCount: number;
  averageScore: number | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  useEffect(() => {
    apiClient
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => undefined);
    apiClient
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-text-primary">Admin</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Users</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats?.userCount ?? "–"}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Projects</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats?.projectCount ?? "–"}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Completed</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats?.completedCount ?? "–"}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Avg score</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats?.averageScore ?? "–"}</p>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-text-tertiary">
            <tr>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Credits</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-3 text-text-primary">{u.email}</td>
                <td className="px-5 py-3 text-text-secondary">{u.role}</td>
                <td className="px-5 py-3 text-text-secondary">{u.credits}</td>
                <td className="px-5 py-3 text-text-tertiary">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
