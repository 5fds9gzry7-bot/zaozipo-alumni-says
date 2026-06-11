import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

const rules = [
  "本平台为非官方校友经验分享平台，并非学校官方平台。",
  "内容仅为校友个人经验，不代表学校或任何官方立场。",
  "高考分数、位次、申请经验仅供参考，请以当年官方信息为准。",
  "请勿发布他人隐私、辱骂、造谣、广告及违法违规内容。",
  "如发现不合适内容，请联系运营者处理。",
];
export default function GuidePage() { return <AppShell showNav={false}><PageHeader title="使用指南" subtitle="让经验被认真分享，也让每个人的隐私与选择受到尊重。" backHref="/" /><div className="space-y-3">{rules.map((rule, index) => <section key={rule} className="flex gap-4 rounded-[22px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm"><span className="font-serif text-sm font-bold text-[#c09a58]">0{index + 1}</span><p className="text-sm leading-7 text-[#6f5d53]">{rule}</p></section>)}</div><div className="mt-6 rounded-[22px] bg-[#31594e] p-5 font-serif text-sm leading-7 text-white/85">从枣子坡出发，看见更远的大学与世界。愿每一份分享都真实、克制，也真正帮到后来的人。</div></AppShell>; }
