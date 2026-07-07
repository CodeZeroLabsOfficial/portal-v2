import { NextResponse } from "next/server";
import {
  contractTemplateRecordToPickerRow,
  filterContractTemplatesForPicker,
} from "@/lib/templates/contract-template-picker";
import { requireStaffSession } from "@/lib/auth/server-session";
import { listContractTemplatesForOrg } from "@/server/firestore/contract-templates";

export async function GET(request: Request) {
  const user = await requireStaffSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeId = searchParams.get("includeId")?.trim() || undefined;

  const rows = await listContractTemplatesForOrg(user);
  const templates = filterContractTemplatesForPicker(rows, includeId).map(contractTemplateRecordToPickerRow);

  return NextResponse.json({ templates });
}
