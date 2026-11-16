import type { ReactNode } from "react";

type FeedbackProps = {
  kind: "loading" | "empty" | "error" | "success";
  children: ReactNode;
  title?: string;
  action?: ReactNode;
};

export default function Feedback({ kind, children, title, action }: FeedbackProps) {
  return (
    <div className={`feedback feedback--${kind}`} role={kind === "error" ? "alert" : "status"}>
      {title && <h3>{title}</h3>}
      <div>{children}</div>
      {action && <div className="feedback-action">{action}</div>}
    </div>
  );
}
