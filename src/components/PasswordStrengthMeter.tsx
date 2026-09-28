import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export function checkPasswordStrength(password: string) {
  const criteria = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
    { label: "One special character (!@#$%^&*)", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;
  let label = "Very Weak";
  let color = "bg-rose-500";
  let textColor = "text-rose-400";

  if (score === 5) {
    label = "Very Strong";
    color = "bg-emerald-500";
    textColor = "text-emerald-400";
  } else if (score >= 4) {
    label = "Strong";
    color = "bg-teal-500";
    textColor = "text-teal-400";
  } else if (score >= 3) {
    label = "Moderate";
    color = "bg-amber-500";
    textColor = "text-amber-400";
  } else if (score >= 2) {
    label = "Fair";
    color = "bg-orange-500";
    textColor = "text-orange-400";
  }

  return { criteria, score, label, color, textColor };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const { criteria, score, label, color, textColor } = checkPasswordStrength(password);

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-medium">Password Strength:</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= lvl ? color : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.valid ? "text-emerald-400 font-medium" : "text-slate-500"
            }`}
          >
            {c.valid ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
            )}
            <span className="text-[11px]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
