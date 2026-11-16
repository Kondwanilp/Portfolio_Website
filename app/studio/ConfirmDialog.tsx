"use client";

import { useEffect, useId, useRef } from "react";

export default function ConfirmDialog({ open, title, description, onConfirm, onClose }: { open: boolean; title: string; description: string; onConfirm: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (open) element?.showModal();
    else element?.close();
  }, [open]);
  return (
    <dialog ref={dialog} className="studio-dialog" aria-labelledby={titleId} onCancel={onClose} onClose={onClose}>
      <h2 id={titleId}>{title}</h2><p>{description}</p>
      <div className="studio-actions"><button type="button" onClick={onClose} autoFocus>Keep editing</button><button type="button" className="studio-primary" onClick={onConfirm}>Confirm</button></div>
    </dialog>
  );
}
