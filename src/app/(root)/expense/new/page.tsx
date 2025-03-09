import { Metadata } from "next";
import ExpenseForm from "@/components/expense/ExpenseForm";

export const metadata: Metadata = {
  title: "新增報帳 | 報帳系統",
  description: "填寫報帳資料並上傳發票",
};

export default function NewExpensePage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <ExpenseForm />
    </div>
  );
}
