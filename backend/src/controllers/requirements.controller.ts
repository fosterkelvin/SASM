import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import RequirementsSubmissionModel from "../models/requirementsSubmission.model";
import { CREATED, OK } from "../constants/http";
import cloudinary from "../config/cloudinary";
import {
  findDraft,
  findSubmitted,
  saveSubmission,
} from "../services/requirements.service";
import mongoose from "mongoose";

// Create a new requirements submission
export const createRequirementsSubmission = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    // If user already has a submitted document, normally lock further edits and new submissions.
    // However, if the client intentionally requests a resubmit (resubmit=true), allow merging
    // uploaded files and changes into the existing submitted document.
    const alreadySubmitted = await RequirementsSubmissionModel.findOne({
      userID,
      status: "submitted",
    });
    const isResubmit =
      (req.body && req.body.resubmit === "true") ||
      (req.query && req.query.resubmit === "1") ||
      (req.headers &&
        (req.headers["x-resubmit"] === "1" ||
          req.headers["x-resubmit"] === "true"));
    if (alreadySubmitted && !isResubmit) {
      return res.status(403).json({
        message: "Requirements already submitted. Further edits are locked.",
      });
    }

    // req.files comes from multer upload.any(); it's an array
    const files = (req.files as Express.Multer.File[]) || [];

    // itemsJson may be sent as a JSON snapshot from the client containing preview URLs
    let itemsJson: any[] | null = null;
    if (req.body && req.body.itemsJson) {
      try {
        itemsJson =
          typeof req.body.itemsJson === "string"
            ? JSON.parse(req.body.itemsJson)
            : req.body.itemsJson;
      } catch (err) {
        itemsJson = null;
      }
    }

    // Parse items from body. Expect fields like items[0][label], items[0][note], items[0][filename]
    const items: any[] = [];

    // Gather keys like items[0][label]
    for (const key of Object.keys(req.body)) {
      const m = key.match(/^items\[(\d+)\]\[(\w+)\]$/);
      if (m) {
        const idx = parseInt(m[1], 10);
        const prop = m[2];
        items[idx] = items[idx] || {};
        items[idx][prop] = req.body[key];
      }
    }

    // If no items were provided as form fields but client sent itemsJson, build items from it
    if ((items.length === 0 || items.every((it) => !it)) && itemsJson) {
      for (let i = 0; i < itemsJson.length; i++) {
        const src = itemsJson[i] || {};
        items[i] = items[i] || {};
        items[i].label = items[i].label || src.text || src.label;
        items[i].note = items[i].note || src.note;
        // try to set filename from client preview metadata if available
        items[i].filename =
          items[i].filename ||
          (src.file && (src.file.name || src.file.originalName));
      }
    }

    // Debug logging (can be removed after verification)
    console.debug(
      `[requirements] user=${userID} files=${files.length} itemsParsed=${items.length} itemsJson=${itemsJson ? itemsJson.length : 0}`
    );
    console.debug(
      "[requirements] file fieldnames:",
      files.map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
      }))
    );

    // Map files by fieldname to their corresponding requirement items
    console.debug("[requirements] items array:", items.map((it: any, idx: number) => ({
      idx,
      label: it?.label,
      hasFile: it?.hasFile,
      clientId: it?.clientId
    })));
    console.debug("[requirements] files received:", files.map((f: any) => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      size: f.size
    })));

    // Create a comprehensive map of all items (from itemsJson) to maintain full context
    const fullItemsMap = new Map<number, any>();
    if (itemsJson && Array.isArray(itemsJson)) {
      itemsJson.forEach((jsonItem: any, idx: number) => {
        fullItemsMap.set(idx, {
          ...jsonItem,
          originalIndex: idx,
        });
      });
    }

    const mappedItems = items
      .map((it: any, originalIndex: number) => {
        if (!it || (it.hasFile !== "1" && it.hasFile !== 1)) {
          // If this item doesn't have a new file upload but exists in itemsJson with a remote URL, preserve it
          const jsonItem = fullItemsMap.get(originalIndex);
          if (jsonItem && jsonItem.file && jsonItem.file.url && !jsonItem.file.url.startsWith("data:")) {
            console.debug("[requirements][map] preserving existing remote file", {
              originalIndex,
              label: it.label || jsonItem.text,
              url: jsonItem.file.url,
            });
            return {
              label: it.label || jsonItem.text || jsonItem.label,
              note: it.note || jsonItem.note,
              url: jsonItem.file.url,
              publicId: jsonItem.file.id || null,
              originalName: jsonItem.file.name || it.label || jsonItem.text,
              mimetype: jsonItem.file.type || null,
              size: jsonItem.file.size || 0,
              clientId: it.clientId || jsonItem.id,
            };
          }
          return null;
        }

        // Look for a file with the expected fieldname for this item
        const expectedFieldname = `file_item_${originalIndex}`;
        const file = files.find((f: any) => f.fieldname === expectedFieldname);
        if (!file) {
          console.debug("[requirements][map] no file found for fieldname", {
            originalIndex,
            expectedFieldname,
            label: it.label,
            clientId: it.clientId,
          });
          return null;
        }
        // @ts-ignore
        let url =
          (file as any).secure_url || (file as any).url || (file as any).path;
        // @ts-ignore
        const publicId = (file as any)?.public_id || (file as any)?.publicId;
        if (!url && publicId) {
          try {
            url = cloudinary.url(publicId, { secure: true });
          } catch (e) {}
        }
        if (!url) return null;
        const label =
          it.label ||
          (itemsJson &&
            itemsJson[originalIndex] &&
            (itemsJson[originalIndex].text ||
              itemsJson[originalIndex].label)) ||
          `Item ${originalIndex + 1}`;
        const clientId =
          it.clientId ||
          (itemsJson &&
            itemsJson[originalIndex] &&
            (itemsJson[originalIndex].id ||
              itemsJson[originalIndex].clientId)) ||
          undefined;
        console.debug("[requirements][map] mapped new upload", {
          originalIndex,
          label,
          clientId,
          assignedFile: file.originalname,
        });
        return {
          label,
          note: it.note,
          url,
          publicId,
          originalName: file.originalname || file.filename,
          mimetype: file.mimetype,
          size: file.size,
          clientId,
        };
      })
      .filter((v: any) => v !== null) as any[];

    // If there are uploaded files but mappedItems is empty, create items from files directly
    if (mappedItems.length === 0 && files.length > 0) {
      const filesAsItems: any[] = files
        .map((file, idx) => {
          // Extract item index from fieldname if it follows our pattern (file_item_N)
          const fieldnameMatch = (file.fieldname || "").match(
            /^file_item_(\d+)$/
          );
          const itemIndex = fieldnameMatch
            ? parseInt(fieldnameMatch[1], 10)
            : idx;

          // try to get filename
          const originalName =
            file.originalname || file.filename || `file-${itemIndex}`;
          // prefer secure_url/url/path if provided by multer-storage-cloudinary
          // otherwise, if public_id exists, construct a cloudinary url
          // @ts-ignore
          const secureUrl =
            (file as any).secure_url || (file as any).url || (file as any).path;
          // @ts-ignore
          const publicId =
            (file as any)?.public_id ||
            (file as any)?.publicId ||
            (file as any)?.public_id;
          let url: string | undefined = undefined;
          if (
            secureUrl &&
            typeof secureUrl === "string" &&
            secureUrl.trim() !== ""
          ) {
            url = secureUrl;
          } else if (publicId) {
            try {
              // determine resource_type/format if available
              // @ts-ignore
              const resource_type =
                (file as any).resource_type ||
                ((file as any).mimetype === "application/pdf"
                  ? "raw"
                  : undefined);
              // @ts-ignore
              const format =
                (file as any).format ||
                ((file as any).mimetype === "application/pdf"
                  ? "pdf"
                  : undefined);
              url = cloudinary.url(publicId, {
                secure: true,
                ...(resource_type ? { resource_type } : {}),
                ...(format ? { format } : {}),
              });
            } catch (err) {
              // ignore and leave url undefined
            }
          }

          const labelFromJson =
            itemsJson &&
            itemsJson[idx] &&
            (itemsJson[idx].text || itemsJson[idx].label);
          return {
            label: labelFromJson || originalName || `Item ${idx + 1}`,
            note: undefined,
            url,
            publicId,
            originalName,
            mimetype: file.mimetype,
            size: file.size,
          };
        })
        .filter((it) => it.url);
      // use these as mappedItems
      if (filesAsItems.length > 0) mappedItems.push(...filesAsItems);
    }
    // If there is an existing draft, merge uploaded items into it and mark as submitted
    const existingDraft = await RequirementsSubmissionModel.findOne({
      userID,
      status: "draft",
    });

    // If this is an explicit resubmit against an already-submitted document,
    // merge any existing draft items FIRST (so prior replace operations in draft are honored),
    // then merge newly uploaded files, then apply removals, update submittedAt.
    if (alreadySubmitted && isResubmit) {
      // parse removedPublicIds if present (resubmit clients may stage deletions)
      let removedPublicIdsForResubmit: string[] = [];
      if (req.body && req.body.removedPublicIds) {
        try {
          removedPublicIdsForResubmit = JSON.parse(req.body.removedPublicIds);
        } catch (e) {
          removedPublicIdsForResubmit = Array.isArray(req.body.removedPublicIds)
            ? req.body.removedPublicIds
            : [];
        }
      }
      try {
        // Start with submitted items
        let merged: any[] = [...(alreadySubmitted.items || [])];
        // If a draft exists, overlay draft items into merged (draft considered source of truth for replaced items)
        if (existingDraft && Array.isArray(existingDraft.items)) {
          for (const draftItem of existingDraft.items) {
            const idx = merged.findIndex((m) => m.label === draftItem.label);
            if (idx !== -1) {
              // if label match, replace entire item with draft version
              merged[idx] = { ...merged[idx], ...draftItem };
            } else {
              merged.push(draftItem);
            }
          }
        }
        // If client requested removals, attempt to destroy those publicIds
        // and remove matching items from the merged array.
        if (
          Array.isArray(removedPublicIdsForResubmit) &&
          removedPublicIdsForResubmit.length > 0
        ) {
          for (const pub of removedPublicIdsForResubmit) {
            try {
              const found = merged.find(
                (m) =>
                  m.publicId === pub ||
                  (m.publicId || "").endsWith(pub) ||
                  (m.url || "").includes(pub)
              );
              const isPdf = (found?.mimetype || "").includes("pdf");
              // @ts-ignore
              await cloudinary.uploader.destroy(pub, {
                resource_type: isPdf ? "raw" : "image",
              });
            } catch (err) {
              // ignore
            }
          }
          merged = merged.filter(
            (m) => !removedPublicIdsForResubmit.includes(m.publicId)
          );
        }
        // Since mappedItems now contains ALL items (both new and preserved), we can directly use it
        // but we need to ensure we delete any old files that are being replaced
        for (const newIt of mappedItems) {
          if (!newIt) continue;
          const idx = merged.findIndex(
            (m) =>
              (newIt.clientId && m.clientId === newIt.clientId) ||
              m.label === newIt.label
          );
          if (idx !== -1) {
            const old = merged[idx];
            // Only destroy old cloud resource if we have a NEW upload (different publicId)
            if (
              old &&
              old.publicId &&
              newIt.publicId &&
              old.publicId !== newIt.publicId
            ) {
              try {
                const isPdf = (old.mimetype || "").includes("pdf");
                // attempt to destroy old resource
                // @ts-ignore
                await cloudinary.uploader.destroy(old.publicId, {
                  resource_type: isPdf ? "raw" : "image",
                });
                console.debug("[requirements][resubmit] destroyed old publicId", {
                  oldPublicId: old.publicId,
                  newPublicId: newIt.publicId,
                  label: newIt.label,
                });
              } catch (err) {
                // ignore deletion errors
                console.debug("[requirements][resubmit] failed to destroy old publicId", err);
              }
            }
          }
        }
        // Replace the entire items array with mappedItems (which contains the complete, updated set)
        alreadySubmitted.items = mappedItems;
        alreadySubmitted.submittedAt = new Date();
        await alreadySubmitted.save();
        // Clean up draft after successful resubmit (optional; remove to keep historical draft)
        if (existingDraft) {
          try {
            await RequirementsSubmissionModel.deleteOne({
              _id: existingDraft._id,
            });
          } catch (err) {
            // ignore draft cleanup errors
          }
        }
        return res.status(CREATED).json({
          message: "Requirements resubmitted",
          submission: alreadySubmitted,
        });
      } catch (err) {
        // fallback to the default behavior below if something unexpected happens
        console.debug("Resubmit merge failed", err);
      }
    }

    let finalItems = mappedItems;
    if (existingDraft) {
      // start with existing items
      const merged: any[] = [...(existingDraft.items || [])];

      for (const newIt of mappedItems) {
        if (!newIt) continue;
        const idx = merged.findIndex((m) => m.label === newIt.label);
        // If replacing an existing file, delete old publicId to avoid duplicates
        if (idx !== -1) {
          const old = merged[idx];
          if (
            old &&
            old.publicId &&
            newIt.publicId &&
            old.publicId !== newIt.publicId
          ) {
            try {
              const isPdf = (old.mimetype || "").includes("pdf");
              // try to destroy previous file
              // @ts-ignore
              await cloudinary.uploader.destroy(old.publicId, {
                resource_type: isPdf ? "raw" : "image",
              });
            } catch (err) {
              // ignore deletion errors
            }
          }
        }

        if (idx === -1) merged.push(newIt);
        else merged[idx] = { ...merged[idx], ...newIt };
      }

      finalItems = merged;

      existingDraft.items = finalItems;
      existingDraft.status = "submitted";
      existingDraft.submittedAt = new Date();
      await existingDraft.save();

      return res
        .status(CREATED)
        .json({ message: "Requirements submitted", submission: existingDraft });
    }

    // No existing draft — create a new submission document
    const submission = await RequirementsSubmissionModel.create({
      userID,
      items: finalItems,
      status: "submitted",
      submittedAt: new Date(),
    });

    return res
      .status(CREATED)
      .json({ message: "Requirements submitted", submission });
  }
);

// Save or update a draft submission (status: draft). This endpoint accepts file uploads
export const saveDraftRequirements = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const files = (req.files as Express.Multer.File[]) || [];

    // If a final submission already exists, allow creating/updating a draft
    // seeded from the submitted document so the user can prepare a resubmission.
    const existingSubmitted = await RequirementsSubmissionModel.findOne({
      userID,
      status: "submitted",
    });
    let draftSeed: any[] | null = null;
    if (existingSubmitted) {
      // Use the submitted items as a starting point for an editable draft.
      // Normalize item fields to match draft shape.
      draftSeed = (existingSubmitted.items || []).map((it: any) => ({
        label: it.label,
        note: it.note,
        url: it.url,
        publicId: it.publicId || it.public_id || it.publicid || null,
        originalName: it.originalName || it.originalname || null,
        mimetype: it.mimetype || it.mimeType || null,
        size: it.size || null,
      }));
    }

    // parse itemsJson fallback
    let itemsJson: any[] | null = null;
    if (req.body && req.body.itemsJson) {
      try {
        itemsJson =
          typeof req.body.itemsJson === "string"
            ? JSON.parse(req.body.itemsJson)
            : req.body.itemsJson;
      } catch (err) {
        itemsJson = null;
      }
    }

    // parse removedPublicIds if client staged any removals
    let removedPublicIds: string[] = [];
    if (req.body && req.body.removedPublicIds) {
      try {
        removedPublicIds =
          typeof req.body.removedPublicIds === "string"
            ? JSON.parse(req.body.removedPublicIds)
            : req.body.removedPublicIds;
        if (!Array.isArray(removedPublicIds)) removedPublicIds = [];
      } catch (err) {
        removedPublicIds = [];
      }
    }

    const items: any[] = [];
    for (const key of Object.keys(req.body)) {
      const m = key.match(/^items\[(\d+)\]\[(\w+)\]$/);
      if (m) {
        const idx = parseInt(m[1], 10);
        const prop = m[2];
        items[idx] = items[idx] || {};
        items[idx][prop] = req.body[key];
      }
    }

    const draftUploadTargets = items.filter(
      (it: any) => it && (it.hasFile === "1" || it.hasFile === 1)
    );
    let draftCursor = 0;
    let mappedItems = draftUploadTargets
      .map((it: any, idx: number) => {
        const file = files[draftCursor++];
        if (!file) return null;
        // @ts-ignore
        let url =
          (file as any).secure_url || (file as any).url || (file as any).path;
        // @ts-ignore
        const publicId = (file as any)?.public_id || (file as any)?.publicId;
        if (!url && publicId) {
          try {
            url = cloudinary.url(publicId, { secure: true });
          } catch (e) {}
        }
        if (!url) return null;
        return {
          label:
            it.label ||
            (itemsJson &&
              itemsJson[idx] &&
              (itemsJson[idx].text || itemsJson[idx].label)) ||
            `Item ${idx + 1}`,
          note: it.note,
          url,
          publicId,
          originalName: file.originalname || file.filename,
          mimetype: file.mimetype,
          size: file.size,
          clientId:
            it.clientId ||
            (itemsJson &&
              itemsJson[idx] &&
              (itemsJson[idx].id || itemsJson[idx].clientId)) ||
            undefined,
        };
      })
      .filter((v: any) => v !== null) as any[];
    // If no mapped items but files exist, create items from files (same fallback for draft)
    if (mappedItems.length === 0 && files.length > 0) {
      const filesAsItems: any[] = files
        .map((file, idx) => {
          const originalName =
            file.originalname || file.filename || `file-${idx}`;
          // prefer secure_url/url/path if provided by multer-storage-cloudinary
          // otherwise, if public_id exists, construct a cloudinary url
          // @ts-ignore
          const secureUrl =
            (file as any).secure_url || (file as any).url || (file as any).path;
          // @ts-ignore
          const publicId =
            (file as any)?.public_id ||
            (file as any)?.publicId ||
            (file as any)?.public_id;
          let url: string | undefined = undefined;
          if (
            secureUrl &&
            typeof secureUrl === "string" &&
            secureUrl.trim() !== ""
          ) {
            url = secureUrl;
          } else if (publicId) {
            try {
              // @ts-ignore
              const resource_type =
                (file as any).resource_type ||
                ((file as any).mimetype === "application/pdf"
                  ? "raw"
                  : undefined);
              // @ts-ignore
              const format =
                (file as any).format ||
                ((file as any).mimetype === "application/pdf"
                  ? "pdf"
                  : undefined);
              url = cloudinary.url(publicId, {
                secure: true,
                ...(resource_type ? { resource_type } : {}),
                ...(format ? { format } : {}),
              });
            } catch (err) {
              // ignore and leave url undefined
            }
          }
          const labelFromJson =
            itemsJson &&
            itemsJson[idx] &&
            (itemsJson[idx].text || itemsJson[idx].label);
          return {
            label: labelFromJson || originalName || `Item ${idx + 1}`,
            note: undefined,
            url,
            publicId,
            originalName,
            mimetype: file.mimetype,
            size: file.size,
            clientId: undefined,
          };
        })
        .filter((it) => it.url);
      if (filesAsItems.length > 0) mappedItems.push(...filesAsItems);
    }
    // If client requested removals, attempt to delete those publicIds from
    // cloudinary and remove any mapped items that refer to those publicIds.
    // Record which publicIds were actually deleted so the client can reconcile.
    const deletedPublicIds: string[] = [];
    if (removedPublicIds && removedPublicIds.length > 0) {
      console.debug(
        `[requirements] attempting to destroy staged publicIds: ${JSON.stringify(removedPublicIds)}`
      );
      for (const pub of removedPublicIds) {
        try {
          const maybeItem =
            mappedItems.find((it: any) => it.publicId === pub) ||
            (itemsJson || []).find((ij: any) => ij?.file?.id === pub);
          const isPdf = (maybeItem?.mimetype || "").includes("pdf");
          // @ts-ignore
          const resp = await cloudinary.uploader.destroy(pub, {
            resource_type: isPdf ? "raw" : "image",
          });
          console.debug(
            `[requirements] destroy result for ${pub}: ${JSON.stringify(resp)}`
          );
          if (
            resp &&
            (resp.result === "ok" ||
              resp.result === "not_found" ||
              resp === "ok")
          ) {
            deletedPublicIds.push(pub);
          }
        } catch (err) {
          console.debug(`[requirements] failed to destroy ${pub}`, err);
        }
      }
      mappedItems = mappedItems.filter(
        (it: any) => !removedPublicIds.includes(it.publicId)
      );
    }
    // Merge with existing draft (if any) instead of replacing so previously saved items remain.
    // If no draft exists but we have a submitted document (draftSeed), use that as the base draft.
    let existingDraft = await RequirementsSubmissionModel.findOne({
      userID,
      status: "draft",
    });
    let seededFromSubmitted = false;
    if (!existingDraft && draftSeed) {
      // Create an in-memory draft-like object to merge into and persist later.
      existingDraft = new RequirementsSubmissionModel({
        userID,
        items: draftSeed,
        status: "draft",
      });
      seededFromSubmitted = true;
    }
    let finalItems = mappedItems;
    if (existingDraft) {
      // If client requested removals, ensure those items are removed from the
      // existing draft document (cloudinary resources have already been destroyed above).
      if (removedPublicIds && removedPublicIds.length > 0) {
        existingDraft.items = (existingDraft.items || []).filter(
          (it: any) => !removedPublicIds.includes(it.publicId)
        );
      }
      const merged: any[] = [...(existingDraft.items || [])];
      for (const newIt of mappedItems) {
        if (!newIt) continue;
        const idx = merged.findIndex(
          (m) =>
            (newIt.clientId && m.clientId === newIt.clientId) ||
            m.label === newIt.label
        );
        if (idx !== -1) {
          const old = merged[idx];
          if (
            old &&
            old.publicId &&
            newIt.publicId &&
            old.publicId !== newIt.publicId
          ) {
            try {
              const isPdf = (old.mimetype || "").includes("pdf");
              // @ts-ignore
              await cloudinary.uploader.destroy(old.publicId, {
                resource_type: isPdf ? "raw" : "image",
              });
            } catch (err) {
              // ignore
            }
          }
          merged[idx] = { ...merged[idx], ...newIt };
        } else {
          merged.push(newIt);
        }
      }
      finalItems = merged;
      existingDraft.items = finalItems as any;
      // If this draft was created in-memory from a submitted document, ensure we persist it.
      if (seededFromSubmitted) {
        await existingDraft.save();
      } else {
        await existingDraft.save();
      }
      // Normalize returned draft items so frontend always receives `publicId` and `url`
      const existingNormalized = existingDraft.toObject
        ? existingDraft.toObject()
        : existingDraft;
      if (Array.isArray(existingNormalized.items)) {
        existingNormalized.items = existingNormalized.items.map((it: any) => ({
          label: it.label,
          note: it.note,
          url: it.url,
          publicId: it.publicId || it.public_id || it.publicid || null,
          originalName: it.originalName || it.originalname || null,
          mimetype: it.mimetype || it.mimeType || null,
          size: it.size || null,
          clientId: it.clientId || null,
        }));
      }
      return res.status(OK).json({
        message: "Draft saved",
        draft: existingNormalized,
        deletedPublicIds,
      });
    }

    // create new draft
    const draft = await RequirementsSubmissionModel.create({
      userID,
      items: finalItems,
      status: "draft",
    });
    const normalizedDraft = draft.toObject ? draft.toObject() : draft;
    if (Array.isArray(normalizedDraft.items)) {
      normalizedDraft.items = normalizedDraft.items.map((it: any) => ({
        label: it.label,
        note: it.note,
        url: it.url,
        publicId: it.publicId || it.public_id || it.publicid || null,
        originalName: it.originalName || it.originalname || null,
        mimetype: it.mimetype || it.mimeType || null,
        size: it.size || null,
        clientId: it.clientId || null,
      }));
    }
    return res.status(OK).json({
      message: "Draft saved",
      draft: normalizedDraft,
      deletedPublicIds,
    });
  }
);

// Get current user's submissions
export const getUserRequirementsSubmissions = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;

    const subs = await RequirementsSubmissionModel.find({ userID }).sort({
      submittedAt: -1,
    });
    return res.status(OK).json({ submissions: subs });
  }
);

// Delete a specific file from the user's draft/submission by publicId
export const deleteRequirementFile = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const { publicId, label } = req.body as {
      publicId?: string;
      label?: string;
    };

    if (!publicId && !label) {
      return res.status(400).json({ message: "publicId or label required" });
    }

    // Only allow deleting files from a draft (submitted documents are locked)
    const doc = await RequirementsSubmissionModel.findOne({
      userID,
      status: "draft",
    });
    if (!doc) {
      // No draft document found. As a best-effort fallback, attempt to destroy
      // the Cloudinary resource directly if a publicId was provided. This
      // covers the case where the frontend uploaded a file but never saved a
      // draft record on the server (so there is no DB entry to remove it from),
      // yet the user expects the "Remove File" button to also remove the
      // uploaded resource from Cloudinary.
      if (publicId) {
        // Try to infer mimetype by searching any submission that may contain
        // this publicId so we can choose the correct resource_type. If none
        // found, default to image.
        let maybeItem: any | null = null;
        try {
          const found = await RequirementsSubmissionModel.findOne({
            "items.publicId": publicId,
          });
          if (found) {
            maybeItem =
              (found.items || []).find((it: any) => it.publicId === publicId) ||
              null;
          }
        } catch (e) {
          // ignore DB lookup errors and fall back to default behavior
        }

        const isPdf = (maybeItem?.mimetype || "").includes("pdf");
        let destroyResp: any = null;
        try {
          // @ts-ignore
          destroyResp = await cloudinary.uploader.destroy(publicId, {
            resource_type: isPdf ? "raw" : "image",
          });
        } catch (err) {
          // capture error for debugging but don't throw
          destroyResp = { error: String(err) };
        }
        return res.status(OK).json({
          message: "File removed (best-effort)",
          destroyed: destroyResp,
        });
      }

      return res
        .status(404)
        .json({ message: "No draft found to remove file from" });
    }

    // Find index of matching item by publicId or label. Be tolerant: publicId
    // may be returned in different formats (with folder prefix) so try suffix
    // and url matching as a fallback.
    let idx = -1;
    if (publicId) {
      idx = doc.items.findIndex(
        (it: any) =>
          it.publicId === publicId || (it.publicId || "").endsWith(publicId)
      );
      if (idx === -1) {
        // try searching within urls
        idx = doc.items.findIndex((it: any) =>
          (it.url || "").includes(publicId)
        );
      }
    }
    if (idx === -1 && label) {
      idx = doc.items.findIndex((it: any) => it.label === label);
    }

    // If still not found but publicId provided, attempt best-effort destroy
    if (idx === -1) {
      if (publicId) {
        let destroyResp: any = null;
        try {
          // try to infer mimetype by looking for any submission entry
          const found = await RequirementsSubmissionModel.findOne({
            "items.publicId": publicId,
          });
          const maybeItem =
            found &&
            (found.items || []).find((it: any) => it.publicId === publicId);
          const isPdf = (maybeItem?.mimetype || "").includes("pdf");
          // @ts-ignore
          destroyResp = await cloudinary.uploader.destroy(publicId, {
            resource_type: isPdf ? "raw" : "image",
          });
        } catch (err) {
          destroyResp = { error: String(err) };
        }
        return res.status(OK).json({
          message: "File removed (best-effort)",
          destroyed: destroyResp,
          note: "File was not found in the current draft document but a best-effort cloud destroy was attempted.",
        });
      }
      return res.status(404).json({ message: "File not found" });
    }

    const removed = doc.items.splice(idx, 1)[0];

    // Try to delete resource from Cloudinary if publicId present
    let destroyResp: any = null;
    if (removed?.publicId) {
      try {
        const isPdf = (removed.mimetype || "").includes("pdf");
        // @ts-ignore
        destroyResp = await cloudinary.uploader.destroy(removed.publicId, {
          resource_type: isPdf ? "raw" : "image",
        });
      } catch (err) {
        destroyResp = { error: String(err) };
      }
    }

    await doc.save();
    return res
      .status(OK)
      .json({ message: "File removed", doc, destroyed: destroyResp });
  }
);

// Replace a single requirement item (works against draft if present else submitted doc -> resubmit semantics)
export const replaceRequirementItem = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const files = (req.files as Express.Multer.File[]) || [];
    const file = files[0];
    const {
      label,
      publicId: existingPublicId,
      note,
    } = req.body as {
      label?: string;
      publicId?: string;
      note?: string;
    };

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }
    if (!label && !existingPublicId) {
      return res.status(400).json({ message: "label or publicId required" });
    }

    // prefer modifying draft first; else modify submitted (resubmit semantics)
    // Cast string userID to ObjectId for service helpers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userObjectId =
      (req as any).userObjectId ||
      (mongoose.Types.ObjectId.isValid(userID)
        ? new mongoose.Types.ObjectId(userID)
        : (userID as any));
    let targetDoc = await findDraft(userObjectId);
    let isDraft = true;
    if (!targetDoc) {
      // No draft. Check submitted.
      const submitted = await findSubmitted(userObjectId);
      if (submitted) {
        // Auto-create draft clone so future resubmit merges reliably.
        const draftClone = new RequirementsSubmissionModel({
          userID: submitted.userID,
          items: submitted.items.map((it: any) => ({ ...it })),
          status: "draft",
        });
        await draftClone.save();
        targetDoc = draftClone as any;
        isDraft = true;
        console.debug(
          `[requirements][replace] user=${userID} auto-created draft from submitted ${submitted._id}`
        );
      } else {
        console.debug(
          `[requirements][replace] user=${userID} no target document (draft/submitted) found`
        );
        return res.status(404).json({
          message: "No requirements document found to replace item in",
        });
      }
    }
    if (!targetDoc) {
      return res
        .status(500)
        .json({ message: "Unexpected missing target document" });
    }
    console.debug(
      `[requirements][replace] user=${userID} targetingDoc=${targetDoc._id} isDraft=${isDraft} existingItems=${targetDoc.items.length}`
    );

    // locate existing item index by label or publicId
    let idx = -1;
    if (existingPublicId) {
      idx = targetDoc.items.findIndex(
        (it: any) =>
          it.publicId === existingPublicId ||
          (it.publicId || "").endsWith(existingPublicId)
      );
    }
    if (idx === -1 && label) {
      idx = targetDoc.items.findIndex((it: any) => it.label === label);
    }

    // Build new item metadata from uploaded file
    // @ts-ignore
    const secureUrl =
      (file as any).secure_url || (file as any).url || (file as any).path;
    // @ts-ignore
    const newPublicId = (file as any).public_id || (file as any).publicId;
    let newUrl: string | undefined = secureUrl;
    if (!newUrl && newPublicId) {
      try {
        const isPdf = file.mimetype === "application/pdf";
        newUrl = cloudinary.url(newPublicId, {
          secure: true,
          resource_type: isPdf ? "raw" : "image",
          format: isPdf ? "pdf" : undefined,
        });
      } catch {
        // ignore
      }
    }
    if (!newUrl) {
      return res
        .status(500)
        .json({ message: "Unable to determine uploaded file URL" });
    }

    const replacement = {
      label:
        label ||
        (idx !== -1
          ? targetDoc!.items[idx].label
          : file.originalname || "Item"),
      note: note ?? (idx !== -1 ? targetDoc!.items[idx].note : undefined),
      url: newUrl,
      publicId: newPublicId,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    // Delete old cloudinary resource if replacing existing
    if (idx !== -1) {
      const old = targetDoc!.items[idx];
      if (old && old.publicId && old.publicId !== newPublicId) {
        try {
          const isPdf = (old.mimetype || "").includes("pdf");
          // @ts-ignore
          await cloudinary.uploader.destroy(old.publicId, {
            resource_type: isPdf ? "raw" : "image",
          });
        } catch {
          // ignore deletion errors
        }
      }
      targetDoc!.items[idx] = { ...old, ...replacement } as any;
      console.debug(
        `[requirements][replace] user=${userID} replaced index=${idx} label=${replacement.label}`
      );
    } else {
      // append new item if not found (treat as addition)
      targetDoc!.items.push(replacement as any);
      console.debug(
        `[requirements][replace] user=${userID} appended label=${replacement.label}`
      );
    }

    // If modifying a submitted document, bump submittedAt to reflect resubmission semantics
    if (!isDraft) {
      targetDoc!.submittedAt = new Date();
    }

    // mark items modified explicitly (edge cases with nested arrays sometimes need this)
    try {
      (targetDoc as any).markModified &&
        (targetDoc as any).markModified("items");
    } catch {}
    await saveSubmission(targetDoc!);
    // refetch to ensure we return persisted, not in-memory mutated doc
    const fresh = await RequirementsSubmissionModel.findById(targetDoc!._id);
    if (fresh) {
      targetDoc = fresh as any;
    }
    console.debug(
      `[requirements][replace] user=${userID} finalItems=${targetDoc ? targetDoc.items.length : "n/a"}`
    );

    return res.status(OK).json({
      message:
        idx !== -1 ? "Requirement item replaced" : "Requirement item added",
      status: targetDoc!.status,
      submission: targetDoc!,
    });
  }
);

// Get current draft and submitted documents separately for debugging / UI clarity
export const getCurrentRequirementsStatus = catchErrors(
  async (req: Request, res: Response) => {
    const userID = req.userID!;
    const [draft, submitted] = await Promise.all([
      RequirementsSubmissionModel.findOne({ userID, status: "draft" }),
      RequirementsSubmissionModel.findOne({ userID, status: "submitted" }),
    ]);
    return res.status(OK).json({ draft, submitted });
  }
);
