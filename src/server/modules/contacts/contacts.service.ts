import {
  createContact,
  deleteContact,
  findAllContacts,
  findContactById,
  updateContact,
  type Contact,
  type CreateContactInput,
  type UpdateContactInput,
} from "./contacts.repository";

export async function getAllContacts(): Promise<Contact[]> {
  return findAllContacts();
}

export async function getContactById(id: string): Promise<Contact> {
  const contact = await findContactById(id);

  if (!contact) {
    throw new Error(`Contact with id "${id}" not found`);
  }

  return contact;
}

export async function createNewContact(
  data: CreateContactInput
): Promise<Contact> {
  if (!data.name && !data.email) {
    throw new Error("Contact must have at least a name or an email");
  }

  return createContact(data);
}

export async function updateExistingContact(
  id: string,
  data: UpdateContactInput
): Promise<Contact> {
  await getContactById(id);
  return updateContact(id, data);
}

export async function deleteExistingContact(id: string): Promise<Contact> {
  await getContactById(id);
  return deleteContact(id);
}