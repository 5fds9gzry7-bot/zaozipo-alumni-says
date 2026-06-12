"use client";

import Link from "next/link";
import { useState } from "react";
import { readSheet } from "read-excel-file/browser";
import { previewQuestionnaireRows, type ImportCandidate, type ImportResult, type PreviewRow } from "@/lib/import-mapping";

type Preview = {
  filename: string;
  rows: PreviewRow[];
  candidates: ImportCandidate[];
};

export function ImportTool() {
  const [secret, setSecret] = useState("");
  const [operator, setOperator] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function previewFile(file: File) {
    if (!secret.trim()) {
      setMessage("请先输入管理员密钥，再上传文件。");
      return;
    }
    setPending(true);
    setMessage(null);
    setResult(null);
    try {
      const rawRows = file.name.toLowerCase().endsWith(".csv")
        ? recordsFromRows(parseCsv(await file.text()))
        : recordsFromRows(await readSheet(file));
      const rows = previewQuestionnaireRows(rawRows);
      const candidates = rows.flatMap((row) => row.candidate ? [row.candidate] : []);
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", secret, filename: file.name, operator, candidates, totalRows: rows.length, skippedInvalid: rows.filter((row) => !row.candidate).length }),
      });
      const payload = await response.json() as { updateRows?: number[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "重复检测失败。");
      const updates = new Set(payload.updateRows ?? []);
      setPreview({
        filename: file.name,
        candidates,
        rows: rows.map((row) => updates.has(row.rowNumber) ? { ...row, status: "更新" } : row),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法读取文件，请确认它是有效的 .xlsx 或 .csv 文件。");
    } finally {
      setPending(false);
    }
  }

  async function importRows() {
    if (!preview || !secret.trim() || !operator.trim()) {
      setMessage("请输入管理员密钥和操作人名称。");
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          secret,
          filename: preview.filename,
          operator,
          candidates: preview.candidates,
          totalRows: preview.rows.length,
          skippedInvalid: preview.rows.filter((row) => row.status === "缺少关键信息").length,
        }),
      });
      const payload = await response.json() as ImportResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "导入失败。");
      setResult(payload);
      setPreview(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  const totals = preview ? {
    total: preview.rows.length,
    alumni: preview.rows.filter((row) => row.status === "新增" || row.status === "更新").length,
    articles: preview.rows.filter((row) => (row.status === "新增" || row.status === "更新") && row.candidate?.article).length,
    duplicates: preview.rows.filter((row) => row.status === "更新").length,
    invalid: preview.rows.filter((row) => row.status === "缺少关键信息").length,
  } : null;

  return <div className="space-y-6">
    <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">STEP 1 · ADMIN</p>
      <h2 className="mt-1 font-serif text-xl font-bold">输入管理员信息</h2>
      <div className="mt-4 space-y-3"><input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" placeholder="管理员密钥" className={inputClass} /><input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="操作人名称" className={inputClass} /></div>
    </section>

    {!result && <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">STEP 2 · UPLOAD</p>
      <h2 className="mt-1 font-serif text-xl font-bold">上传问卷星文件</h2>
      <p className="mt-2 text-xs leading-6 text-[#806f65]">请上传问卷星导出的 Excel / CSV 文件。系统会自动识别字段并生成枣友名片和经验文章。</p>
      <label onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void previewFile(file); }} className={`mt-5 block cursor-pointer rounded-[20px] border border-dashed p-8 text-center transition ${dragging ? "border-[#7b2d26] bg-[#f3e5df]" : "border-[#cdbca9] bg-[#f8f3eb]"}`}>
        <span className="block font-serif text-lg font-bold text-[#5e483f]">{pending ? "正在解析..." : "拖拽文件到这里"}</span><span className="mt-2 block text-xs text-[#8c7b71]">或点击选择 `.xlsx` / `.csv`</span>
        <input type="file" accept=".xlsx,.csv" disabled={pending} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void previewFile(file); }} />
      </label>
    </section>}

    {preview && totals && <><section className="grid grid-cols-3 gap-3"><Metric label="总行数" value={totals.total} /><Metric label="可写入枣友" value={totals.alumni} /><Metric label="可写入文章" value={totals.articles} /><Metric label="更新枣友" value={totals.duplicates} /><Metric label="缺失信息" value={totals.invalid} /><Metric label="将跳过" value={totals.invalid} /></section>
      <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-4 shadow-sm"><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">STEP 3 · PREVIEW</p><div className="overflow-x-auto"><table className="min-w-[820px] text-left text-xs"><thead className="text-[#806f65]"><tr>{["姓名", "毕业年份", "大学", "专业", "城市", "文章标题", "分类", "状态"].map((item) => <th key={item} className="border-b border-[#e8ddd2] px-3 py-3 font-semibold">{item}</th>)}</tr></thead><tbody>{preview.rows.map((row) => <tr key={row.rowNumber} className="border-b border-[#f0e7dd]"><td className="px-3 py-3 font-semibold">{row.name || "-"}</td><td className="px-3 py-3">{row.graduationYear ?? "-"}</td><td className="px-3 py-3">{row.university || "-"}</td><td className="px-3 py-3">{row.major || "-"}</td><td className="px-3 py-3">{row.city || "-"}</td><td className="px-3 py-3">{row.articleTitle || "仅名片"}</td><td className="px-3 py-3">{row.category || "-"}</td><td className="px-3 py-3"><Status value={row.status} detail={row.detail} /></td></tr>)}</tbody></table></div><button type="button" disabled={pending || totals.alumni === 0} onClick={() => void importRows()} className="mt-5 w-full rounded-[16px] bg-[#7b2d26] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">确认导入并更新网站</button></section>
    </>}

    {result && <section className="rounded-[28px] border border-[#d8c8b8] bg-[#fffdf8] p-6 text-center shadow-sm"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#a08255]">IMPORT COMPLETE</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#31594e]">导入完成</h2><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="新增枣友" value={result.insertedAlumni} /><Metric label="新增文章" value={result.insertedArticles} /><Metric label="跳过重复" value={result.skippedDuplicates} /><Metric label="跳过缺失" value={result.skippedInvalid} /></div><p className="mt-4 text-xs leading-6 text-[#806f65]">{result.filename}<br />{new Date(result.importedAt).toLocaleString("zh-CN")}</p><div className="mt-5 grid grid-cols-2 gap-3"><Link href="/alumni" className="rounded-[14px] bg-[#31594e] px-3 py-3 text-xs font-semibold text-white">查看枣友列表</Link><Link href="/articles" className="rounded-[14px] bg-[#7b2d26] px-3 py-3 text-xs font-semibold text-white">查看经验文章</Link></div><button type="button" onClick={() => setResult(null)} className="mt-3 w-full rounded-[14px] border border-[#d8c8b8] px-3 py-3 text-xs font-semibold text-[#6f5d53]">继续导入</button></section>}
    {message && <p className="rounded-[16px] bg-[#f3e5df] px-4 py-3 text-xs leading-6 text-[#7b2d26]">{message}</p>}
  </div>;
}

const inputClass = "w-full rounded-[16px] border border-[#e8ddd2] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#a96d61]";
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-[18px] border border-[#e7dbcf] bg-[#fffdf8] px-2 py-4 text-center shadow-sm"><p className="font-serif text-2xl font-bold">{value}</p><p className="mt-1 text-[10px] text-[#8c7b71]">{label}</p></div>; }
function Status({ value, detail }: { value: PreviewRow["status"]; detail: PreviewRow["detail"] }) { const color = value === "新增" ? "text-[#31594e]" : value === "更新" ? "text-[#a08255]" : "text-[#7b2d26]"; return <span className={`font-semibold ${color}`}>{value}<span className="mt-1 block whitespace-nowrap text-[9px] font-normal text-[#9b8a80]">{detail}</span></span>; }

function recordsFromRows(rows: unknown[][]) {
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((cell) => String(cell ?? "").trim());
  return dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell); rows.push(row); row = []; cell = ""; continue;
    }
    cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
