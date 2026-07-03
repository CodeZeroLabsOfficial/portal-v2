import Image from "next/image";
import React from "react";

export const AUTH_HERO_IMAGE = "/images/extra/image4.jpg";

interface AuthSplitScreenProps {
  portalName: string;
  description: string;
  children: React.ReactNode;
}

export function AuthSplitScreen({ portalName, description, children }: AuthSplitScreenProps) {
  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="relative hidden w-1/2 bg-muted lg:block">
        <Image
          src={AUTH_HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold">{portalName}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
