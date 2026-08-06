"use server";

import type { Contact, CreateContactInput, UpdateContactInput } from "./contacts.repository";
import {
  createNewContact,
  deleteExistingContact,
  getAllContacts,
  getContactById,
  updateExistingContact,
} from "./contacts.service";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getContactsAction(): Promise<ActionResult<Contact[]>> {
  try {
    const data = await getAllContacts();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getContactByIdAction(
  id: string
): Promise<ActionResult<Contact>> {
  try {
    const data = await getContactById(id);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function createContactAction(
  input: CreateContactInput
): Promise<ActionResult<Contact>> {
  try {
    const data = await createNewContact(input);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateContactAction(
  id: string,
  input: UpdateContactInput
): Promise<ActionResult<Contact>> {
  try {
    const data = await updateExistingContact(id, input);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteContactAction(
  id: string
): Promise<ActionResult<Contact>> {
  try {
    const data = await deleteExistingContact(id);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}