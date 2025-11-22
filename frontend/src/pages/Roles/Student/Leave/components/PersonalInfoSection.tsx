import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/lib/api";
import type { LeaveFormData } from "./formTypes";

type Props = {
  data: LeaveFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

const PersonalInfoSection: React.FC<Props> = ({ data, onChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndPopulateData = async () => {
      if (!user) return;

      // Auto-populate name
      if (!data.name || !data.name.trim()) {
        const fullName = `${user.firstname || ""} ${
          user.lastname || ""
        }`.trim();
        if (fullName) {
          const evt = {
            target: { name: "name", value: fullName },
          } as unknown as
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>;
          onChange(evt);
        }
      }

      // Fetch user profile data to populate school/department and course/year
      if ((!data.schoolDept || !data.courseYear) && !loading) {
        try {
          setLoading(true);
          const userData = await getUserData();

          if (userData) {
            // Auto-populate school/department from profile
            if (!data.schoolDept && userData.college) {
              const schoolEvt = {
                target: { name: "schoolDept", value: userData.college },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(schoolEvt);
            }

            // Auto-populate course/year from profile
            if (!data.courseYear && userData.courseYear) {
              const courseEvt = {
                target: { name: "courseYear", value: userData.courseYear },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(courseEvt);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndPopulateData();
  }, [user]);

  return (
    <>
      {/* Hidden inputs to keep the data but not display them */}
      <input type="hidden" name="name" value={data.name} />
      <input type="hidden" name="schoolDept" value={data.schoolDept} />
      <input type="hidden" name="courseYear" value={data.courseYear} />
    </>
  );
};

export default PersonalInfoSection;
