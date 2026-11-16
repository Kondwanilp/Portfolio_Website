import Link from "next/link";
import AdminLogin from "../extras/court-vision-admin/AdminLogin";
import StudioSession from "./StudioSession";

export default function StudioAccess() {
  return (
    <main id="main-content" tabIndex={-1} className="studio-access">
      <Link href="/" className="studio-back">Return to portfolio</Link>
      <StudioSession openOnConnect />
      <AdminLogin sessionError="" heading="The Studio." description="Your private workspace for the portfolio. Sign in with your owner account." />
    </main>
  );
}
