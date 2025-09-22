import React, { useEffect, useState } from "react";
import StudentSidebar from "@/components/sidebar/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import RequirementsList from "./components/RequirementsList";

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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Requirement[];
        // If Letter of Application exists, attach the address note to it if missing
        const letter = parsed.find((p) => p.text === "Letter of Application");
        if (letter && !letter.note) {
          letter.note = addrText;
          return parsed;
        }
        // If no letter exists, fall back to returning parsed as-is
        return parsed;
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  // import/paste removed — checklist is driven from the template and per-item uploads

  const setFileForItem = async (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
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
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, file: result } : it))
    );
  };

  const removeFileFromItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, file: null } : it))
    );
  };

  // per-item changes are limited to file uploads; no generic handleChange needed

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
    setSubmitSuccess(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      // client-only submit: show success and keep data in localStorage
      setSubmitSuccess("Requirements submitted successfully (client-only).");
    } else {
      // focus first error? for now just set errors
      setSubmitSuccess(null);
    }
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
  };

  // Clear/export moved/removed with the import area — checklist persists per-item

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900">
      <StudentSidebar
        currentPage="Requirements"
        onCollapseChange={setIsSidebarCollapsed}
      />

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
                  />

                  <div className="mt-4 flex items-center justify-end gap-3">
                    {Object.keys(errors).length > 0 && (
                      <div className="text-sm text-red-600 mr-auto">
                        Please fix the highlighted errors before submitting.
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="text-sm text-green-600 mr-auto">
                        {submitSuccess}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Submit Requirements
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 border rounded"
                      >
                        Reset form
                      </button>
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
