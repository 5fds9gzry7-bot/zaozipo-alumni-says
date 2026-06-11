import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass = "mt-2 w-full rounded-[16px] border border-[#e8ddd2] bg-[#f8f3eb] px-4 py-3.5 text-sm text-[#4f3d35] outline-none transition placeholder:text-[#ac9d93] focus:border-[#a96d61]";

export function TextField({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block"><span className="text-xs font-semibold text-[#655249]">{label}</span><input className={inputClass} {...props} /></label>;
}

export function TextAreaField({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="block"><span className="text-xs font-semibold text-[#655249]">{label}</span><textarea className={`${inputClass} min-h-28 resize-y leading-6`} {...props} /></label>;
}

export function CheckField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return <label className="flex items-center gap-3 rounded-[16px] bg-[#f4eee5] px-4 py-3 text-xs font-semibold text-[#655249]"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#7b2d26]" />{label}</label>;
}

export function ResultMessage({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null;
  return <p className={`rounded-[16px] px-4 py-3 text-xs leading-5 ${result.ok ? "bg-[#e7eeea] text-[#31594e]" : "bg-[#f3e5df] text-[#7b2d26]"}`}>{result.message}</p>;
}
