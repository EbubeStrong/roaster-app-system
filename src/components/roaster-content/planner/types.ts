export type PlannerEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  userId: string;
  location?: string;
  color?: string;       // background color
  borderColor?: string; // left-border accent color
};

export type StaffMember = {
  id: string;
  name: string;
  initials: string;
  totalHours: number;
  weeklyHours: number;
  dateRange: string;
  status: "available" | "on-leave";
  days: string[]; // e.g. ["m","d","w","do","vr"]
};
