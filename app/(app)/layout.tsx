import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getUnreadNotifications } from "@/services/notification.service";
import { getProfile } from "@/services/profile.service";
import { AppHeader } from "@/features/app/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let notifications: Awaited<ReturnType<typeof getUnreadNotifications>> = [];
  let avatarUrl: string | null = null;
  try {
    if (user) {
      const [business, profile] = await Promise.all([
        getBusinessByOwner(supabase, user.id),
        getProfile(supabase, user.id),
      ]);
      avatarUrl = profile.avatar_url;
      if (business) {
        notifications = await getUnreadNotifications(supabase, business.id);
      }
    }
  } catch {
    // Las notificaciones/avatar no deben poder tirar abajo la navegación de toda la app.
  }

  return (
    <>
      <AppHeader notifications={notifications} avatarUrl={avatarUrl} />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
