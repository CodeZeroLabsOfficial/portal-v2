"use client";

import { ImagePlusIcon } from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { initialsFromName } from "@/lib/common/format";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export interface ProfilePhotoUploadProps {
  photoURL?: string;
  displayName: string;
  onFileChange: (file: File | null) => void;
}

/** Profile v2-style avatar picker — click the overlay to open the file dialog. */
export function ProfilePhotoUpload({ photoURL, displayName, onFileChange }: ProfilePhotoUploadProps) {
  const initialFiles = photoURL
    ? [{ id: "avatar", name: "avatar.jpg", size: 0, type: "image/jpeg", url: photoURL }]
    : [];

  const [{ files, errors }, { openFileDialog, getInputProps }] = useFileUpload({
    accept: "image/*",
    maxSize: MAX_PHOTO_BYTES,
    initialFiles,
    onFilesChange: (next) => {
      const f = next[0]?.file;
      onFileChange(f instanceof File ? f : null);
    },
  });

  const preview = files[0]?.preview ?? null;
  const initials = initialsFromName(displayName);

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Profile" className="size-full object-cover" height={80} src={preview} width={80} />
        ) : (
          <span className="text-lg font-semibold text-muted-foreground">{initials}</span>
        )}
        <button
          type="button"
          aria-label={preview ? "Change profile picture" : "Upload profile picture"}
          className="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
          onClick={openFileDialog}
        >
          <ImagePlusIcon aria-hidden size={16} />
        </button>
        <input {...getInputProps()} aria-label="Upload profile picture" className="sr-only" />
      </div>
      {errors[0] ? <p className="text-destructive text-xs">{errors[0]}</p> : null}
    </div>
  );
}

async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/settings/profile/photo", { method: "POST", body: formData });
  const json = (await response.json()) as { photoUrl?: string; error?: string };
  if (!response.ok) {
    throw new Error(json.error ?? "Upload failed.");
  }
  if (!json.photoUrl) {
    throw new Error("Upload failed.");
  }
  return json.photoUrl;
}

export { uploadProfilePhoto };
