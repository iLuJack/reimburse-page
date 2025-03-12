import { currentUser } from "@clerk/nextjs/server";
import { createExpense } from "@/utils/supabase/expenses";
import { NextResponse } from "next/server";
import { ExpenseFormData } from "@/types";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!user || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("receipt_file") as File | null;

    // Convert FormData to ExpenseFormData with proper type casting
    const data: ExpenseFormData = {
      expense_type: String(formData.get("expense_type") || ""),
      transaction_date: String(formData.get("transaction_date") || ""),
      purpose: String(formData.get("purpose") || ""),
      amount: parseFloat(formData.get("amount") as string) || 0,
      participants: String(formData.get("participants") || ""),
      receipt_file: file || undefined,
      receipt_url: "", // Add this if it's required in your ExpenseFormData type
    };

    // Validate required fields
    if (
      !data.expense_type ||
      !data.transaction_date ||
      !data.purpose ||
      !data.amount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const expense = await createExpense(data, user.id, email);

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create expense",
      },
      { status: 500 },
    );
  }
}
