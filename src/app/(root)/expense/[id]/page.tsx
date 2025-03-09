import { Metadata } from "next";
import { notFound } from "next/navigation";
import ExpenseDetail from "@/components/expense/ExpenseDetail";
import { getExpenseById } from "@/utils/supabase/expenses";

interface ExpenseDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ExpenseDetailPageProps): Promise<Metadata> {
  try {
    const expense = await getExpenseById(params.id);
    return {
      title: `${expense.purpose} | 報帳詳情`,
      description: `報帳詳情：${expense.purpose}`,
    };
  } catch (error) {
    return {
      title: "報帳詳情 | 報帳系統",
      description: "查看報帳詳細資訊",
    };
  }
}

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps) {
  try {
    const expense = await getExpenseById(params.id);

    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ExpenseDetail expense={expense} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
