import { 
  findAllHistories, 
  createHistory,
  findHistoryById,
  updateHistory,
  deleteHistory,
  listContactsAndTemplates,
  type History,
  type CreateHistoryInput,
  type UpdateHistoryInput,
  type HistorySelect,
  type Contacts,
  type Templates,
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

export async function listAllContactsAndTemplates(): Promise<{ contactList: Contacts[]; templateList: Templates[] }> {
  return listContactsAndTemplates();
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