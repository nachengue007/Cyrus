"use client";

import { useState } from "react";
import type { BatchEvent } from "@/src/app/api/send-batch/route";
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
import { CheckCircle2, XCircle, Send, Loader2, Clock, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Contact = { id: string; name: string | null };
type Template = { id: string; name: string | null };

interface Props {
  contactList: Contact[];
  templateList: Template[];
}

type ItemStatus =
  | { state: "pending" }
  | { state: "sending" }
  | { state: "sent"; email: string; subject: string }
  | { state: "error"; message: string }
  | { state: "waiting"; seconds: number };

interface QueueItem {
  contactId: string;
  contactName: string;
  status: ItemStatus;
}

export function SendEmailForm({ contactList, templateList }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [summary, setSummary] = useState<{ sent: number; failed: number } | null>(null);

  function toggleContact(id: string | null) {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function removeContact(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function updateQueueItem(contactId: string, status: ItemStatus) {
    setQueue((prev) =>
      prev.map((item) => (item.contactId === contactId ? { ...item, status } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0 || !templateId) return;

    const contactNames: Record<string, string> = {};
    const initialQueue: QueueItem[] = selectedIds.map((id) => {
      const name = contactList.find((c) => c.id === id)?.name ?? id;
      contactNames[id] = name;
      return { contactId: id, contactName: name, status: { state: "pending" } };
    });

    setQueue(initialQueue);
    setSummary(null);
    setLoading(true);

    const res = await fetch("/api/send-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactIds: selectedIds, templateId, contactNames }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const dataLine = line.replace(/^data: /, "").trim();
        if (!dataLine) continue;

        try {
          const event = JSON.parse(dataLine) as BatchEvent;

          switch (event.type) {
            case "sending":
              updateQueueItem(event.contactId, { state: "sending" });
              break;

            case "sent":
              updateQueueItem(event.contactId, {
                state: "sent",
                email: event.contactEmail,
                subject: event.subject,
              });
              break;

            case "error":
              updateQueueItem(event.contactId, {
                state: "error",
                message: event.message,
              });
              break;

            case "waiting":
              // Mark the next pending item as waiting
              setQueue((prev) => {
                const nextIndex = prev.findIndex((i) => i.status.state === "pending");
                if (nextIndex === -1) return prev;
                return prev.map((item, idx) =>
                  idx === nextIndex
                    ? { ...item, status: { state: "waiting", seconds: event.seconds } }
                    : item
                );
              });
              break;

            case "done":
              setSummary({ sent: event.sent, failed: event.failed });
              setLoading(false);
              setSelectedIds([]);
              setTemplateId("");
              break;
          }
        } catch (e: any) {
          console.error(e);
        }
      }
    }
  }

  const selectedContacts = contactList.filter((c) => selectedIds.includes(c.id));

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Send className="h-4 w-4" />
          Nuevo envío
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Template selector */}
          <div className="grid gap-2">
            <Label>Plantilla</Label>
            {templateList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay plantillas.{" "}
                <a href="/templates" className="underline">Agregar</a>
              </p>
            ) : (
              <Select
                value={templateId}
                onValueChange={(value) => setTemplateId(value ?? "")}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
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

          {/* Multi-contact selector */}
          <div className="grid gap-2">
            <Label>Contactos</Label>
            {contactList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay contactos.{" "}
                <a href="/contacts" className="underline">Agregar</a>
              </p>
            ) : (
              <Select onValueChange={toggleContact} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    selectedIds.length === 0
                      ? "Selecciona contactos..."
                      : `${selectedIds.length} contacto${selectedIds.length > 1 ? "s" : ""} seleccionado${selectedIds.length > 1 ? "s" : ""}`
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contactList.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className={cn(
                          selectedIds.includes(c.id) && "font-semibold text-primary"
                        )}
                      >
                        {selectedIds.includes(c.id) ? "✓ " : ""}{c.name ?? c.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {/* Selected contacts chips */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedContacts.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground text-xs px-2.5 py-1"
                  >
                    {c.name ?? c.id}
                    {!loading && (
                      <button
                        type="button"
                        onClick={() => removeContact(c.id)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Queue progress */}
          {queue.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Progreso</Label>
              <div className="space-y-1">
                {queue.map((item) => (
                  <div
                    key={item.contactId}
                    className="flex items-start gap-2 text-sm rounded-md px-3 py-2 bg-muted/50"
                  >
                    {item.status.state === "pending" && (
                      <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    {item.status.state === "sending" && (
                      <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-blue-500 shrink-0" />
                    )}
                    {item.status.state === "waiting" && (
                      <Clock className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    {item.status.state === "sent" && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                    )}
                    {item.status.state === "error" && (
                      <XCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                    )}

                    <div className="min-w-0">
                      <span className="font-medium">{item.contactName}</span>
                      {item.status.state === "pending" && (
                        <span className="text-muted-foreground"> · en espera</span>
                      )}
                      {item.status.state === "sending" && (
                        <span className="text-blue-500"> · enviando...</span>
                      )}
                      {item.status.state === "waiting" && (
                        <span className="text-amber-500">
                          {" "}· esperando {item.status.seconds}s
                        </span>
                      )}
                      {item.status.state === "sent" && (
                        <span className="text-green-600">
                          {" "}· enviado a {item.status.email}
                        </span>
                      )}
                      {item.status.state === "error" && (
                        <span className="text-destructive">
                          {" "}· error: {item.status.message}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className={cn(
              "flex items-start gap-2 rounded-md border p-3 text-sm",
              summary.failed === 0
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200"
            )}>
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-medium">
                Listo · {summary.sent} enviado{summary.sent !== 1 ? "s" : ""}
                {summary.failed > 0 && `, ${summary.failed} fallido${summary.failed !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || selectedIds.length === 0 || !templateId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando {queue.filter((i) => i.status.state === "sent" || i.status.state === "error").length}/{queue.length}...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar{selectedIds.length > 1 ? ` a ${selectedIds.length} contactos` : " email"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
