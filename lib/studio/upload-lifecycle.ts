/** Verify the object after any transfer result: duplicate responses vary by Storage version. */
export async function finishStudioUpload(
  ticket: { uploaded?: boolean },
  transfer: () => Promise<{ error: unknown }>,
  finalize: () => Promise<unknown>,
) {
  if (!ticket.uploaded) {
    try { ticket.uploaded = !(await transfer()).error; }
    catch { ticket.uploaded = false; }
  }
  // Only the authenticated server's object inspection can establish that upload succeeded.
  // Failure retains the same ticket so retry cannot create a duplicate registered asset.
  await finalize();
}
