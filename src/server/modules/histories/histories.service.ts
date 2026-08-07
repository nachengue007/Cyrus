import { 
  findAllHistories, 
  createHistory,
  findHistoryById,
  updateHistory,
  deleteHistory,
  type History,
  type CreateHistoryInput,
  type UpdateHistoryInput,
  type HistorySelect,
} from "./histories.repository";

export async function getAllHistories(): Promise<HistorySelect[]> {
  return findAllHistories();
}

export async function createNewHistory(
  data: CreateHistoryInput
): Promise<History> {
  if(!data.status && !data.contactId) {
    throw new Error("Missing data");
  }

  return createHistory(data);
}

export async function updateExistingHistory(
  id: string,
  data: UpdateHistoryInput
): Promise<History> {
  await findHistoryById(id);
  return updateHistory(id, data);
}

export async function deleteExistingHistory(id: string): Promise<History> {
  await findHistoryById(id);
  return deleteHistory(id);
}