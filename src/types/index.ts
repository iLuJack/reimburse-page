export interface Expense {
  id: string;
  user_id: string;
  expense_type: string;
  transaction_date: string;
  purpose: string;
  amount: number;
  participants: string;
  receipt_url?: string;
  created_at?: string;
  email?: string;
}

export interface ExpenseFormData {
  expense_type: string;
  transaction_date: string;
  purpose: string;
  amount: number;
  participants: string;
  receipt_file?: File;
  receipt_url?: string;
}
