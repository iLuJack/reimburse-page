"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateExpense } from "@/utils/supabase/expenses";
import { Expense, ExpenseFormData } from "@/types";

// 導入表單欄位組件
import FileUpload from "@/components/files/FileUpload";
// 其他欄位組件也類似導入...

// 新增這些 props
interface ExpenseFormProps {
  expense?: Expense;
  isEditing?: boolean;
}

export default function ExpenseForm({
  expense,
  isEditing = false,
}: ExpenseFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果是編輯模式，使用現有資料初始化表單
  const [formData, setFormData] = useState<ExpenseFormData>({
    expense_type: expense?.expense_type || "",
    transaction_date: expense?.transaction_date || "",
    purpose: expense?.purpose || "",
    amount: expense?.amount || 0,
    participants: expense?.participants || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleFileChange = (file: File | undefined) => {
    setFormData((prev) => ({ ...prev, receipt_file: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("請先登入");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && expense) {
        // 更新現有報帳
        await updateExpense(expense.id, formData);
        router.push(`/expense/${expense.id}`);
      } else {
        // 創建新報帳 - 使用 API endpoint
        const formDataToSend = new FormData();

        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "receipt_file" && value instanceof File) {
              formDataToSend.append("receipt_file", value);
            } else {
              formDataToSend.append(key, String(value));
            }
          }
        });

        const response = await fetch("/api/expenses", {
          method: "POST",
          body: formDataToSend, // Always send as FormData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create expense");
        }

        router.push("/expense");
      }

      router.refresh();
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("提交失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold">
        {isEditing ? "編輯報帳" : "新增報帳"}
      </h1>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              費用類型
            </label>
            <select
              name="expense_type"
              value={formData.expense_type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-base"
            >
              <option value="">請選擇費用類型</option>
              <option value="餐飲">餐飲</option>
              <option value="交通">交通</option>
              <option value="住宿">住宿</option>
              <option value="辦公用品">辦公用品</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              交易日期
            </label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-base"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              參與者
            </label>
            <input
              type="text"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              placeholder="請輸入參與者姓名，多人以逗號分隔"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-base"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              費用目的
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              金額
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ""}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 py-2.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-base"
            />
          </div>

          <div className="md:col-span-2">
            <FileUpload onChange={handleFileChange} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-0 sm:p-0 sm:bg-transparent">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none rounded-md border border-gray-300 bg-white py-2.5 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none rounded-md border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "提交中..." : isEditing ? "更新報帳" : "提交報帳"}
          </button>
        </div>
      </div>
    </form>
  );
}
