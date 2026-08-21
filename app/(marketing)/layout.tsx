import { Header } from "@/features/landing/Header";
import { Footer } from "@/features/landing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
