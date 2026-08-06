"use client";

import { useState } from "react";
import { createContactAction } from "@/src/server/modules/contacts/contacts.actions";
import { useRouter } from "next/navigation";

export function CreateContactForm() {
  const router = useRouter();
  const [contact, setContact] = useState({
    name: "",
    company: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const result = await createContactAction(contact);

    if (!result.success) {
      setError(result.error);
    } else {
      setContact({ name: "", company: "", email: "" });
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Nombre"
        value={contact.name}
        onChange={(e) => setContact({ ...contact, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Compañía"
        value={contact.company}
        onChange={(e) => setContact({ ...contact, company: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={contact.email}
        onChange={(e) => setContact({ ...contact, email: e.target.value })}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Guardando..." : "Crear contacto"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}