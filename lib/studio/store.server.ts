import "server-only";
import { requireStudioContext } from "./auth.server";
import { createStudioRepository } from "./repository";

export async function studioStore() {
  const { client } = await requireStudioContext();
  return { ...createStudioRepository(client), client };
}
