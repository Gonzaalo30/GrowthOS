import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getUnreadNotifications } from "@/services/notification.service";
import { AppHeader } from "@/features/app/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let notifications: Awaited<ReturnType<typeof getUnreadNotifications>> = [];
  try {
    if (user) {
      const business = await getBusinessByOwner(supabase, user.id);
      if (business) {
        notifications = await getUnreadNotifications(supabase, business.id);
      }
    }
  } catch {
    // Las notificaciones no deben poder tirar abajo la navegación de toda la app.
  }

  return (
    <>
      <AppHeader notifications={notifications} />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
