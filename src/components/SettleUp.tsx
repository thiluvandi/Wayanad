"use client";

import { Expense, MEMBERS } from "@/types/expense";

interface Props {
  expenses: Expense[];
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

function calcSettlements(expenses: Expense[]): Settlement[] {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perHead = total / MEMBERS.length;

  // net[person] = what they paid - their fair share (positive = owed money, negative = owes money)
  const net: Record<string, number> = {};
  for (const m of MEMBERS) net[m] = 0;
  for (const e of expenses) net[e.paid_by] += e.amount;
  for (const m of MEMBERS) net[m] = parseFloat((net[m] - perHead).toFixed(2));

  // Greedy: repeatedly match the biggest debtor with the biggest creditor
  const creditors = MEMBERS.filter((m) => net[m] > 0.005).map((m) => ({ name: m, amount: net[m] }));
  const debtors = MEMBERS.filter((m) => net[m] < -0.005).map((m) => ({ name: m, amount: -net[m] }));

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    if (pay > 0.005) {
      settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: parseFloat(pay.toFixed(2)) });
    }
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }

  return settlements;
}

const MEMBER_COLORS: Record<string, string> = {
  Nayan:     "bg-blue-100 text-blue-700 border-blue-200",
  Navin:     "bg-purple-100 text-purple-700 border-purple-200",
  Aditya:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  Gaurav:    "bg-amber-100 text-amber-700 border-amber-200",
  Gangadhar: "bg-rose-100 text-rose-700 border-rose-200",
  Sachin:    "bg-teal-100 text-teal-700 border-teal-200",
};

export default function SettleUp({ expenses }: Props) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perHead = total / MEMBERS.length;
  const settlements = calcSettlements(expenses);

  const balances = MEMBERS.map((m) => {
    const paid = expenses.filter((e) => e.paid_by === m).reduce((s, e) => s + e.amount, 0);
    return { name: m, paid, balance: parseFloat((paid - perHead).toFixed(2)) };
  });

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="text-4xl mb-3">🤝</p>
        <p className="text-gray-500 text-sm">No expenses yet. Add some to see settlements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Balance overview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Balance Overview</h3>
        <div className="space-y-2">
          {balances.map(({ name, paid, balance }) => (
            <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${MEMBER_COLORS[name]}`}>
                  {name}
                </span>
                <span className="text-xs text-gray-400">
                  paid ₹{paid.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span
                className={`text-sm font-bold ${
                  balance > 0.005 ? "text-emerald-600" : balance < -0.005 ? "text-red-500" : "text-gray-400"
                }`}
              >
                {balance > 0.005
                  ? `gets back ₹${balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                  : balance < -0.005
                  ? `owes ₹${Math.abs(balance).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                  : "settled ✓"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Who Pays Whom</h3>
        <p className="text-xs text-gray-400 mb-4">Minimum transactions to settle all debts</p>

        {settlements.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm text-gray-500">Everyone is settled up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map(({ from, to, amount }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              >
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${MEMBER_COLORS[from]}`}>
                  {from}
                </span>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                  <span className="text-sm font-bold text-gray-800 shrink-0">
                    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                  <span className="text-gray-400 text-base">→</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${MEMBER_COLORS[to]}`}>
                  {to}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-center text-gray-400">
        Fair share per person · ₹{perHead.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
