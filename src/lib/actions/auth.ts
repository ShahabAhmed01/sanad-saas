"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, staffInvitationEmail, welcomeEmail } from "@/lib/email/resend";
import { z } from "zod";

const signupSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  adminName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  boardType: z.enum(["matric_fsc", "cambridge_o_a_level", "montessori", "mixed"]),
  city: z.string().min(1, "City is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export async function signupSchool(input: SignupInput) {
  const validated = signupSchema.parse(input);

  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: validated.email,
    password: validated.password,
    email_confirm: true,
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // 2. Create school
  let slug = validated.schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Ensure slug uniqueness
  const { data: existingSlug } = await admin
    .from("schools")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existingSlug) {
    slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({
      name: validated.schoolName,
      slug,
      board_type: validated.boardType,
      city: validated.city,
      email: validated.email,
      status: "trialing",
      trial_ends_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (schoolError) {
    // Rollback: delete the auth user
    await admin.auth.admin.deleteUser(userId);
    return { error: "Failed to create school. Please try again." };
  }

  // 3. Create staff record for the school admin
  const { error: staffError } = await admin.from("staff").insert({
    id: userId,
    school_id: school.id,
    full_name: validated.adminName,
    role: "school_admin",
    status: "active",
  });

  if (staffError) {
    // Rollback: delete school and auth user
    await admin.from("schools").delete().eq("id", school.id);
    await admin.auth.admin.deleteUser(userId);
    return { error: "Failed to create admin account. Please try again." };
  }

  // 4. Sign in the user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (signInError) {
    // Account created but couldn't sign in — user can log in manually
    return { success: true, needsLogin: true, schoolId: school.id };
  }

  // 5. Send welcome email
  await sendEmail({
    to: validated.email,
    subject: `Welcome to Sanad — ${validated.schoolName}`,
    html: welcomeEmail(validated.schoolName, validated.adminName),
  });

  return { success: true, schoolId: school.id };
}

export async function inviteStaff(input: {
  email: string;
  name: string;
  role: string;
  schoolId: string;
}) {
  const admin = createAdminClient();

  // 1. Create auth user with temporary password
  const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Create staff record
  const { error: staffError } = await admin.from("staff").insert({
    id: authData.user.id,
    school_id: input.schoolId,
    full_name: input.name,
    role: input.role,
    status: "active",
  });

  if (staffError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to create staff record." };
  }

  // 3. Send invitation email via Resend
  const { data: school } = await admin
    .from("schools")
    .select("name")
    .eq("id", input.schoolId)
    .single();

  await sendEmail({
    to: input.email,
    subject: `You've been invited to join ${school?.name || "Sanad"}`,
    html: staffInvitationEmail(
      school?.name || "Sanad",
      input.name,
      input.role,
      tempPassword
    ),
  });

  return { success: true, temporaryPassword: tempPassword };
}
