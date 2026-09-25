import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ComingSoonEmptyProps {
  title: string;
  description: string;
}

export function ComingSoonEmpty({ title, description }: ComingSoonEmptyProps) {
  return (
    <Empty className="h-(--content-full-height)">
      <EmptyHeader>
        <EmptyMedia>
          {/* Decorative illustration; sized with Tailwind, not the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dashboard-empty.svg" className="w-40 grayscale dark:invert" alt="" />
        </EmptyMedia>
        <EmptyTitle className="text-xl">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
