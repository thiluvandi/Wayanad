export type Member = "Nayan" | "Navin" | "Aditya" | "Gaurav" | "Gangadhar" | "Sachin";

export const MEMBERS: Member[] = ["Nayan", "Navin", "Aditya", "Gaurav", "Gangadhar", "Sachin"];

export interface Expense {
  id: string;
  paid_by: Member;
  amount: number;
  description: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  paid_by: Member;
  amount: string;
  description: string;
  location: string;
}
