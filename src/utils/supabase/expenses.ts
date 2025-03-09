import { supabase } from "@/utils/supabase/client";
import { Expense, ExpenseFormData } from "@/types";

export async function createExpense(data: ExpenseFormData, userId: string) {
  try {
    let receiptUrl = "";

    if (data.receipt_file) {
      console.log(
        "Starting file upload:",
        data.receipt_file.name,
        data.receipt_file.size,
      );

      // Generate filename
      const fileExt = data.receipt_file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      console.log("Upload path:", fileName);

      // More detailed error handling
      const uploadResult = await supabase.storage
        .from("receipts")
        .upload(fileName, data.receipt_file, {
          upsert: false,
        });

      if (uploadResult.error) {
        console.error("Upload error:", uploadResult.error);
        throw uploadResult.error;
      }

      console.log("Upload successful:", uploadResult.data);

      // Get URL
      const urlResult = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      receiptUrl = urlResult.data.publicUrl;
      console.log("Generated URL:", receiptUrl);
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
  } catch (error) {
    console.error("Full error details:", error);
    throw error;
  }
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

  // If there's a new file upload
  if (data.receipt_file) {
    // If there's an existing receipt, delete it first
    if (receiptUrl) {
      const filePathMatch = receiptUrl.match(/receipts\/([^?]+)/);
      if (filePathMatch && filePathMatch[1]) {
        const { error: removeError } = await supabase.storage
          .from("receipts")
          .remove([filePathMatch[1]]);

        if (removeError) console.error("Error removing old file:", removeError);
      }
    }

    // Generate a unique file name
    const fileExt = data.receipt_file.name.split(".").pop();
    const fileName = `${id}/${Date.now()}.${fileExt}`;

    // Standard Supabase upload method
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, data.receipt_file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL after successful upload
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

// Add a helper function to download receipts if needed
export async function downloadReceipt(filePath: string) {
  // Extract the path from the full URL if needed
  const pathMatch = filePath.match(/receipts\/([^?]+)/);
  const path = pathMatch ? pathMatch[1] : filePath;

  const { data, error } = await supabase.storage
    .from("receipts")
    .download(path);

  if (error) throw error;
  return data; // This is a Blob object
}
