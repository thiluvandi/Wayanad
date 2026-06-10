"use client";

import { useEffect, useState, useCallback } from "react";
import { Expense } from "@/types/expense";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import SummaryCards from "@/components/SummaryCards";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "summary" | "history">("add");
  const [configError, setConfigError] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.status === 503) {
        setConfigError(true);
        setExpenses([]);
        return;
      }
      const data = await res.json();
      setConfigError(false);
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSave = () => {
    setEditExpense(null);
    setActiveTab("history");
    fetchExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wayanad Trip 🌿</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Expense Tracker · 6 people</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold">
              ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Tab bar — part of header so it's always at the top */}
        <div className="max-w-2xl mx-auto px-4 pb-0">
          <div className="flex">
            {[
              { key: "add", label: editExpense ? "✏️ Edit" : "➕ Add" },
              { key: "summary", label: "📊 Summary" },
              { key: "history", label: `🧾 History${expenses.length > 0 ? ` (${expenses.length})` : ""}` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (key !== "add") setEditExpense(null);
                  setActiveTab(key as "add" | "summary" | "history");
                }}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-white text-white"
                    : "border-transparent text-indigo-300 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Config warning banner */}
      {configError && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <strong>Supabase not connected.</strong> Add your credentials to{" "}
            <code className="bg-amber-100 px-1 rounded">.env.local</code> and restart the server.
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {activeTab === "add" && (
          <ExpenseForm
            onSave={handleSave}
            editExpense={editExpense}
            onCancelEdit={() => { setEditExpense(null); setActiveTab("history"); }}
          />
        )}

        {activeTab === "summary" && (
          <SummaryCards expenses={expenses} />
        )}

        {activeTab === "history" && (
          loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading transactions…</div>
          ) : (
            <ExpenseList
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={fetchExpenses}
            />
          )
        )}
      </main>
    </div>
  );
}
