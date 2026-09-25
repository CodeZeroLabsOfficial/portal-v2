export interface CustomerOverviewStatsProps {
  subscriptionCount: number;
  openInvoiceCount: number;
  proposalCount: number;
  opportunityCount: number;
}

export function CustomerOverviewStats({
  subscriptionCount,
  openInvoiceCount,
  proposalCount,
  opportunityCount
}: CustomerOverviewStatsProps) {
  return (
    <div className="bg-muted grid grid-cols-4 divide-x rounded-md border text-center *:py-3">
      <div>
        <p className="text-lg font-semibold tabular-nums">{subscriptionCount}</p>
        <p className="text-muted-foreground text-xs">Subs</p>
      </div>
      <div>
        <p className="text-lg font-semibold tabular-nums">{openInvoiceCount}</p>
        <p className="text-muted-foreground text-xs">Open</p>
      </div>
      <div>
        <p className="text-lg font-semibold tabular-nums">{proposalCount}</p>
        <p className="text-muted-foreground text-xs">Prop</p>
      </div>
      <div>
        <p className="text-lg font-semibold tabular-nums">{opportunityCount}</p>
        <p className="text-muted-foreground text-xs">Opp</p>
      </div>
    </div>
  );
}
