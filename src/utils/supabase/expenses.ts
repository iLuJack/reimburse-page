import { supabase } from "@/utils/supabase/client";
import { Expense, ExpenseFormData } from "@/types";

export async function createExpense(data: ExpenseFormData, userId: string) {
  let receiptUrl = "";

  // 如果有上傳文件，先存儲到 Storage
  if (data.receipt_file) {
    const fileExt = data.receipt_file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, data.receipt_file);

    if (uploadError) throw uploadError;

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    receiptUrl = urlData.publicUrl;
  }

  // 創建報帳記錄
  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      expense_type: data.expense_type,
      transaction_date: data.transaction_date,
      purpose: data.purpose,
      amount: data.amount,
      participants: data.participants,
      receipt_url: receiptUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return expense;
}

export async function getUserExpenses(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function getExpenseById(id: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, data: ExpenseFormData) {
  let receiptUrl = data.receipt_url;

  // 如果有新上傳文件，先存儲到 Storage
  if (data.receipt_file) {
    // 如果有舊檔案，先刪除
    if (receiptUrl) {
      const filePathMatch = receiptUrl.match(/receipts\/([^?]+)/);
      if (filePathMatch && filePathMatch[1]) {
        await supabase.storage.from("receipts").remove([filePathMatch[1]]);
      }
    }

    // 上傳新檔案
    const fileExt = data.receipt_file.name.split(".").pop();
    const fileName = `${id}-${Math.random()}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, data.receipt_file);

    if (uploadError) throw uploadError;

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    receiptUrl = urlData.publicUrl;
  }

  // 更新報帳記錄
  const { data: expense, error } = await supabase
    .from("expenses")
    .update({
      expense_type: data.expense_type,
      transaction_date: data.transaction_date,
      purpose: data.purpose,
      amount: data.amount,
      participants: data.participants,
      receipt_url: receiptUrl,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return expense;
}
