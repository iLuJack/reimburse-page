import { Metadata } from "next";
import ExpenseList from "@/components/expense/ExpenseList";

export const metadata: Metadata = {
  title: "報帳紀錄 | 報帳系統",
  description: "查看您的所有報帳紀錄",
};

export default function ExpensesPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <ExpenseList />
    </div>
  );
}
