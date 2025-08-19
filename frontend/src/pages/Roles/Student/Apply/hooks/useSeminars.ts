import { useState } from "react";

export default function useSeminars(
  initialSeminars = [
    { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
  ]
) {
  const [seminars, setSeminars] = useState(initialSeminars);

  const addSeminar = () => {
    setSeminars((prev) => [
      ...prev,
      { title: "", sponsoringAgency: "", inclusiveDate: "", place: "" },
    ]);
  };

  const removeSeminar = (index: number) => {
    setSeminars((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSeminar = (index: number, field: string, value: string) => {
    setSeminars((prev) =>
      prev.map((seminar, i) =>
        i === index ? { ...seminar, [field]: value } : seminar
      )
    );
  };

  return { seminars, addSeminar, removeSeminar, updateSeminar, setSeminars };
}
