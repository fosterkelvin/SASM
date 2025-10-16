import DTRModel, { IDTR, IDTREntry } from "../models/dtr.model";
import mongoose from "mongoose";

export class DTRService {
  /**
   * Get or create DTR for a specific month/year
   */
  async getOrCreateDTR(
    userId: string,
    month: number,
    year: number
  ): Promise<IDTR> {
    const existingDTR = await DTRModel.findOne({ userId, month, year });

    if (existingDTR) {
      return existingDTR;
    }

    // Create new DTR with default entries for each day of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const entries: IDTREntry[] = Array.from(
      { length: daysInMonth },
      (_, i) => ({
        day: i + 1,
        status: "",
        totalHours: 0,
        confirmationStatus: "unconfirmed" as const,
      })
    );

    const newDTR = await DTRModel.create({
      userId,
      month,
      year,
      entries,
      status: "draft",
    });

    return newDTR;
  }

  /**
   * Get DTR by ID
   */
  async getDTRById(dtrId: string): Promise<IDTR | null> {
    return await DTRModel.findById(dtrId);
  }

  /**
   * Get all DTRs for a user
   */
  async getUserDTRs(userId: string): Promise<IDTR[]> {
    return await DTRModel.find({ userId }).sort({ year: -1, month: -1 });
  }

  /**
   * Get DTRs for a user within a date range
   */
  async getUserDTRsInRange(
    userId: string,
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ): Promise<IDTR[]> {
    return await DTRModel.find({
      userId,
      $or: [
        { year: { $gt: startYear } },
        { year: startYear, month: { $gte: startMonth } },
      ],
      $and: [
        { year: { $lt: endYear } },
        { year: endYear, month: { $lte: endMonth } },
      ],
    }).sort({ year: -1, month: -1 });
  }

  /**
   * Update DTR entries
   */
  async updateDTR(dtrId: string, updates: Partial<IDTR>): Promise<IDTR | null> {
    const dtr = await DTRModel.findByIdAndUpdate(
      dtrId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    return dtr;
  }

  /**
   * Update specific DTR entry
   */
  async updateDTREntry(
    dtrId: string,
    day: number,
    entryData: Partial<IDTREntry>
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findById(dtrId);
    if (!dtr) return null;

    const entryIndex = dtr.entries.findIndex((e) => e.day === day);

    console.log("updateDTREntry - day:", day);
    console.log("updateDTREntry - entryData:", entryData);
    console.log(
      "updateDTREntry - existing entry:",
      entryIndex !== -1 ? dtr.entries[entryIndex] : "NEW"
    );

    // Always set entry as "unconfirmed" when student saves
    const dataWithConfirmation: any = {
      ...entryData,
      confirmationStatus: "unconfirmed",
    };

    // Remove confirmation fields when student edits
    delete dataWithConfirmation.confirmedBy;
    delete dataWithConfirmation.confirmedAt;

    if (entryIndex === -1) {
      // Create new entry with day field
      const newEntry = { day, ...dataWithConfirmation } as IDTREntry;
      console.log("Creating NEW entry:", newEntry);
      dtr.entries.push(newEntry);
    } else {
      // Update existing entry - merge with existing data
      const updatedEntry = {
        ...dtr.entries[entryIndex],
        ...dataWithConfirmation,
        day: dtr.entries[entryIndex].day, // Ensure day is preserved
      } as IDTREntry;
      console.log("Updating entry FROM:", dtr.entries[entryIndex]);
      console.log("Updating entry TO:", updatedEntry);
      dtr.entries[entryIndex] = updatedEntry;
    }

    await dtr.save();
    return dtr;
  }

  /**
   * Update specific DTR entry by office staff
   * Office updates can modify confirmation status directly and track edit history
   */
  async updateDTREntryByOffice(
    dtrId: string,
    day: number,
    entryData: Partial<IDTREntry>,
    officeUserId: string,
    profileName?: string
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findById(dtrId);
    if (!dtr) return null;

    const entryIndex = dtr.entries.findIndex((e) => e.day === day);
    const now = new Date();

    if (entryIndex === -1) {
      // Create new entry with edit history
      const newEntry = {
        day,
        ...entryData,
        editHistory: [
          {
            editedBy: officeUserId,
            editedByName: profileName || "Office Staff",
            editedAt: now,
            changes: Object.entries(entryData).map(([field, value]) => ({
              field,
              oldValue: "-", // Use "-" for new entries where there's no previous value
              newValue: String(value || "-"),
            })),
          },
        ],
      } as IDTREntry;
      dtr.entries.push(newEntry);
    } else {
      // Track changes
      const oldEntry = dtr.entries[entryIndex];
      const changes: { field: string; oldValue: string; newValue: string }[] =
        [];

      // Compare each field
      const fieldsToTrack = ["in1", "out1", "in2", "out2", "status"];
      fieldsToTrack.forEach((field) => {
        const oldValue = (oldEntry as any)[field] || "";
        const newValue = (entryData as any)[field];
        if (newValue !== undefined && oldValue !== newValue) {
          changes.push({
            field,
            oldValue: String(oldValue) || "-", // Use "-" if old value is empty
            newValue: String(newValue) || "-", // Use "-" if new value is empty
          });
        }
      });

      // Only add to history if there are actual changes
      if (changes.length > 0) {
        const editHistory = oldEntry.editHistory || [];
        editHistory.push({
          editedBy: officeUserId,
          editedByName: profileName || "Office Staff",
          editedAt: now,
          changes,
        });

        // Update entry with edit history
        const updatedEntry = {
          ...oldEntry,
          ...entryData,
          day: oldEntry.day,
          editHistory,
        } as IDTREntry;
        dtr.entries[entryIndex] = updatedEntry;
      } else {
        // No changes, just merge data
        const updatedEntry = {
          ...oldEntry,
          ...entryData,
          day: oldEntry.day,
        } as IDTREntry;
        dtr.entries[entryIndex] = updatedEntry;
      }
    }

    await dtr.save();
    return dtr;
  }

  /**
   * Submit DTR for approval
   */
  async submitDTR(dtrId: string): Promise<IDTR | null> {
    const dtr = await DTRModel.findByIdAndUpdate(
      dtrId,
      {
        $set: {
          status: "submitted",
          submittedAt: new Date(),
        },
      },
      { new: true }
    );
    return dtr;
  }

  /**
   * Approve DTR (Office use)
   */
  async approveDTR(
    dtrId: string,
    checkedBy: string,
    remarks?: string
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findByIdAndUpdate(
      dtrId,
      {
        $set: {
          status: "approved",
          checkedBy,
          checkedAt: new Date(),
          remarks,
        },
      },
      { new: true }
    );
    return dtr;
  }

  /**
   * Reject DTR (Office use)
   */
  async rejectDTR(
    dtrId: string,
    checkedBy: string,
    remarks: string
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findByIdAndUpdate(
      dtrId,
      {
        $set: {
          status: "rejected",
          checkedBy,
          checkedAt: new Date(),
          remarks,
        },
      },
      { new: true }
    );
    return dtr;
  }

  /**
   * Confirm DTR entry (Office use)
   */
  async confirmDTREntry(
    dtrId: string,
    day: number,
    confirmedBy: string,
    profileName?: string
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findById(dtrId);
    if (!dtr) return null;

    const entryIndex = dtr.entries.findIndex((e) => e.day === day);
    if (entryIndex === -1) return null;

    dtr.entries[entryIndex].confirmationStatus = "confirmed";
    dtr.entries[entryIndex].confirmedBy = confirmedBy;
    dtr.entries[entryIndex].confirmedByProfile = profileName;
    dtr.entries[entryIndex].confirmedAt = new Date();

    await dtr.save();
    return dtr;
  }

  /**
   * Confirm all DTR entries for a month (Office use)
   */
  async confirmAllDTREntries(
    dtrId: string,
    confirmedBy: string,
    profileName?: string
  ): Promise<IDTR | null> {
    const dtr = await DTRModel.findById(dtrId);
    if (!dtr) return null;

    dtr.entries.forEach((entry) => {
      if (entry.in1 || entry.in2 || entry.out1 || entry.out2) {
        entry.confirmationStatus = "confirmed";
        entry.confirmedBy = confirmedBy;
        entry.confirmedByProfile = profileName;
        entry.confirmedAt = new Date();
      }
    });

    await dtr.save();
    return dtr;
  }

  /**
   * Delete DTR
   */
  async deleteDTR(dtrId: string): Promise<boolean> {
    const result = await DTRModel.findByIdAndDelete(dtrId);
    return !!result;
  }

  /**
   * Get all submitted DTRs (for office view)
   */
  async getSubmittedDTRs(filters?: {
    month?: number;
    year?: number;
    status?: string;
  }): Promise<IDTR[]> {
    const query: any = {
      status: { $in: ["submitted", "approved", "rejected"] },
    };

    if (filters?.month) query.month = filters.month;
    if (filters?.year) query.year = filters.year;
    if (filters?.status) query.status = filters.status;

    return await DTRModel.find(query)
      .populate("userId", "firstname lastname email studentID")
      .sort({ submittedAt: -1 });
  }

  /**
   * Calculate total hours for a DTR
   */
  calculateTotalHours(entries: IDTREntry[]): number {
    return entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  }

  /**
   * Get DTR statistics for a user
   */
  async getUserDTRStats(userId: string) {
    const dtrs = await DTRModel.find({ userId });

    const stats = {
      totalDTRs: dtrs.length,
      totalHours: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
    };

    dtrs.forEach((dtr) => {
      stats.totalHours += dtr.totalMonthlyHours || 0;
      if (dtr.status === "submitted") stats.submitted++;
      if (dtr.status === "approved") stats.approved++;
      if (dtr.status === "rejected") stats.rejected++;
      if (dtr.status === "draft") stats.draft++;
    });

    return stats;
  }
}

export default new DTRService();
