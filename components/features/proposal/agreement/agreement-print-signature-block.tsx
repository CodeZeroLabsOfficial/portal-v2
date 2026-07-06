import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import { Typography } from "@/components/ui/typography";

export interface AgreementPrintSignatureBlockProps {
  signatureSrc: string | null | undefined;
  signerName?: string | null;
  signedAt?: number | null;
}

/** Shown in print/PDF after the agreement is signed — mirrors the e-signature capture. */
export function AgreementPrintSignatureBlock({
  signatureSrc,
  signerName,
  signedAt,
}: AgreementPrintSignatureBlockProps) {
  if (!signatureSrc?.trim()) return null;

  const signedLabel =
    signedAt && signedAt > 0
      ? new Date(signedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  return (
    <section className="mt-12 hidden print:block">
      <AgreementSectionLabel>Signature</AgreementSectionLabel>
      <div className="mt-6 border-t pt-8">
        {signerName?.trim() ? (
          <Typography variant="small" className="text-sm font-semibold text-foreground">
            {signerName.trim()}
          </Typography>
        ) : null}
        {signedLabel ? (
          <Typography variant="muted" className="mt-1 text-xs">
            Signed {signedLabel}
          </Typography>
        ) : null}
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureSrc}
            alt={signerName?.trim() ? `Signature of ${signerName.trim()}` : "Signature"}
            className="max-h-36 max-w-full object-contain object-left"
          />
        </div>
      </div>
    </section>
  );
}
