import { Metadata } from "next";
import { getExpenseById } from "@/utils/supabase/expenses";
import ExpenseDetail from "@/components/expense/ExpenseDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const expense = await getExpenseById(resolvedParams.id);
    return {
      title: `${expense.purpose} | 報帳詳情`,
      description: `報帳詳情：${expense.purpose}`,
    };
  } catch {
    // Fallback metadata if expense not found
    return {
      title: "報帳詳情",
      description: "報帳詳情頁面",
    };
  }
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const expense = await getExpenseById(resolvedParams.id);

    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ExpenseDetail expense={expense} />
      </div>
    );
  } catch {
    // Fallback UI if expense not found
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <p className="text-red-500">無法載入報帳詳情</p>
        </div>
      </div>
    );
  }
}
