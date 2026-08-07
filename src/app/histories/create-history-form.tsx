"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHistoryAction } from "@/src/server/modules/histories/histories.actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

export function CreateHistory({ contactList, templateList }: { contactList: any, templateList: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState({
    status: "",
    sentAt: "",
    contactId: "",
    templateId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createHistoryAction(history);

    if (!result.success) {
      setError(result.error);
    } else {
      setHistory({ status: "", sentAt: "", contactId: "", templateId: "" });
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        Crear historial
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo historial</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un nuevo historial.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="contactId">Contacto</Label>
            <Select items={contactList} value={history.contactId} onValueChange={(value) => setHistory({ ...history, contactId: value ?? "" })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {contactList.map((item: any) => (
                    <SelectItem key={item.id} value={item.id ?? ""}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="templateId">Plantilla</Label>
            <Select items={templateList} value={history.templateId} onValueChange={(value) => setHistory({ ...history, templateId: value ?? "" })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {templateList.map((item: any) => (
                    <SelectItem key={item.id} value={item.id ?? ""}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Input
                id="status"
                type="text"
                placeholder="Pendiente"
                value={history.status}
                onChange={(e) => setHistory({ ...history, status: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sentAt">Fecha de envío</Label>
              <Input
                id="sentAt"
                type="datetime-local"
                value={history.sentAt}
                onChange={(e) => setHistory({ ...history, sentAt: e.target.value })}
                required
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}