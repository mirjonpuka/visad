"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, RotateCcw, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { checkFile, UPLOAD_KINDS, type UploadKind } from "@/lib/forms/uploads";
import type { UploadedFile } from "@/lib/forms/schemas";
import { cn } from "@/lib/utils";
import { Field } from "./fields";

export type UploadMode = "blob" | "local";

type Item = {
  key: string;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  result?: UploadedFile;
  error?: "fileType" | "fileSize" | "generic";
  preview?: string;
};

/** Upload one file: Vercel Blob (token from /api/upload) or the local fallback. */
async function uploadFile(file: File, kind: UploadKind, mode: UploadMode, onProgress: (p: number) => void) {
  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(`leads/${kind}/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: kind,
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    });
    return { url: blob.url, name: file.name, size: file.size };
  }
  // Local fallback: XHR for progress events
  return new Promise<UploadedFile>((resolve, reject) => {
    const body = new FormData();
    body.set("kind", kind);
    body.set("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/local");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText) as UploadedFile);
      else reject(new Error(xhr.responseText));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(body);
  });
}

/**
 * File upload field (UI §11.2, §13.4): drag & drop or browse (camera on
 * phones for photos), per-file progress bar and thumbnail, retry for failed
 * uploads, remove. Reports the uploaded files and whether uploads are running.
 */
export function FileField({
  name,
  kind,
  mode,
  label,
  hint,
  required,
  error,
  onChange,
  onBusy,
}: {
  name: string;
  kind: UploadKind;
  mode: UploadMode;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  onChange: (files: UploadedFile[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const t = useTranslations("form");
  const rules = UPLOAD_KINDS[kind];
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onBusyRef = useRef(onBusy);
  useEffect(() => {
    onChangeRef.current = onChange;
    onBusyRef.current = onBusy;
  });

  // Report results upward whenever the list changes
  useEffect(() => {
    onChangeRef.current(items.filter((i) => i.status === "done" && i.result).map((i) => i.result!));
    onBusyRef.current(items.some((i) => i.status === "uploading"));
  }, [items]);

  // Free object URLs of image previews when the field goes away
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(() => () => itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []);

  const update = (key: string, patch: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  function start(item: Item) {
    update(item.key, { status: "uploading", progress: 0, error: undefined });
    uploadFile(item.file, kind, mode, (p) => update(item.key, { progress: p }))
      .then((result) => update(item.key, { status: "done", progress: 100, result }))
      .catch(() => update(item.key, { status: "error", error: "generic" }));
  }

  function add(files: FileList | File[]) {
    const incoming = Array.from(files);
    const room = rules.maxFiles - items.length;
    setLimitHit(incoming.length > room);
    const next: Item[] = incoming.slice(0, Math.max(0, room)).map((file) => {
      const problem = checkFile(kind, file);
      return {
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        status: problem ? "error" : "uploading",
        progress: 0,
        error: problem ?? undefined,
        preview: kind === "photo" && !problem && file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      };
    });
    setItems((list) => [...list, ...next]);
    next.filter((i) => !i.error).forEach(start);
  }

  const full = items.length >= rules.maxFiles;
  const maxMb = Math.round(rules.maxBytes / 1024 / 1024);

  return (
    <Field name={name} label={label} hint={hint} required={required} error={error} group>
      {({ describedBy }) => (
        <div>
          {!full && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                add(e.dataTransfer.files);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-base border border-dashed px-6 py-8 text-center transition-colors",
                dragging ? "border-red-500 bg-red-500/5" : "hairline",
              )}
            >
              <Upload size={22} strokeWidth={1.5} aria-hidden className="text-(--surface-fg-3)" />
              <p className="text-body-s">
                {t("files.drop")}{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  aria-describedby={describedBy}
                  className="font-medium underline underline-offset-4"
                >
                  {t("files.browse")}
                </button>
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple={rules.maxFiles > 1}
                accept={rules.accept}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  if (e.target.files) add(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          {limitHit && (
            <p className="field-error" role="alert">
              {t("files.tooMany", { max: rules.maxFiles })}
            </p>
          )}

          {items.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-4 rounded-base border hairline p-3">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-base bg-(--sk-base)">
                    {item.preview ? (
                      // Local preview of the user's own file (object URL), not an optimizable image
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={20} strokeWidth={1.5} aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-s">{item.file.name}</span>
                    {item.status === "uploading" && (
                      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-(--sk-base)">
                        <span
                          className="block h-full bg-red-500 transition-[width] duration-200"
                          style={{ width: `${Math.round(item.progress)}%` }}
                        />
                      </span>
                    )}
                    <span
                      className={cn(
                        "mt-1 block font-mono text-label uppercase",
                        item.status === "error" ? "text-red-700" : "text-(--surface-fg-3)",
                      )}
                      aria-live="polite"
                    >
                      {item.status === "uploading" && `${t("files.uploading")} ${Math.round(item.progress)}%`}
                      {item.status === "done" && t("files.done")}
                      {item.status === "error" &&
                        (item.error === "generic" ? t("files.failed") : t(`errors.${item.error}` as "errors.fileSize", { max: maxMb }))}
                    </span>
                  </span>
                  {item.status === "error" && item.error === "generic" && (
                    <button type="button" onClick={() => start(item)} aria-label={t("files.retry")} className="icon-btn h-9 w-9">
                      <RotateCcw size={16} strokeWidth={1.5} aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.preview) URL.revokeObjectURL(item.preview);
                      setItems((list) => list.filter((i) => i.key !== item.key));
                    }}
                    aria-label={t("files.remove", { name: item.file.name })}
                    className="icon-btn h-9 w-9"
                  >
                    <X size={16} strokeWidth={1.5} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  );
}
