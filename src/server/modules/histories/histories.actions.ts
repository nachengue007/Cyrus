"use server"

import type { 
  History, 
  CreateHistoryInput, 
  UpdateHistoryInput,
  HistorySelect,
  Contacts,
  Templates,
} from "./histories.repository";

import {
  createNewHistory,
  deleteExistingHistory,
  getAllHistories,
  updateExistingHistory,
  listAllContactsAndTemplates,
} from "./histories.service";

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function getHistoriesAction(): Promise<ActionResult<HistorySelect[]>> {
  try {
    const data = await getAllHistories();
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function createHistoryAction(
  input: CreateHistoryInput
): Promise<ActionResult<History>> {
  try{
    const data = await createNewHistory(input);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getContactsAndTemplatesAction(): Promise<ActionResult<{ contactList: Contacts[]; templateList: Templates[] }>> {
  try {
    const data = await listAllContactsAndTemplates();
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateHistoryAction(
  id: string,
  input: UpdateHistoryInput
): Promise<ActionResult<History>> {
  try {
    const data = await updateExistingHistory(id, input);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteHistoryAction(
  id: string
): Promise<ActionResult<History>> {
  try {
    const data = await deleteExistingHistory(id);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}