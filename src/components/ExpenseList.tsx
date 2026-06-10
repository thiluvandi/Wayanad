"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: () => void;
}

const MEMBER_COLORS: Record<string, string> = {
  Nayan: "bg-blue-100 text-blue-700",
  Navin: "bg-purple-100 text-purple-700",
  Aditya: "bg-indigo-100 text-indigo-700",
  Gaurav: "bg-amber-100 text-amber-700",
  Gangadhar: "bg-rose-100 text-rose-700",
  Sachin: "bg-teal-100 text-teal-700",
};

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onDelete();
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-gray-500 text-sm">No expenses yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Transaction History</h2>
      </div>
      <ul className="divide-y divide-gray-50">
        {expenses.map((expense) => {
          const date = new Date(expense.created_at);
          const isDeleting = deletingId === expense.id;
          const isConfirming = confirmId === expense.id;

          return (
            <li key={expense.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        MEMBER_COLORS[expense.paid_by] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {expense.paid_by}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {expense.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {expense.location && (
                      <>
                        <span>📍 {expense.location}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>
                      {date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-base font-semibold text-gray-800">
                    ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  {!isConfirming ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setConfirmId(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={isDeleting}
                        className="text-xs px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60"
                      >
                        {isDeleting ? "..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
