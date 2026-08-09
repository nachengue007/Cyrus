"use client";

import { useState } from "react";
import { sendEmailAction } from "@/src/server/modules/email/email.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { CheckCircle2, XCircle, Send, Loader2 } from "lucide-react";

type Contact = { id: string; name: string | null };
type Template = { id: string; name: string | null };

interface Props {
  contactList: Contact[];
  templateList: Template[];
}

type SendResult =
  | { type: "success"; email: string; subject: string }
  | { type: "error"; message: string };

export function SendEmailForm({ contactList, templateList }: Props) {
  const [contactId, setContactId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId || !templateId) return;

    setLoading(true);
    setResult(null);

    const res = await sendEmailAction({ contactId, templateId });

    if (res.success) {
      setResult({
        type: "success",
        email: res.data.contactEmail,
        subject: res.data.subject,
      });
      setContactId("");
      setTemplateId("");
    } else {
      setResult({ type: "error", message: res.error });
    }

    setLoading(false);
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Send className="h-4 w-4" />
          Nuevo envío
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact selector */}
          <div className="grid gap-2">
            <Label htmlFor="contact">Contacto</Label>
            {contactList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay contactos registrados.{" "}
                <a href="/contacts" className="underline">
                  Agregar contacto
                </a>
              </p>
            ) : (
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger id="contact" className="w-full">
                  <SelectValue placeholder="Selecciona un contacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contactList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name ?? c.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Template selector */}
          <div className="grid gap-2">
            <Label htmlFor="template">Plantilla</Label>
            {templateList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay plantillas registradas.{" "}
                <a href="/templates" className="underline">
                  Agregar plantilla
                </a>
              </p>
            ) : (
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {templateList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name ?? t.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Feedback */}
          {result?.type === "success" && (
            <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">¡Email enviado correctamente!</p>
                <p className="text-xs mt-0.5">
                  Para: {result.email} · Asunto: {result.subject}
                </p>
              </div>
            </div>
          )}

          {result?.type === "error" && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200">
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Error al enviar</p>
                <p className="text-xs mt-0.5">{result.message}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !contactId || !templateId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
