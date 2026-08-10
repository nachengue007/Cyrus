import { getContactsAndTemplatesAction } from "@/src/server/modules/histories/histories.actions";
import { Card, CardContent } from "@/src/components/ui/card";
import { SendEmailForm } from "./send-email-form";

export default async function SendEmPage() {
  const data = await getContactsAndTemplatesAction();

  if (!data.success) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10 text-destructive">
          <CardContent className="pt-6">
            <p className="font-medium">
              Error al cargar contactos y plantillas: {data.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { contactList, templateList } = data.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enviar correo</h1>
        <p className="text-sm text-muted-foreground">
          Selecciona uno o más contactos y una plantilla. Los emails se envían de forma secuencial con 5 segundos de espera entre cada uno.
        </p>
      </div>

      <SendEmailForm contactList={contactList} templateList={templateList} />
    </div>
  );
}
