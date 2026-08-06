"use server"

import type { 
  Template, 
  CreateTemplateInput, 
  UpdateTemplateInput 
} from "./templates.repository";

import {
  createNewTemplate,
  deleteExistingTemplate,
  getAllTemplates,
  updateExistingTemplate,
} from "./templates.service";

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function getTemplatesAction(): Promise<ActionResult<Template[]>> {
  try {
    const data = await getAllTemplates();
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknow error";
    return { success: false, error: message };
  }
}

export async function createTemplateAction(
  input: CreateTemplateInput
): Promise<ActionResult<Template>> {
  try {
    const data = await createNewTemplate(input);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknow error";
    return { success: false, error: message };
  }
}

export async function updateTemplateAction(
  id: string,
  input: UpdateTemplateInput
): Promise<ActionResult<Template>> {
  try {
    const data = await updateExistingTemplate(id, input);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknow error";
    return { success: false, error: message };
  }
}

export async function deleteTemplateAction(
  id: string,
): Promise<ActionResult<Template>> {
  try {
    const data = await deleteExistingTemplate(id);
    return { success: true, data };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknow error";
    return { success: false, error: message };
  }
}