"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { getUserExpenses } from "@/utils/supabase/expenses";
import { Expense } from "@/types";
import { CalendarDays, FileText, Plus } from "lucide-react";

export default function ExpenseList() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExpenses() {
      if (!user?.id) return;

      try {
        const data = await getUserExpenses(user.id);
        setExpenses(data);
      } catch (error) {
        console.error("載入報帳錯誤:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [user?.id]);

  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">尚無報帳記錄</h2>
        <p className="mt-2 text-gray-500">點擊下方按鈕新增你的第一筆報帳</p>
        <Link
          href="/expense/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          新增報帳
        </Link>
      </div>
    );
  }

  // 格式化金額
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的報帳紀錄</h1>
        <Link
          href="/expense/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          新增報帳
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <Link
                href={`/expense/${expense.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {expense.purpose}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {expense.expense_type}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(expense.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {expense.participants}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        {new Date(expense.transaction_date).toLocaleDateString(
                          "zh-TW",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
