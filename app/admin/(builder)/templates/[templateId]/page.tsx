import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { ProposalBuilderWorkspace } from "@/components/features/proposal/editor/proposal-builder-workspace";
import { Typography } from "@/components/ui/typography";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { listCatalogServicePickerOptionsForOrg } from "@/server/firestore/catalog-services";
import { getProposalTemplateForStaff } from "@/server/firestore/proposal-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function EditProposalTemplateBuilderPage({ params }: PageProps) {
  await connection();
  const { templateId } = await params;
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/admin/templates/${templateId}`)}`);
  }

  const template = await getProposalTemplateForStaff(user, templateId);
  if (!template) {
    notFound();
  }

  const catalogServiceOptions = await listCatalogServicePickerOptionsForOrg(user);

  return (
    <ProposalBuilderWorkspace
      backHref="/admin/templates"
      backLabel="Templates"
      titleFallback={template.name?.trim() || "Untitled template"}
      brandingSlot={
        <Typography variant="muted" className="text-sm">
          Template logo and colors are edited on splash blocks in the canvas.
        </Typography>
      }
      variant="template"
      templateId={template.id}
      initialTemplateName={template.name}
      initialTemplateDescription={template.description ?? ""}
      initialCatalogMeta={template.catalogMeta}
      initialTemplateStage={template.stage}
      initialDocument={template.document}
      initialBranding={template.branding}
      localityTimeZone={user.timeZone?.trim() || undefined}
      catalogServiceOptions={catalogServiceOptions}
    />
  );
}
