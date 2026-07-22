"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  userId: string;
  schoolId: string;
  fullName: string;
  role: string;
}

async function fetchUserProfile(): Promise<UserProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: staff } = await supabase
    .from("staff")
    .select("school_id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!staff) throw new Error("Staff profile not found");

  return {
    userId: user.id,
    schoolId: staff.school_id,
    fullName: staff.full_name || "Admin",
    role: staff.role || "admin",
  };
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolId() {
  const { data } = useUserProfile();
  return data?.schoolId || "";
}

export function useUserId() {
  const { data } = useUserProfile();
  return data?.userId || "";
}
