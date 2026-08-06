import { getTemplatesAction } from "@/src/server/modules/templates/templates.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { buttonVariants } from "@/src/components/ui/button";
import { Trash2, MoreHorizontal, Mail, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { CreateTemplate } from "./create-template-form";

export default async function TemplatesPage() {
  const result = await getTemplatesAction();

  if (!result.success) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10 text-destructive">
          <CardContent className="pt-6">
            <p className="font-medium">Error al cargar las plantillas: {result.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantillas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las plantillas para tus emails.
          </p>
        </div>
        <CreateTemplate />
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base font-semibold">Lista de plantillas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead className="w-[80px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No hay contactos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      {contact.subject ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{contact.subject}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                     <DropdownMenu>
                       <DropdownMenuTrigger
                         className={cn(
                           buttonVariants({ variant: "ghost", size: "icon" }),
                           "h-8 w-8"
                         )}
                       >
                         <MoreHorizontal className="h-4 w-4" />
                         <span className="sr-only">Abrir menú</span>
                       </DropdownMenuTrigger>
                       
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem className="text-destructive focus:text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Eliminar
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}