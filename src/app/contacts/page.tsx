import { getContactsAction } from "@/src/server/modules/contacts/contacts.actions";
import { CreateContact } from "./create-contact-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash2, MoreHorizontal, Mail, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default async function ContactsPage() {
  const result = await getContactsAction();

  if (!result.success) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50 bg-destructive/10 text-destructive">
          <CardContent className="pt-6">
            <p className="font-medium">Error al cargar los contactos: {result.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los contactos de tu plataforma.
          </p>
        </div>
        <CreateContact />
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base font-semibold">Lista de contactos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Email</TableHead>
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
                      {contact.company ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{contact.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{contact.email}</span>
                      </div>
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