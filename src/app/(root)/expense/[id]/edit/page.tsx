import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import ExpenseForm from "@/components/expense/ExpenseForm";
import { getExpenseById } from "@/utils/supabase/expenses";

interface EditExpensePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditExpensePageProps): Promise<Metadata> {
  try {
    const expense = await getExpenseById(params.id);
    return {
      title: `編輯 - ${expense.purpose} | 報帳系統`,
      description: `編輯報帳: ${expense.purpose}`,
    };
  } catch {
    return {
      title: "編輯報帳 | 報帳系統",
      description: "編輯報帳資料",
    };
  }
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const expense = await getExpenseById(params.id);

    // 確認用戶有權限編輯此報帳
    if (expense.user_id !== user.id) {
      return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-xl font-medium text-red-600">權限錯誤</h2>
            <p className="mt-2 text-gray-500">你沒有權限編輯此報帳紀錄。</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ExpenseForm expense={expense} isEditing />
      </div>
    );
  } catch {
    return notFound();
  }
}
