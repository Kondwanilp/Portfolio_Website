"use client";

import { CourtDashboard } from "../../extras/court-vision-admin/CourtAdmin";
import { useCourtAuth } from "../../extras/court-vision-admin/useCourtAuth";
import Feedback from "../../components/Feedback";

export default function StudioCourtPage() {
  const auth = useCourtAuth();
  if (auth.checking) return <Feedback kind="loading">Opening Court Vision...</Feedback>;
  if (!auth.ownerId) return <Feedback kind="error">Reconnect your owner account to manage Court Vision.</Feedback>;
  return <div className="studio-court"><CourtDashboard ownerId={auth.ownerId} today={auth.today} embedded /></div>;
}
