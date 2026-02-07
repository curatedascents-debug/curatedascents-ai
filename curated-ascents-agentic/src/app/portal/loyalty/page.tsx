"use client";

import { useState, useEffect } from "react";
import { Loader2, Award, ArrowUpRight, ArrowDownRight, Copy, Check } from "lucide-react";

interface LoyaltyData {
  account: {
    tier: string;
    points: number;
    lifetimePoints: number;
    nextTier: string | null;
    pointsToNextTier: number | null;
  } | null;
  transactions: { id: number; type: string; points: number; description: string; createdAt: string }[];
  referralCode: string | null;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: "text-orange-400",
  Silver: "text-slate-300",
  Gold: "text-amber-400",
  Platinum: "text-purple-400",
};

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/portal/loyalty")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyReferral = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!data?.account) {
    return (
      <div className="p-4 text-center py-16">
        <Award className="w-10 h-10 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-2">No loyalty account yet</p>
        <p className="text-slate-500 text-sm">Book your first trip to start earning points</p>
      </div>
    );
  }

  const { account, transactions, referralCode } = data;
  const progressPercent = account.pointsToNextTier
    ? Math.min(100, ((account.lifetimePoints) / (account.lifetimePoints + account.pointsToNextTier)) * 100)
    : 100;

  return (
    <div className="p-4 space-y-4">
      {/* Tier Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className={`w-8 h-8 ${TIER_COLORS[account.tier] || "text-emerald-400"}`} />
          <div>
            <h2 className={`text-xl font-bold ${TIER_COLORS[account.tier] || "text-white"}`}>
              {account.tier}
            </h2>
            <p className="text-slate-400 text-xs">Loyalty Member</p>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-white">{account.points.toLocaleString()}</p>
          <p className="text-slate-400 text-sm">Available Points</p>
        </div>

        {account.nextTier && account.pointsToNextTier != null && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{account.tier}</span>
              <span>{account.nextTier}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-1 text-center">
              {account.pointsToNextTier.toLocaleString()} points to {account.nextTier}
            </p>
          </div>
        )}
      </div>

      {/* Referral Code */}
      {referralCode && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-900 text-emerald-400 font-mono text-lg px-4 py-2 rounded-lg text-center">
              {referralCode}
            </code>
            <button
              onClick={handleCopyReferral}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Transactions */}
      {transactions.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
          </div>
          {transactions.map((tx) => (
            <div key={tx.id} className="px-5 py-3 flex items-center justify-between border-b border-slate-700/50 last:border-0">
              <div className="flex items-center gap-3">
                {tx.points > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <p className="text-slate-300 text-sm">{tx.description}</p>
                  <p className="text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${tx.points > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {tx.points > 0 ? "+" : ""}{tx.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
