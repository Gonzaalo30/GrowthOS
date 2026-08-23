import { createClient } from "@/lib/supabase/server";
import { getBusinessesByOwner } from "@/services/business.service";
import { getUnreadNotifications } from "@/services/notification.service";
import { getProfile } from "@/services/profile.service";
import { AppHeader } from "@/features/app/AppHeader";
import { MobileBottomNav } from "@/features/app/MobileBottomNav";
import { CommandPalette } from "@/features/app/CommandPalette";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let notifications: Awaited<ReturnType<typeof getUnreadNotifications>> = [];
  let avatarUrl: string | null = null;
  let xp: number | null = null;
  let businesses: { id: string; domain: string }[] = [];
  let activeBusinessId: string | null = null;
  try {
    if (user) {
      const [allBusinesses, profile] = await Promise.all([
        getBusinessesByOwner(supabase, user.id),
        getProfile(supabase, user.id),
      ]);
      avatarUrl = profile.avatar_url;
      businesses = allBusinesses.map((b) => ({ id: b.id, domain: b.domain }));
      const active =
        allBusinesses.find((b) => b.id === profile.active_business_id) ??
        allBusinesses[allBusinesses.length - 1];
      if (active) {
        activeBusinessId = active.id;
        notifications = await getUnreadNotifications(supabase, active.id);
        xp = active.xp;
      }
    }
  } catch {
    // Las notificaciones/avatar/XP no deben poder tirar abajo la navegación de toda la app.
  }

  return (
    <>
      <AppHeader
        notifications={notifications}
        avatarUrl={avatarUrl}
        xp={xp}
        businesses={businesses}
        activeBusinessId={activeBusinessId}
      />
      <div className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</div>
      <MobileBottomNav />
      <CommandPalette />
    </>
  );
}
