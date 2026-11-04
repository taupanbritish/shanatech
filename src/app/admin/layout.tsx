import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Panel Admin",
    template: "%s · Admin SHANATECH",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
