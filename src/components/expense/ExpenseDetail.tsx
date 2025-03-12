"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Expense } from "@/types";
import {
  CalendarDays,
  User,
  FileText,
  DollarSign,
  Tag,
  Receipt,
  ArrowLeft,
  Pencil,
  Trash,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface ExpenseDetailProps {
  expense: Expense;
}

export default function ExpenseDetail({ expense }: ExpenseDetailProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(true);

  useEffect(() => {
    const fetchReceiptUrl = async () => {
      if (expense.receipt_url) {
        try {
          setIsLoadingReceipt(true);
          // Extract the path from the full URL
          const filePathMatch = expense.receipt_url.match(/receipts\/([^?]+)/);
          if (filePathMatch && filePathMatch[1]) {
            const filePath = filePathMatch[1];

            // Get a signed URL that's valid for 60 minutes
            const { data: signedUrl, error } = await supabase.storage
              .from("receipts")
              .createSignedUrl(filePath, 3600);

            if (error) {
              console.error("Error getting signed URL:", error);
              return;
            }

            setReceiptUrl(signedUrl.signedUrl);
          }
        } catch (error) {
          console.error("Error fetching receipt:", error);
        } finally {
          setIsLoadingReceipt(false);
        }
      } else {
        setIsLoadingReceipt(false);
      }
    };

    fetchReceiptUrl();
  }, [expense.receipt_url]);

  // 格式化金額
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 刪除報帳
  const handleDelete = async () => {
    if (!confirm("確定要刪除此筆報帳嗎？此操作無法復原。")) {
      return;
    }

    setIsDeleting(true);

    try {
      // 如果有發票文件，先刪除
      if (expense.receipt_url) {
        const filePathMatch = expense.receipt_url.match(/receipts\/([^?]+)/);
        if (filePathMatch && filePathMatch[1]) {
          const { error: removeError } = await supabase.storage
            .from("receipts")
            .remove([filePathMatch[1]]);

          if (removeError) {
            console.error("Error removing file:", removeError);
          }
        }
      }

      // 刪除報帳記錄
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expense.id);

      if (error) throw error;

      router.push("/expense");
      router.refresh();
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除報帳失敗，請稍後再試");
      setIsDeleting(false);
    }
  };

  // 檢查當前用戶是否為此報帳的創建者
  const isOwner = user?.id === expense.user_id;

  // Update the receipt rendering section
  const renderReceipt = () => {
    if (isLoadingReceipt) {
      return <div className="text-gray-500">載入中...</div>;
    }

    if (!expense.receipt_url) {
      return <span className="text-gray-500 italic">無上傳發票</span>;
    }

    return (
      <div className="border border-gray-200 rounded-md overflow-hidden">
        {/\.(jpg|jpeg|png|gif|webp)$/i.test(expense.receipt_url) ? (
          // Image file preview
          <a
            href={receiptUrl || expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={receiptUrl || expense.receipt_url}
              alt="Receipt"
              className="max-h-64 w-full object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                console.error("Error loading image:", expense.receipt_url);
              }}
            />
            <div className="p-2 text-center text-sm text-indigo-600 hover:underline">
              查看原始大小
            </div>
          </a>
        ) : (
          // Non-image file preview
          <a
            href={receiptUrl || expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 text-indigo-600 hover:underline"
          >
            <FileText className="h-6 w-6 mr-2" />
            查看/下載文件
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            報帳詳情
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            此報帳的所有詳細資訊
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/expense"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>

          {isOwner && (
            <>
              <Link
                href={`/expense/${expense.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 mr-1" />
                編輯
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Trash className="h-4 w-4 mr-1" />
                {isDeleting ? "刪除中..." : "刪除"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Tag className="h-5 w-5 mr-1" />
              費用類型
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {expense.expense_type}
              </span>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-5 w-5 mr-1" />
              費用目的
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {expense.purpose}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="h-5 w-5 mr-1" />
              金額
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
              {formatAmount(expense.amount)}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <CalendarDays className="h-5 w-5 mr-1" />
              交易日期
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(expense.transaction_date)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <User className="h-5 w-5 mr-1" />
              參與者
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {expense.participants.split(",").map((participant, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 px-2 py-1 rounded-md mr-2 mb-2"
                >
                  {participant.trim()}
                </span>
              ))}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Receipt className="h-5 w-5 mr-1" />
              發票/收據
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {renderReceipt()}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">建立時間</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {expense.created_at
                ? new Date(expense.created_at).toLocaleString("zh-TW")
                : "未知"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
