export interface Expense {
  id: string;
  user_id: string;
  expense_type: string;
  transaction_date: string;
  purpose: string;
  amount: number;
  participants: string;
  receipt_url?: string;
  created_at: string;
}

export type ExpenseFormData = Omit<Expense, "id" | "user_id" | "created_at"> & {
  receipt_file?: File;
};
