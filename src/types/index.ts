export interface Lead {
  id: string;
  submittedAt: string;
  tier?: "free" | "paid";
  status: "abandoned" | "completed" | "free_lead";
  abandonedAtStep?: 1 | 2 | 3;
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  lessonType: "manual" | "automatic" | "";
  experience: "beginner" | "some" | "moderate" | "ready" | "";
  confidence: "very_nervous" | "somewhat_nervous" | "fairly_confident" | "very_confident" | "";
  duration: "1" | "1.5" | "2" | "";
  availability: string[];
  budget: number;
  startTime: "asap" | "two_weeks" | "month" | "exploring" | "";
  paymentStatus: "paid" | "pending";
  stripeSessionId?: string;
}

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  lessonType: "manual" | "automatic" | "";
  experience: "beginner" | "some" | "moderate" | "ready" | "";
  confidence: "very_nervous" | "somewhat_nervous" | "fairly_confident" | "very_confident" | "";
  duration: "1" | "1.5" | "2" | "";
  availability: string[];
  budget: number;
  startTime: "asap" | "two_weeks" | "month" | "exploring" | "";
}

export interface InstructorInterest {
  id: string;
  submittedAt: string;
  name: string;
  phone: string;
  email: string;
  areasCovered: string;
  yearsExperience: string;
  hourlyRate: string;
}

// ── Instructor Hub types ──────────────────────────────────────────────────────

export interface InstructorProfile {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "denied";
  name: string;
  email: string;
  phone: string;
  location: string;
  areasCovered: string;
  yearsExperience: string;
  adiNumber: string;
  accessToken: string;
  approvedAt?: string;
  deniedAt?: string;
  denialReason?: string;
}

export interface LeadPush {
  id: string;
  pushedAt: string;
  leadId: string;
  targetInstructorId: string | null; // null = all approved instructors
  area: string;
  lessonType: string;
  experience: string;
  startTime: string;
  budget: string;
  note?: string;
}

export interface LeadRequest {
  id: string;
  requestedAt: string;
  leadId: string;
  pushId: string;
  instructorId: string;
  status: "pending" | "priced" | "accepted" | "declined";
  assignedPrice?: number;
  pricedAt?: string;
  respondedAt?: string;
}
