import { AlertTriangle, Download, Laptop, Moon, Pin, RotateCcw, Search, Sun, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { roadmapTopics, topicById } from "../data/roadmapV3";
import { useStudyState } from "../hooks/useStudyState";
import type { AIExportRange, ThemeMode } from "../types";

const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Laptop }];
const aiRanges: { id: AIExportRange; label: string }[] = [{ id: "this_week", label: "This Week" }, { id: "last_2_weeks", label: "Last 2 Weeks" }, { id: "this_month", label: "This Month" }, { id: "internship", label: "Internship So Far" }];

export function Settings() {
  const { state, setTheme, updateSettings, toggleCurrentTopic, reset, exportBackup, importBackup } = useStudyState();
  const [topicQuery, setTopicQuery] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [importFile, setImportFile] = useState<File>();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => roadmapTopics.filter((topic) => !state.settings.currentFocusTopicIds.includes(topic.id) && (!topicQuery.trim() || topic.title.toLocaleLowerCase().includes(topicQuery.trim().toLocaleLowerCase()))).slice(0, 15), [state.settings.currentFocusTopicIds, topicQuery]);
  const counts = [["Daily Logs", state.dailyLogs.length], ["Topics Started", state.topicProgress.length], ["Topics Done", state.topicProgress.filter((item) => item.status === "done").length], ["Project Milestones", state.projectMilestones.filter((item) => item.completed).length], ["Weekly Reviews", state.weeklyReviewsV3.length]] as const;

  const confirmImport = async () => {
    if (!importFile) return;
    setImporting(true); setMessage("");
    try { await importBackup(importFile); setMessage("备份已成功导入；导入前数据已保留为安全快照。"); setImportFile(undefined); }
    catch (error) { setMessage(error instanceof Error ? error.message : "导入失败，请检查文件。"); }
    finally { setImporting(false); if (fileInput.current) fileInput.current.value = ""; }
  };
  const confirmReset = () => { if (resetText !== "RESET") return; reset(); setResetOpen(false); setResetText(""); setMessage("当前设备上的 Study Hub 数据已重置。"); };

  return (
    <>
      <PageHeader eyebrow="PREFERENCES & DATA" title="Settings" description="只保留使用 Study Hub 真正需要的偏好、当前重点和本地数据管理。" />
      <div className="settings-stack v3-settings">
        <section className="settings-card"><header><div><h2>个人与实习</h2><p>用于 Today 问候、实习周数和 AI Context。</p></div></header><div className="form-grid"><label><span>显示名称</span><input type="text" value={state.settings.displayName} maxLength={24} onChange={(event) => updateSettings({ displayName: event.target.value })} /></label><label><span>当前实习开始日期</span><input type="date" value={state.settings.internshipStartDate} onChange={(event) => updateSettings({ internshipStartDate: event.target.value })} /></label></div></section>
        <section className="settings-card"><header><div><h2>Current Focus</h2><p>一次只保留 1–3 个 Topic，它们会直接出现在 Today 首页。</p></div><span className="storage-version">{state.settings.currentFocusTopicIds.length}/3</span></header><div className="settings-focus-list">{state.settings.currentFocusTopicIds.map((id) => <div key={id}><Pin size={13} /><strong>{topicById.get(id)?.title ?? id}</strong><button type="button" disabled={state.settings.currentFocusTopicIds.length === 1} onClick={() => toggleCurrentTopic(id)} aria-label={`移除 ${topicById.get(id)?.title}`}><X size={13} /></button></div>)}</div><label className="settings-topic-search"><Search size={14} /><input type="search" value={topicQuery} onChange={(event) => setTopicQuery(event.target.value)} placeholder="搜索并添加 Topic" /></label>{state.settings.currentFocusTopicIds.length < 3 ? <div className="settings-topic-suggestions">{suggestions.map((topic) => <button type="button" onClick={() => { toggleCurrentTopic(topic.id); setTopicQuery(""); }} key={topic.id}>+ {topic.title}</button>)}</div> : <p className="settings-help">已经选择 3 个重点。移除一个后可以继续添加。</p>}</section>
        <section className="settings-card"><header><div><h2>外观主题</h2><p>固定浅色、深色或跟随系统。</p></div></header><div className="theme-options">{themes.map((theme) => { const Icon = theme.icon; return <button type="button" className={state.theme === theme.id ? "active" : ""} onClick={() => setTheme(theme.id)} aria-pressed={state.theme === theme.id} key={theme.id}><Icon size={17} />{theme.label}</button>; })}</div></section>
        <section className="settings-card"><header><div><h2>AI Export Defaults</h2><p>Weekly → Export for AI 默认选择的时间范围，不会调用任何模型。</p></div></header><label className="select-label"><span>默认范围</span><select value={state.settings.aiExportDefaultRange} onChange={(event) => updateSettings({ aiExportDefaultRange: event.target.value as AIExportRange })}>{aiRanges.map((range) => <option value={range.id} key={range.id}>{range.label}</option>)}</select></label></section>
        <section className="settings-card data-card"><header><div><h2>备份与数据管理</h2><p>V3 备份同时包含 Daily Logs、Topics、Reviews、Projects 与 V1/V2 兼容数据。</p></div><span className="storage-version">STORAGE V{state.storageVersion}</span></header><div className="data-summary v3-data-summary">{counts.map(([label, count]) => <span key={label}><strong>{count}</strong>{label}</span>)}</div><div className="data-actions"><button className="secondary-button" type="button" onClick={exportBackup}><Download size={15} />Export Backup</button><button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}><Upload size={15} />Import Backup</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => setImportFile(event.target.files?.[0])} /><button className="danger-button" type="button" onClick={() => { setResetText(""); setResetOpen(true); }}><RotateCcw size={15} />Reset All Data</button></div>{message ? <p className="settings-message" role="status">{message}</p> : null}</section>
      </div>
      <p className="autosave-footer">设置与业务数据自动保存在当前设备。</p>
      <Modal open={Boolean(importFile)} onClose={() => { if (!importing) setImportFile(undefined); }} title="导入备份？" eyebrow="IMPORT & MIGRATE" description="支持 V1、V2 和 V3。导入会替换当前状态，但会先保存安全快照。" footer={<><button className="secondary-button" type="button" disabled={importing} onClick={() => setImportFile(undefined)}>取消</button><button className="primary-button" type="button" disabled={importing} onClick={confirmImport}>{importing ? "正在迁移…" : "确认导入"}</button></>}><div className="import-file-card"><Upload size={18} /><div><strong>{importFile?.name}</strong><small>{importFile ? `${Math.ceil(importFile.size / 1024)} KB` : ""}</small></div></div></Modal>
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="确认重置所有数据" eyebrow="DANGER ZONE" description="此操作会删除当前设备上的 V1、V2、V3 Study Hub 数据。" footer={<><button className="secondary-button" type="button" onClick={() => setResetOpen(false)}>取消</button><button className="danger-button" type="button" disabled={resetText !== "RESET"} onClick={confirmReset}><RotateCcw size={14} />永久重置</button></>}><div className="reset-dialog"><div className="reset-warning"><AlertTriangle size={18} /><div><strong>将删除所有本地记录</strong><p>Daily Logs、Topic 状态、Weekly Reviews、Project Milestones、设置和保留的旧版本数据都会删除。</p></div></div><label className="full-field"><span>输入 <strong>RESET</strong> 以继续</span><input type="text" value={resetText} onChange={(event) => setResetText(event.target.value)} placeholder="RESET" autoComplete="off" /></label></div></Modal>
    </>
  );
}
