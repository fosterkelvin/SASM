import React, { useEffect, useState, useRef } from "react";
import StudentSidebar from "@/components/sidebar/Student/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import RequirementsList from "./components/RequirementsList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import API from "@/config/apiClient";

export type Requirement = {
  id: string;
  text: string;
  checked: boolean;
  file?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  } | null;
  note?: string;
};

const STORAGE_KEY = "requirements_items";

const Requirements: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const [showSave, setShowSave] = useState(false);
  // read the value so linters/typescript don't flag it as unused while
  // the UI no longer renders a Save button (we still use setShowSave elsewhere)
  void showSave;
  const [resubmitMode, setResubmitMode] = useState(false);

  // per-user storage key (falls back to generic STORAGE_KEY when user not available)
  const userKeySuffix = user?.id || user?.email || "guest";
  const STORAGE_KEY_USER = `${STORAGE_KEY}_${userKeySuffix}`;
  const addrText =
    "Addressed to: Ms. MARY JO B. LIMPN (HRMC) — Through: Ms. JUDY-AN Q. IM-MOTNA (SA Coordinator)";

  const defaultTemplate: string[] = [
    "Letter of Application",
    "Resume/Curriculum Vitae",
    "Photocopy of Recent Grades",
    "Photocopy of Good Moral Certificate",
    "Photocopy of Barangay Certificate of Indigency/BIR Tax Exemption Certificate of Parent or Guardian",
    "Photocopy of Birth Certificate (NSO/PSA)",
  ];

  const [items, setItems] = useState<Requirement[]>(() => {
    try {
      // Prefer user-specific draft (includes data: URL previews) when available
      const rawDraft =
        localStorage.getItem(`${STORAGE_KEY_USER}_draft`) ||
        localStorage.getItem(`${STORAGE_KEY}_draft`);
      if (rawDraft) {
        const parsedDraft = JSON.parse(rawDraft) as
          | Requirement[]
          | { items?: Requirement[] };
        const candidateDraft = (parsedDraft as any).items || parsedDraft;
        if (candidateDraft) return candidateDraft as Requirement[];
      }
      // Prefer user-specific saved items when available
      const raw =
        localStorage.getItem(STORAGE_KEY_USER) ||
        localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as
          | Requirement[]
          | { items?: Requirement[] };
        // if draft wrapper was saved, accept its items
        const candidateItems = (parsed as any).items || parsed;
        // If Letter of Application exists, attach the address note to it if missing
        const letter = (candidateItems as Requirement[]).find(
          (p) => p.text === "Letter of Application"
        );
        if (letter && !letter.note) {
          letter.note = addrText;
          return candidateItems as Requirement[];
        }
        return candidateItems as Requirement[];
      }
    } catch (e) {
      // ignore
    }
    return defaultTemplate.map((t, i) => {
      if (t === "Letter of Application") {
        return {
          id: `tmpl-${i}`,
          text: t,
          checked: false,
          file: null,
          note: addrText,
        } as Requirement;
      }
      return {
        id: `tmpl-${i}`,
        text: t,
        checked: false,
        file: null,
      } as Requirement;
    });
  });

  // Utility: shorten filenames that are too long while preserving extension
  const sanitizeFilename = (name: string, maxLen = 48) => {
    if (!name) return name;
    if (name.length <= maxLen) return name;
    const idx = name.lastIndexOf(".");
    const ext = idx !== -1 ? name.slice(idx) : "";
    const base = idx !== -1 ? name.slice(0, idx) : name;
    const keep = Math.max(6, Math.floor((maxLen - ext.length - 3) / 2));
    const start = base.slice(0, keep);
    const end = base.slice(-keep);
    return `${start}...${end}${ext}`;
  };

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB global limit

  // Handler to import lines (used by UploadArea or localStorage restore)
  const importLines = (lines: string[]) => {
    if (!lines || lines.length === 0) return;
    // Map provided lines into Requirement entries; keep existing ids where possible
    const newItems: Requirement[] = lines.map((t, i) => ({
      id: `imp-${i}-${t.replace(/\s+/g, "-").toLowerCase()}`,
      text: t,
      checked: false,
      file: null,
    }));
    setItems(newItems);
    setShowSave(false);
  };

  useEffect(() => {
    try {
      // Persist the active user's items under their specific key when possible
      try {
        // Do not persist raw data-URL previews (unsaved files). Create a sanitized
        // copy of items where any file.url that starts with 'data:' is removed so
        // that unsaved uploads do not survive a page refresh.
        const sanitized = items.map((it) => {
          if (
            it.file &&
            typeof it.file.url === "string" &&
            it.file.url.startsWith("data:")
          ) {
            return { ...it, file: null } as Requirement;
          }
          return it;
        });
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sanitized));
        // Additionally persist a draft copy that includes data: URLs so the
        // user's unsaved uploads (previews) survive a page refresh. This draft
        // will be removed on successful submit.
        try {
          localStorage.setItem(
            `${STORAGE_KEY_USER}_draft`,
            JSON.stringify(items)
          );
        } catch (e) {
          // ignore quota errors for draft
        }
      } catch (err) {
        // fallback to generic key
        const sanitized = items.map((it) => {
          if (
            it.file &&
            typeof it.file.url === "string" &&
            it.file.url.startsWith("data:")
          ) {
            return { ...it, file: null } as Requirement;
          }
          return it;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        try {
          localStorage.setItem(`${STORAGE_KEY}_draft`, JSON.stringify(items));
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  }, [items]);

  // (Import/paste UI removed)

  // import/paste removed — checklist is driven from the template and per-item uploads

  // Keep actual File objects in a ref so we can submit as FormData later and avoid
  // serializing them into localStorage. The `items` state will keep preview metadata
  // (name/type/size/url) for display only.
  const filesRef = useRef<Record<string, File | null>>({});
  // Track publicIds of previously-saved files that the user has removed in this session.
  const removedPublicIdsRef = useRef<string[]>([]);
  // Keep a ref mirror of isSubmitted so early hooks can read it before the state
  // declaration appears later in the file.
  const isSubmittedRef = useRef<boolean>(false);
  const [removedCount, setRemovedCount] = useState(0);
  useEffect(() => {
    const handler = (ev: any) => {
      // If the submission is already submitted, ignore remove events
      if (isSubmittedRef.current) return;
      const id = ev?.detail?.id as string | undefined;
      if (!id) return;
      // Apply the same removal staging logic as removeFileFromItem as a fallback
      setItems((prev) => {
        const idx = prev.findIndex((it) => it.id === id);
        if (idx === -1) return prev;
        const item = prev[idx];
        const isRemote = !!(
          item.file &&
          item.file.url &&
          !item.file.url.startsWith("data:")
        );
        if (isRemote) {
          const publicId = item.file!.id;
          if (publicId && !removedPublicIdsRef.current.includes(publicId)) {
            removedPublicIdsRef.current.push(publicId);
            setRemovedCount(removedPublicIdsRef.current.length);
          }
        }
        const newItems = prev.map((it) =>
          it.id === id ? { ...it, file: null } : it
        );
        setShowSave(true);
        return newItems;
      });
    };
    window.addEventListener(
      "requirements:removeClick",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "requirements:removeClick",
        handler as EventListener
      );
  }, []);

  const setFileForItem = async (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Per-item limits: Letter of Application limited to 5MB, others up to 25MB
    const curItem = items.find((it) => it.id === id);
    const MAX_BYTES =
      curItem && curItem.text === "Letter of Application"
        ? 5 * 1024 * 1024
        : 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErrors((prev) => ({
        ...prev,
        [id]: `File too large. Maximum allowed size for "${
          curItem?.text || "this item"
        }" is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`,
      }));
      // Ensure we don't keep this file in the ref
      filesRef.current[id] = null;
      return;
    }

    // Store the raw File in the ref for later FormData submission
    filesRef.current[id] = file;

    // Create a small preview (data URL) for UI display
    const readFile = (f: File) =>
      new Promise<{
        id: string;
        name: string;
        size: number;
        type: string;
        url: string;
      }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            id: `${Date.now()}-${Math.random()}`,
            name: f.name,
            size: f.size,
            type: f.type,
            url: String(reader.result),
          });
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(f);
      });

    const result = await readFile(file);
    // Determine whether this is replacing an existing remote file so we can
    // require a resubmit.
    const prevItem = items.find((it) => it.id === id);
    const wasRemote = !!(
      prevItem &&
      prevItem.file &&
      prevItem.file.url &&
      !prevItem.file.url.startsWith("data:")
    );

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, file: result } : it))
    );
    // clear any previous error for this item
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    // a new raw file exists, show Save
    setShowSave(true);

    // If we replaced a previously-submitted file, try to instruct the server to
    // delete the previous cloud resource immediately (best-effort). Then enable
    // resubmit mode so the client will upload and persist the replacement.
    if (wasRemote && isSubmitted) {
      // determine previous publicId from the prevItem if present
      const prevPublicId = prevItem?.file?.id;
      if (prevPublicId) {
        // best-effort delete call; server will attempt destroy even without a draft
        API.post(
          "/requirements/file",
          { publicId: prevPublicId },
          { timeout: 0 }
        )
          .then((r) => {
            console.debug("best-effort destroy result", r?.data);
            // if server indicated successful destroy, remove the old publicId locally
            if (
              r?.data?.destroyed &&
              (r.data.destroyed.result === "ok" ||
                r.data.destroyed === "ok" ||
                r.data.destroyed.result === "not_found")
            ) {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === id
                    ? {
                        ...it,
                        file: it.file ? { ...it.file, id: "" } : it.file,
                      }
                    : it
                )
              );
            }
          })
          .catch((e) => {
            console.debug("best-effort destroy failed", e);
          });
      }
      setResubmitMode(true);
      setSubmitSuccess("File replaced locally. Please resubmit to persist.");
    }
  };

  const removeFileFromItem = (itemId: string) => {
    // If already submitted, disallow removing placeholders unless we're in resubmit mode
    if (isSubmitted && !resubmitMode) {
      setErrors({
        general: "Cannot remove files — requirements already submitted.",
      });
      return;
    }
    // If the item has a saved remote URL/publicId, request backend to delete it
    const item = items.find((it) => it.id === itemId);
    if (
      item &&
      item.file &&
      item.file.url &&
      !item.file.url.startsWith("data:")
    ) {
      // Stage the removal locally and require the user to Save/Submit to persist it.
      console.debug("staging removal (client-side)", {
        id: itemId,
        file: item.file,
      });
      // Determine publicId to instruct server on Save/Submit
      let publicId = item.file.id as string | null;
      if (!publicId && item.file.url) {
        try {
          const url = item.file.url;
          const m = url.match(
            /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:[?#]|$)/
          );
          if (m && m[1]) publicId = decodeURIComponent(m[1]);
        } catch (e) {
          // ignore parsing errors
        }
      }
      if (publicId) {
        // mark staged publicId; server will attempt destroy on Save/Submit
        removedPublicIdsRef.current.push(publicId);
        setRemovedCount(removedPublicIdsRef.current.length);
        setRemovedItemsMap((prev) => ({ ...prev, [itemId]: publicId || "" }));
        // do not remove preview - leave it visible but marked as staged for removal
        setShowSave(true);
      }
      return;
    }

    // Remove from preview state and files ref (no remote file)
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, file: null } : it))
    );
    if (filesRef.current[itemId]) filesRef.current[itemId] = null;
    const anyRaw = Object.values(filesRef.current).some((v) => !!v);
    setShowSave(anyRaw || removedPublicIdsRef.current.length > 0);
  };

  const handleReset = () => {
    setItems(
      defaultTemplate.map((t, i) => {
        if (t === "Letter of Application") {
          return {
            id: `tmpl-${i}`,
            text: t,
            checked: false,
            file: null,
            note: addrText,
          } as Requirement;
        }
        return {
          id: `tmpl-${i}`,
          text: t,
          checked: false,
          file: null,
        } as Requirement;
      })
    );
    setErrors({});
    setSubmitSuccess(null);
    removedPublicIdsRef.current = [];
    setRemovedCount(0);
    filesRef.current = {};
    setShowSave(false);
  };

  const undoRemove = (itemId: string) => {
    const pub = removedItemsMap[itemId];
    if (pub) {
      removedPublicIdsRef.current = removedPublicIdsRef.current.filter(
        (p) => p !== pub
      );
      setRemovedCount(removedPublicIdsRef.current.length);
    }
    setRemovedItemsMap((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    const anyRaw = Object.values(filesRef.current).some((v) => !!v);
    setShowSave(
      anyRaw ||
        Object.keys(removedItemsMap).length > 0 ||
        removedPublicIdsRef.current.length > 0
    );
  };

  // ...existing code...

  // per-item changes are limited to file uploads; no generic handleChange needed

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // keep ref in sync with state
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);
  // Map of itemId -> staged publicId to indicate a removal was staged but not yet
  // persisted. When present, UI should show the preview but mark it as 'staged for removal'.
  const [removedItemsMap, setRemovedItemsMap] = useState<
    Record<string, string>
  >({});

  // ...existing code...

  // On mount, check whether the user already has a submitted requirements
  // document. If so, lock the UI (hide Reset Form and prevent edits).
  useEffect(() => {
    let mounted = true;
    // Restore draft (including data: URLs) if available so unsaved uploads survive refresh
    try {
      const rawDraft =
        localStorage.getItem(`${STORAGE_KEY_USER}_draft`) ||
        localStorage.getItem(`${STORAGE_KEY}_draft`);
      if (rawDraft) {
        try {
          const parsed = JSON.parse(rawDraft) as
            | Requirement[]
            | { items?: Requirement[] };
          const candidateItems = (parsed as any).items || parsed;
          if (Array.isArray(candidateItems) && candidateItems.length > 0) {
            setItems(candidateItems as Requirement[]);
            // Recreate File objects for any data: URL previews so the
            // submission FormData can include actual files even after a page
            // refresh. filesRef is a ref that stores raw File objects for upload.
            (async () => {
              try {
                for (const it of candidateItems as Requirement[]) {
                  if (
                    it.file &&
                    typeof it.file.url === "string" &&
                    it.file.url.startsWith("data:")
                  ) {
                    try {
                      const resp = await fetch(it.file.url);
                      const blob = await resp.blob();
                      // Per-item reconstructed size limit: Letter of Application 5MB, others 25MB
                      const perItemLimit =
                        it.text === "Letter of Application"
                          ? 5 * 1024 * 1024
                          : 25 * 1024 * 1024;
                      if (blob.size > perItemLimit) {
                        setErrors((prev) => ({
                          ...prev,
                          [it.id]: `File too large to auto-attach after reload. Max ${Math.round(
                            perItemLimit / (1024 * 1024)
                          )} MB.`,
                        }));
                        continue;
                      }
                      const rawName = it.file.name || `${it.text || "file"}`;
                      const name = sanitizeFilename(rawName);
                      const fileObj = new File([blob], name, {
                        type: it.file.type || blob.type,
                      });
                      filesRef.current = filesRef.current || {};
                      filesRef.current[it.id] = fileObj;
                    } catch (e) {
                      // ignore individual reconversion errors
                    }
                  }
                }
                // If we recreated any raw files, ensure the Save/Submit UI is visible
                const anyRaw = Object.values(filesRef.current || {}).some(
                  (v) => !!v
                );
                if (anyRaw) setShowSave(true);
              } catch (e) {
                // ignore
              }
            })();
            // Do not return — continue to check server for submitted state later
          }
        } catch (e) {
          // ignore parse errors
        }
      } else {
        // Also restore an uploaded/pasted plain text list if present
        try {
          const raw = localStorage.getItem("requirements_upload_text");
          if (raw) {
            const lines = raw
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
            if (lines.length > 0) importLines(lines);
          }
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
    API.get("/requirements")
      .then((res) => {
        const subs = res?.data?.submissions || [];
        const submitted =
          Array.isArray(subs) &&
          subs.find((s: any) => s.status === "submitted");
        if (mounted && submitted) {
          // Map submitted items into our UI template by matching labels.
          try {
            const serverItems: any[] = Array.isArray(submitted.items)
              ? submitted.items
              : [];
            setItems((prev) =>
              prev.map((tmpl) => {
                const matched = serverItems.find(
                  (si) => String(si.label).trim() === String(tmpl.text).trim()
                );
                if (matched && matched.url) {
                  return {
                    ...tmpl,
                    file: {
                      id: matched.publicId || matched.public_id || null,
                      name:
                        matched.originalName ||
                        matched.originalname ||
                        matched.label ||
                        tmpl.text,
                      size: matched.size || 0,
                      type: matched.mimetype || matched.mimeType || "",
                      url: matched.url,
                    },
                  } as Requirement;
                }
                return tmpl;
              })
            );
          } catch (e) {
            // ignore mapping errors
          }
          setIsSubmitted(true);
        }
      })
      .catch(() => {
        // ignore — show editable form by default
      });
    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    items.forEach((it) => {
      // All items are required now
      if (!it.file) {
        e[it.id] = "This item is required. Please upload the required file.";
      }
    });
    return e;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    // Prevent submitting again only when not in resubmit mode
    if (isSubmitted && !resubmitMode) {
      setErrors({
        general: "Requirements already submitted. Editing is locked.",
      });
      return;
    }
    setSubmitSuccess(null);
    const v = validate();
    // Log validation details for debugging
    try {
      console.debug("Requirements validation:", v);
    } catch (e) {}
    setErrors(v);
    if (Object.keys(v).length === 0) {
      // Validate file sizes before constructing FormData
      const oversizedIds: string[] = [];
      Object.keys(filesRef.current || {}).forEach((k) => {
        const f = filesRef.current[k];
        if (f && f.size > MAX_BYTES) oversizedIds.push(k);
      });
      if (oversizedIds.length > 0) {
        const newErrors: Record<string, string> = {};
        oversizedIds.forEach((id) => {
          newErrors[id] = "File too large. Maximum allowed size is 5 MB.";
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setSubmitSuccess(null);
        return;
      }
      // Build FormData to send only files that are new (data URLs are previews and not remote)
      const form = new FormData();
      items.forEach((it, idx) => {
        form.append(`items[${idx}][label]`, it.text);
        if (it.note) form.append(`items[${idx}][note]`, it.note);
        try {
          form.append(`items[${idx}][clientId]`, it.id);
        } catch (e) {}
        const f = filesRef.current[it.id];
        // Only append file if present in filesRef (new upload) - saved drafts will already have remote URLs
        if (f) {
          form.append(`items[${idx}][hasFile]`, "1");
          // Use original filename untouched
          const safeName = sanitizeFilename(f.name || `file-${idx}`);
          const fileForAppend = new File([f], safeName, { type: f.type });
          form.append("files", fileForAppend, safeName);
        }
      });
      // Include the current items state as JSON so server can use any existing preview URLs
      try {
        // Sanitize items: remove any client-side data: URL previews so we don't
        // send oversized JSON fields to the server (PDF previews can be very large).
        const sanitizedForSubmit = items.map((it) => {
          if (
            it.file &&
            typeof it.file.url === "string" &&
            it.file.url.startsWith("data:")
          ) {
            // Server will receive the file via multipart 'files' entries; remove the inline preview
            return { ...it, file: null } as Requirement;
          }
          return it;
        });
        form.append("itemsJson", JSON.stringify(sanitizedForSubmit));
      } catch (e) {
        // ignore
      }
      // Include any staged publicIds to delete on the server-side so Submit
      // will remove cloud assets the user deleted during this session.
      if (removedPublicIdsRef.current.length > 0) {
        try {
          form.append(
            "removedPublicIds",
            JSON.stringify(removedPublicIdsRef.current)
          );
        } catch (e) {}
      }
      // If we're in resubmitMode, tell the server this is an intentional resubmit
      if (resubmitMode) {
        try {
          form.append("resubmit", "true");
        } catch (e) {}
      }

      setSubmitSuccess("Uploading requirements...");

      API.post("/requirements", form, {
        headers: { "Content-Type": "multipart/form-data" },
        // Disable request timeout for uploads (some files may take longer than 10s)
        timeout: 0,
        // AxiosProgressEvent has optional loaded/total
        onUploadProgress: (progressEvent: any) => {
          const pct = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );
          setSubmitSuccess(`Uploading requirements... ${pct}%`);
        },
      })
        .then((res) => {
          const serverMsg = String(res?.data?.message || "").toLowerCase();
          const wasResubmit = serverMsg.includes("resubmitted") || resubmitMode;
          setSubmitSuccess(
            wasResubmit
              ? "Requirements resubmitted successfully."
              : "Requirements submitted successfully."
          );
          // Replace any local data: URLs with canonical remote URLs returned by the server
          try {
            const submission = res?.data?.submission;
            if (submission && Array.isArray(submission.items)) {
              const serverItems: any[] = submission.items;
              setItems((prev) =>
                prev.map((it) => {
                  const found = serverItems.find(
                    (si: any) =>
                      (si.clientId && si.clientId === it.id) ||
                      String(si.label).trim() === String(it.text).trim()
                  );
                  if (found && found.url) {
                    return {
                      ...it,
                      file: {
                        id:
                          found.publicId ||
                          found.public_id ||
                          found.publicid ||
                          it.file?.id ||
                          "",
                        name:
                          found.originalName ||
                          found.originalname ||
                          it.file?.name ||
                          found.label ||
                          it.text,
                        size: found.size || it.file?.size || 0,
                        type:
                          found.mimetype ||
                          found.mimeType ||
                          it.file?.type ||
                          "",
                        url: found.url,
                      },
                    } as Requirement;
                  }
                  return it;
                })
              );
            }
          } catch (e) {
            // non-fatal if mapping fails
          }
          // After initial mapping, fetch latest submissions to force refresh (ensures updated URLs after resubmit)
          try {
            API.get("/requirements").then((r) => {
              try {
                const subs = r?.data?.submissions || [];
                const submitted =
                  Array.isArray(subs) &&
                  subs.find((s: any) => s.status === "submitted");
                if (submitted && Array.isArray(submitted.items)) {
                  const serverItems: any[] = submitted.items;
                  setItems((prev) =>
                    prev.map((tmpl) => {
                      const matched = serverItems.find(
                        (si: any) =>
                          (si.clientId && si.clientId === tmpl.id) ||
                          String(si.label).trim() === String(tmpl.text).trim()
                      );
                      if (matched && matched.url) {
                        return {
                          ...tmpl,
                          file: {
                            id:
                              matched.publicId ||
                              matched.public_id ||
                              matched.publicid ||
                              tmpl.file?.id ||
                              "",
                            name:
                              matched.originalName ||
                              matched.originalname ||
                              tmpl.file?.name ||
                              matched.label ||
                              tmpl.text,
                            size: matched.size || tmpl.file?.size || 0,
                            type:
                              matched.mimetype ||
                              matched.mimeType ||
                              tmpl.file?.type ||
                              "",
                            url: matched.url,
                          },
                        } as Requirement;
                      }
                      return tmpl;
                    })
                  );
                }
              } catch (e) {
                // ignore mapping errors
              }
            });
          } catch (e) {}
          // clear the local draft storage so user sees the submitted state
          try {
            localStorage.removeItem(`${STORAGE_KEY_USER}_draft`);
          } catch (e) {}
          // clear any raw files refs and hide Save
          filesRef.current = {};
          setShowSave(false);
          removedPublicIdsRef.current = [];
          setIsSubmitted(true);
          // we've successfully persisted changes, no longer in resubmit mode
          setResubmitMode(false);
          setErrors({});
        })
        .catch((err) => {
          console.error("Failed to submit requirements", err);
          setSubmitSuccess(null);
          setErrors({ general: "Failed to submit requirements." });
        });
    }
  };

  // draft saving is now automatic; manual Save button removed

  // Clear/export moved/removed with the import area — checklist persists per-item

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div
          className={`hidden md:flex items-center gap-4 fixed top-0 left-0 z-30 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg border-b border-red-200 dark:border-red-800 h-[81px] ${
            isSidebarCollapsed
              ? "md:w-[calc(100%-5rem)] md:ml-20"
              : "md:w-[calc(100%-16rem)] md:ml-64"
          }`}
        >
          <h1 className="text-2xl font-bold text-white ml-4">Requirements</h1>
          <div className="ml-auto mr-4" />
        </div>

        <div className="p-4 md:p-10 mt-12">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
                  <img
                    src="/UBLogo.svg"
                    alt="University Logo"
                    className="h-12 sm:h-14 md:h-16 w-auto"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Requirements Form
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-400">
                      Import your requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <form onSubmit={handleSubmit}>
                  <RequirementsList
                    items={items}
                    onSetFile={setFileForItem}
                    onRemoveFile={removeFileFromItem}
                    errors={errors}
                    unsavedIds={Object.keys(filesRef.current).reduce(
                      (acc, k) => {
                        if (filesRef.current[k]) acc[k] = true;
                        return acc;
                      },
                      {} as Record<string, boolean>
                    )}
                    isSubmitted={isSubmitted}
                    removedItemsMap={removedItemsMap}
                    undoRemove={undoRemove}
                  />

                  <div className="mt-4 flex items-center justify-end gap-3">
                    {Object.keys(errors).length > 0 && (
                      <div className="text-sm text-red-600 mr-auto">
                        <div>
                          Please fix the highlighted errors before submitting:
                        </div>
                        <ul className="mt-1 list-disc ml-4">
                          {Object.keys(errors).map((id) => {
                            const it = items.find((x) => x.id === id);
                            const label = it ? it.text : id;
                            return (
                              <li key={id}>
                                {label}: {errors[id]}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="text-sm text-green-600 mr-auto">
                        {submitSuccess}
                      </div>
                    )}
                    {errors.general && (
                      <div className="text-sm text-red-600 mr-auto">
                        {errors.general}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {!isSubmitted && (
                        <Button
                          variant="ghost"
                          type="button"
                          className="bg-gray-400 hover:bg-gray-500"
                          onClick={handleReset}
                        >
                          Reset Form
                        </Button>
                      )}
                      {/* Save button removed - drafts are auto-saved now. Show staged removals if any. */}
                      {removedCount > 0 && (
                        <div className="ml-2 text-sm text-red-600">
                          {removedCount} removal(s) staged
                        </div>
                      )}
                      {!isSubmitted && !resubmitMode && (
                        <Button
                          type="submit"
                          className={`bg-green-600 hover:bg-green-700 text-white`}
                        >
                          Submit Requirements
                        </Button>
                      )}
                      {/* Show Resubmit if explicitly in resubmitMode OR if the user has
                            added any raw replacement files while the submission is
                            already submitted. */}
                      {(resubmitMode ||
                        (isSubmitted &&
                          Object.values(filesRef.current).some(
                            (v) => !!v
                          ))) && (
                        <Button
                          type="submit"
                          className={`bg-yellow-600 hover:bg-yellow-700 text-white`}
                        >
                          Resubmit Requirements
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Requirements;
