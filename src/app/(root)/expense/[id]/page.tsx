import { Metadata } from "next";
import { getExpenseById } from "@/utils/supabase/expenses";
import ExpenseDetail from "@/components/expense/ExpenseDetail";

interface ExpenseDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ExpenseDetailPageProps): Promise<Metadata> {
  try {
    const id = await Promise.resolve(params.id);
    const expense = await getExpenseById(id);

    return {
      title: `${expense.purpose} | 報帳詳情`,
      description: `報帳詳情：${expense.purpose}`,
    };
  } catch (_error) {
    return {
      title: "報帳詳情",
      description: "報帳詳情頁面",
    };
  }
}

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps) {
  try {
    const id = await Promise.resolve(params.id);
    const expense = await getExpenseById(id);

    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ExpenseDetail expense={expense} />
      </div>
    );
  } catch (_error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <p className="text-red-500">無法載入報帳詳情</p>
        </div>
      </div>
    );
  }
}
