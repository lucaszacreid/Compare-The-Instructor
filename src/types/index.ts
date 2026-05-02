export interface Lead {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  lessonType: "manual" | "automatic";
  experience: "beginner" | "some" | "moderate" | "ready";
  confidence: "very_nervous" | "somewhat_nervous" | "fairly_confident" | "very_confident";
  duration: "1" | "1.5" | "2";
  availability: string[];
  budget: number;
  startTime: "asap" | "two_weeks" | "month" | "exploring";
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
