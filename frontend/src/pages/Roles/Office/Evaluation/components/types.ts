export interface Scholar {
  id: string;
  name: string;
  email: string;
  hasEvaluation?: boolean;
  evaluatorName?: string;
}

export interface CriterionEvaluation {
  criterion: string;
  rating?: number; // 1..5
  comment?: string;
  section?: string; // section name for grouping
}

export interface ScholarEvaluation {
  scholarId: string;
  date: string; // ISO
  items: CriterionEvaluation[];
  areasOfStrength?: string;
  areasOfImprovement?: string;
  recommendedForNextSemester?: boolean;
  justification?: string;
}

export const defaultCriteria = [
  "QUALITY OF WORK - Accomplishes tasks with accuracy, attention to details and produces quality output",
  "MANAGEMENT OF TASKS - Manages work productively and responsibly without supervision",
  "INSTRUCTION PROCEDURES - Follows instruction and executes work procedures correctly",
  "FEEDBACKING - Keeps superior informed of the status of tasks assigned to him/her",
  "ENDORSEMENTS - Endorses unfinished tasks to the next shift through proper communication and utilization of the endorsement logbook",
  "PROMPTNESS - Completes work assignments or tasks on time",
  "OFFICE/LABORATORY/SECURITY PROTOCOL - Observes office/laboratory/security protocols at all times",
  "CUSTOMER RELATIONS - shows good customer service and treats clients and visitors politely",
  "TELEPHONE ETIQUETTE - Shows proper decorum in telephone usage and answers telephone calls with utmost respect and warmth",
  "CLEANLINESS - Makes workign environment neat, clean and conducive for work.",
];

export const skillfulnessCriteria = [
  "COMMUNICATION SKILLS - Is able to express ideas and thoughts properly; manifests good communication skills",
  "LEADERSHIP SKILLS - Manifests good leadership skills, leads by example and is able to mobilize self and co-workers effectively",
  "ATTENDANCE & PUNCTUALITY - Reports to work regularly and on time; avoids being late or absent",
  "CONFIDENTIALITY - Holds stricts confidence all office and school communication and information",
  "COMPLIANCE TO WEARING THE PRESCRIBED S.A. UNIFORM - Always wears the prescribed SA uniform while on duty",
  "ECONOMICAL USE OF PROPERTIES AND SUPPLIES - Observes proper, careful, and economical use of the office and school properties/supplies",
];

export const personalQualitiesCriteria = [
  "COURTESY - Gives due respect and courtesy to superiors, clients, visitors and co - workers",
  "INITIATIVE - Shows initiative in his/her work",
  "EMOTIONAL BEHAVIOR - Is able to show positive attitude when corrected, under stress, pressure, provocation or even when reprimanded",
  "JUDGMENT - Uses sound judgment in doing assigned tasks",
  "COOPERATION - Cooperates with superiors and supports co-workers in the accomplishment of tasks",
  "CONCERN - Shows concern to office/laboratory wellness and to co-workers",
  "CREATIVITY - Discovers and adopts new and better ways of accomplishing tasks; innovates ways to improve services",
  "SERVICE ORIENTEDNESS - Renders extra hours of work and services willingly as need arises",
];
