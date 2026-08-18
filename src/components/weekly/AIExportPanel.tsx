import { Check, Clipboard, Download, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useStudyState } from "../../hooks/useStudyState";
import { buildAIExport } from "../../services/aiExport";
import type { AIExportRange } from "../../types";
import { Modal } from "../ui/Modal";

const ranges: { id: AIExportRange; label: string }[] = [{ id: "this_week", label: "This Week" }, { id: "last_2_weeks", label: "Last 2 Weeks" }, { id: "this_month", label: "This Month" }, { id: "internship", label: "Internship So Far" }];

export function AIExportPanel() {
  const { state, updateSettings } = useStudyState();
  const [range, setRange] = useState<AIExportRange>(state.settings.aiExportDefaultRange);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => buildAIExport(state, range), [range, state]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.markdown);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.markdown;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  const download = () => { const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `study-hub-context-${result.startKey}-${result.endKey}.md`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); };
  return (
    <section className="ai-export-panel"><div className="v3-section-heading"><div><span>EXPORT FOR AI</span><h2>把最近状态交给任何模型分析</h2></div><small>只生成 Markdown，不调用 AI API</small></div><p>包含 Daily Logs、当前路线、Topic、项目进展和 Weekly Review，并附带固定分析问题。</p><div className="export-range-tabs">{ranges.map((item) => <button type="button" className={range === item.id ? "active" : ""} onClick={() => { setRange(item.id); updateSettings({ aiExportDefaultRange: item.id }); }} key={item.id}>{item.label}</button>)}</div><div className="export-summary"><span>时间范围</span><strong>{result.startKey} → {result.endKey}</strong><small>{result.markdown.length.toLocaleString()} characters</small></div><div className="export-actions"><button className="secondary-button" type="button" onClick={() => setPreviewOpen(true)}><Eye size={14} />Markdown Preview</button><button className="primary-button" type="button" onClick={copy}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "已复制" : "Copy Markdown"}</button><button className="secondary-button" type="button" onClick={download}><Download size={14} />Download .md</button></div><Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Study Hub Context Export" eyebrow={result.label.toUpperCase()} wide footer={<><button className="secondary-button" type="button" onClick={download}><Download size={14} />Download .md</button><button className="primary-button" type="button" onClick={copy}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "已复制" : "Copy Markdown"}</button></>}><pre className="markdown-preview">{result.markdown}</pre></Modal></section>
  );
}
