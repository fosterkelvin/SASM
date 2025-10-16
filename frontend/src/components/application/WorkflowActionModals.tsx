import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar, Clock, MapPin, Link as LinkIcon, Award, Users } from "lucide-react";

// Psychometric Test Schedule Modal
interface PsychometricScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const PsychometricScheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: PsychometricScheduleModalProps) => {
  const [formData, setFormData] = useState({
    psychometricTestDate: "",
    psychometricTestTime: "",
    psychometricTestLocation: "",
    psychometricTestLink: "",
    psychometricTestNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.psychometricTestDate || !formData.psychometricTestTime) {
      alert("Date and time are required");
      return;
    }
    if (!formData.psychometricTestLocation && !formData.psychometricTestLink) {
      alert("Either location or link is required");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schedule Psychometric Test</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Test Date *
                </Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.psychometricTestDate}
                  onChange={(e) =>
                    setFormData({ ...formData, psychometricTestDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="testTime">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Test Time *
                </Label>
                <Input
                  id="testTime"
                  type="time"
                  value={formData.psychometricTestTime}
                  onChange={(e) =>
                    setFormData({ ...formData, psychometricTestTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="testLocation">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location (if in-person)
              </Label>
              <Input
                id="testLocation"
                placeholder="e.g., HR Office Room 201"
                value={formData.psychometricTestLocation}
                onChange={(e) =>
                  setFormData({ ...formData, psychometricTestLocation: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="testLink">
                <LinkIcon className="h-4 w-4 inline mr-2" />
                Link (if online)
              </Label>
              <Input
                id="testLink"
                type="url"
                placeholder="https://test.example.com/abc123"
                value={formData.psychometricTestLink}
                onChange={(e) =>
                  setFormData({ ...formData, psychometricTestLink: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="testNotes">Additional Notes</Label>
              <textarea
                id="testNotes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Please bring a valid ID"
                value={formData.psychometricTestNotes}
                onChange={(e) =>
                  setFormData({ ...formData, psychometricTestNotes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Scheduling..." : "Schedule Test"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Psychometric Score Submit Modal
interface PsychometricScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const PsychometricScoreModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: PsychometricScoreModalProps) => {
  const [formData, setFormData] = useState({
    psychometricTestScore: "",
    psychometricTestPassed: true,
    psychometricTestNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseFloat(formData.psychometricTestScore);
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Score must be between 0 and 100");
      return;
    }
    onSubmit({
      psychometricTestScore: score,
      psychometricTestPassed: formData.psychometricTestPassed,
      psychometricTestNotes: formData.psychometricTestNotes,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Submit Test Score</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="score">Test Score (0-100) *</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="85"
                value={formData.psychometricTestScore}
                onChange={(e) =>
                  setFormData({ ...formData, psychometricTestScore: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Result *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passed"
                    checked={formData.psychometricTestPassed === true}
                    onChange={() =>
                      setFormData({ ...formData, psychometricTestPassed: true })
                    }
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-green-600 font-medium">Passed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passed"
                    checked={formData.psychometricTestPassed === false}
                    onChange={() =>
                      setFormData({ ...formData, psychometricTestPassed: false })
                    }
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-red-600 font-medium">Failed</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Strong analytical skills demonstrated"
                value={formData.psychometricTestNotes}
                onChange={(e) =>
                  setFormData({ ...formData, psychometricTestNotes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={
                  formData.psychometricTestPassed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {loading ? "Submitting..." : "Submit Score"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Interview Schedule Modal
interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const InterviewScheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: InterviewScheduleModalProps) => {
  const [formData, setFormData] = useState({
    interviewDate: "",
    interviewTime: "",
    interviewMode: "in-person" as "in-person" | "virtual" | "phone",
    interviewLocation: "",
    interviewLink: "",
    interviewNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.interviewDate || !formData.interviewTime) {
      alert("Date and time are required");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schedule Interview</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interviewDate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Interview Date *
                </Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="interviewTime">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Interview Time *
                </Label>
                <Input
                  id="interviewTime"
                  type="time"
                  value={formData.interviewTime}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label>Interview Mode *</Label>
              <div className="flex gap-4 mt-2">
                {["in-person", "virtual", "phone"].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={formData.interviewMode === mode}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          interviewMode: mode as "in-person" | "virtual" | "phone",
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.interviewMode === "in-person" && (
              <div>
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., HR Office Conference Room"
                  value={formData.interviewLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewLocation: e.target.value })
                  }
                />
              </div>
            )}

            {formData.interviewMode === "virtual" && (
              <div>
                <Label htmlFor="link">
                  <LinkIcon className="h-4 w-4 inline mr-2" />
                  Meeting Link
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={formData.interviewLink}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewLink: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <Label htmlFor="interviewNotes">Interview Notes</Label>
              <textarea
                id="interviewNotes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Panel interview with 3 members"
                value={formData.interviewNotes}
                onChange={(e) =>
                  setFormData({ ...formData, interviewNotes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Interview Result Modal
interface InterviewResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const InterviewResultModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: InterviewResultModalProps) => {
  const [formData, setFormData] = useState({
    interviewScore: 3,
    interviewPassed: true,
    interviewNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Submit Interview Result</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Interview Score (1-5) *</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setFormData({ ...formData, interviewScore: score })}
                    className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                      formData.interviewScore === score
                        ? "bg-blue-600 text-white border-blue-600 scale-110"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent
              </p>
            </div>

            <div>
              <Label>Result *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passed"
                    checked={formData.interviewPassed === true}
                    onChange={() => setFormData({ ...formData, interviewPassed: true })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-green-600 font-medium">Passed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="passed"
                    checked={formData.interviewPassed === false}
                    onChange={() => setFormData({ ...formData, interviewPassed: false })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-red-600 font-medium">Failed</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Interview Notes</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Excellent communication skills, strong motivation"
                value={formData.interviewNotes}
                onChange={(e) =>
                  setFormData({ ...formData, interviewNotes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={
                  formData.interviewPassed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {loading ? "Submitting..." : "Submit Result"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Set as Trainee Modal
interface SetAsTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  supervisors?: any[];
}

export const SetAsTraineeModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  supervisors = [],
}: SetAsTraineeModalProps) => {
  const [formData, setFormData] = useState({
    traineeStartDate: "",
    requiredHours: "",
    traineeOffice: "",
    traineeSupervisor: "",
    traineeNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseInt(formData.requiredHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Required hours must be a positive number");
      return;
    }
    if (!formData.traineeStartDate) {
      alert("Start date is required");
      return;
    }
    onSubmit({
      ...formData,
      requiredHours: hours,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Users className="h-5 w-5 inline mr-2" />
            Set as Trainee
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.traineeStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, traineeStartDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="hours">Required Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  placeholder="200"
                  value={formData.requiredHours}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredHours: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="office">Office/Department</Label>
              <Input
                id="office"
                placeholder="e.g., Student Affairs Office"
                value={formData.traineeOffice}
                onChange={(e) =>
                  setFormData({ ...formData, traineeOffice: e.target.value })
                }
              />
            </div>

            {supervisors.length > 0 && (
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <select
                  id="supervisor"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.traineeSupervisor}
                  onChange={(e) =>
                    setFormData({ ...formData, traineeSupervisor: e.target.value })
                  }
                >
                  <option value="">Select a supervisor...</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.firstname} {supervisor.lastname}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="traineeNotes">Notes</Label>
              <textarea
                id="traineeNotes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Assigned to records management tasks"
                value={formData.traineeNotes}
                onChange={(e) =>
                  setFormData({ ...formData, traineeNotes: e.target.value })
                }
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once set as trainee, you'll need to regularly update their
                completed hours. The system will automatically mark training as complete when they
                reach the required hours.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {loading ? "Setting..." : "Set as Trainee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Update Trainee Hours Modal
interface UpdateHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  currentHours: number;
  requiredHours: number;
}

export const UpdateHoursModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  currentHours = 0,
  requiredHours = 0,
}: UpdateHoursModalProps) => {
  const [formData, setFormData] = useState({
    completedHours: currentHours.toString(),
    traineeNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(formData.completedHours);
    if (isNaN(hours) || hours < 0) {
      alert("Completed hours must be a positive number");
      return;
    }
    onSubmit({
      completedHours: hours,
      traineeNotes: formData.traineeNotes,
    });
  };

  const newHours = parseFloat(formData.completedHours) || 0;
  const progress = (newHours / requiredHours) * 100;
  const willComplete = newHours >= requiredHours;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Update Trainee Hours</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hours">Completed Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder={currentHours.toString()}
                value={formData.completedHours}
                onChange={(e) =>
                  setFormData({ ...formData, completedHours: e.target.value })
                }
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Current: {currentHours} / {requiredHours} hours
              </p>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    willComplete ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {willComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  🎉 Training will be marked as complete! The trainee has met the required hours.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Good performance this week, on track"
                value={formData.traineeNotes}
                onChange={(e) =>
                  setFormData({ ...formData, traineeNotes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={willComplete ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {loading ? "Updating..." : "Update Hours"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Accept Application Modal
interface AcceptApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  applicantName: string;
}

export const AcceptApplicationModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  applicantName,
}: AcceptApplicationModalProps) => {
  const [formData, setFormData] = useState({
    traineePerformanceRating: 5,
    hrComments: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Award className="h-5 w-5 inline mr-2" />
            Accept Application
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">
                You are about to accept <strong>{applicantName}</strong>'s application.
              </p>
              <p className="text-sm text-green-700 mt-2">
                This is the final step. The applicant will be officially accepted and notified.
              </p>
            </div>

            <div>
              <Label>Trainee Performance Rating (1-5) *</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, traineePerformanceRating: rating })
                    }
                    className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                      formData.traineePerformanceRating === rating
                        ? "bg-yellow-400 text-white border-yellow-400 scale-110"
                        : "bg-white text-gray-600 border-gray-300 hover:border-yellow-400"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                How did they perform during training?
              </p>
            </div>

            <div>
              <Label htmlFor="comments">Final Comments</Label>
              <textarea
                id="comments"
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="e.g., Excellent trainee, highly recommended. Demonstrated strong work ethic and teamwork skills."
                value={formData.hrComments}
                onChange={(e) =>
                  setFormData({ ...formData, hrComments: e.target.value })
                }
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Requirements:</strong> Applicant must have a verified @s.ubaguio.edu email
                address.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Accepting..." : "Accept Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Reject Application Modal
interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  applicantName: string;
}

export const RejectApplicationModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  applicantName,
}: RejectApplicationModalProps) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required");
      return;
    }
    onSubmit({ rejectionReason });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-red-600">Reject Application</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">
                You are about to reject <strong>{applicantName}</strong>'s application.
              </p>
              <p className="text-sm text-red-700 mt-2">
                The applicant will be notified. This action cannot be undone.
              </p>
            </div>

            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <textarea
                id="reason"
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="Please provide a clear reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Be professional and constructive in your feedback.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Rejecting..." : "Reject Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
