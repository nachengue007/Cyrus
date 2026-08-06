import { getContactsAction } from "@/src/server/modules/contacts/contacts.actions";
import { CreateContactForm } from "./create-contact-form";

export default async function ContactsPage() {
  const result = await getContactsAction();

  if (!result.success) return <p>Error: {result.error}</p>;

  console.log(result);
  return (
    <div>
      <h1>Crear contacto</h1>
      <CreateContactForm />
      <hr />
      <ul>
        {result.data.map((contact) => (
          <li key={contact.id}>{contact.name} {contact.company} {contact.email}</li>
        ))}
      </ul>
    </div>
  );
}
