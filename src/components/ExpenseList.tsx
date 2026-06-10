"use client";

import { useState, useRef, useEffect } from "react";
import { Expense } from "@/types/expense";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: () => void;
}

const MEMBER_COLORS: Record<string, string> = {
  Nayan:     "bg-blue-100 text-blue-700",
  Navin:     "bg-purple-100 text-purple-700",
  Aditya:    "bg-indigo-100 text-indigo-700",
  Gaurav:    "bg-amber-100 text-amber-700",
  Gangadhar: "bg-rose-100 text-rose-700",
  Sachin:    "bg-teal-100 text-teal-700",
};

const DELETE_PASSWORD = "deleteit";

function PasswordModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === DELETE_PASSWORD) {
      onConfirm();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <p className="text-3xl mb-2">🔒</p>
          <h3 className="text-lg font-bold text-gray-900">Enter Password to Delete</h3>
          <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="password"
            placeholder="Password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-400 ring-2 ring-red-200 bg-red-50 placeholder-red-300 animate-shake"
                : "border-gray-300 focus:ring-indigo-400"
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 font-medium text-center">Incorrect password. Try again.</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setPendingDeleteId(null);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onDelete();
    } finally {
      setDeletingId(null);
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
    <>
      {pendingDeleteId && (
        <PasswordModal
          onConfirm={() => handleDelete(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Transaction History</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {expenses.map((expense) => {
            const date = new Date(expense.created_at);
            const isDeleting = deletingId === expense.id;

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
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(expense.id)}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {isDeleting ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
