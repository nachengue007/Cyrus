import { 
  findAllTemplates, 
  createTemplate,
  findTemplateById,
  updateTemplate,
  deleteTemplate,
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from "./templates.repository";

export async function getAllTemplates(): Promise<Template[]> {
  return findAllTemplates();
}

export async function createNewTemplate(
  data: CreateTemplateInput
): Promise<Template> {
  if(!data.name && !data.subject && !data.body) {
    throw new Error("Missing data");
  }

  return createTemplate(data);
}

export async function updateExistingTemplate(
  id: string, 
  data: UpdateTemplateInput
): Promise<Template> {
  await findTemplateById(id);
  return updateTemplate(id, data);
}

export async function deleteExistingTemplate(id: string): Promise<Template> {
  await findTemplateById(id);
  return deleteTemplate(id);
}