"use client";

import { Expense, MEMBERS } from "@/types/expense";

interface Props {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perHead = total / MEMBERS.length;

  const spentByMember = MEMBERS.map((member) => ({
    name: member,
    spent: expenses.filter((e) => e.paid_by === member).reduce((sum, e) => sum + e.amount, 0),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white">
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">Total Expenses</p>
          <p className="text-3xl font-bold">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-indigo-200 text-xs mt-1">{expenses.length} transaction{expenses.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-emerald-500 rounded-2xl p-5 text-white">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wide mb-1">Cost per Head</p>
          <p className="text-3xl font-bold">₹{perHead.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-emerald-100 text-xs mt-1">split 6 ways</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Spent by each person</h3>
        <div className="space-y-3">
          {spentByMember.map(({ name, spent }) => {
            const pct = total > 0 ? (spent / total) * 100 : 0;
            const balance = spent - perHead;
            return (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      ₹{spent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        balance > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : balance < 0
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {balance > 0 ? "+" : ""}₹{Math.abs(balance).toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Green badge = paid more than share &nbsp;·&nbsp; Red badge = owes the group
        </p>
      </div>
    </div>
  );
}
