import { AlertTriangle, Download, Laptop, Moon, RotateCcw, Sun, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { stages } from "../data/stages";
import { useStudyState } from "../hooks/useStudyState";
import type { ThemeMode } from "../types";

const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

export function Settings() {
  const { state, setTheme, setCurrentStage, updateSettings, reset, exportBackup, importBackup } = useStudyState();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [importFile, setImportFile] = useState<File>();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const counts = [
    ["Tasks", state.tasks.length], ["Notes", state.notes.length], ["Practice Sessions", state.practiceRecords.length], ["Activities", state.activities.length], ["Evidence", state.evidence.length], ["Project Milestones", state.projectMilestones.filter((item) => item.completed).length], ["Weekly Reviews", state.weeklyReviews.length],
  ] as const;

  const confirmImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setMessage("");
    try {
      await importBackup(importFile);
      setMessage("备份已成功导入，原数据已保存为安全快照。");
      setImportFile(undefined);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败，请检查备份文件。");
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const confirmReset = () => {
    if (resetText !== "RESET") return;
    reset();
    setResetText("");
    setResetOpen(false);
    setMessage("所有本地学习数据已重置。");
  };

  return (
    <>
      <PageHeader eyebrow="PREFERENCES" title="设置" description="个性化当前阶段、每周重点与显示主题。V2 业务记录继续只保存在当前设备。" />
      <div className="settings-stack">
        <section className="settings-card"><header><div><h2>个人信息</h2><p>用于首页问候和每周学习提醒。</p></div></header><div className="form-grid"><label><span>显示名称</span><input type="text" value={state.settings.displayName} maxLength={24} onChange={(event) => updateSettings({ displayName: event.target.value })} /></label><label><span>本周重点</span><input type="text" value={state.settings.weeklyFocus} maxLength={80} onChange={(event) => updateSettings({ weeklyFocus: event.target.value })} /></label></div></section>
        <section className="settings-card"><header><div><h2>当前阶段</h2><p>切换后 Overview、Progress 和路线图会同步更新。</p></div></header><label className="select-label"><span>正在进行</span><select value={state.currentStageId} onChange={(event) => setCurrentStage(event.target.value)}>{stages.map((stage) => <option value={stage.id} key={stage.id}>Stage {stage.order} · {stage.title}</option>)}</select></label></section>
        <section className="settings-card"><header><div><h2>外观主题</h2><p>可固定浅色或深色，也可以跟随系统。</p></div></header><div className="theme-options">{themes.map((theme) => { const Icon = theme.icon; return <button type="button" className={state.theme === theme.id ? "active" : ""} onClick={() => setTheme(theme.id)} aria-pressed={state.theme === theme.id} key={theme.id}><Icon size={17} />{theme.label}</button>; })}</div></section>
        <section className="settings-card data-card">
          <header><div><h2>本地数据与备份</h2><p>导出完整 JSON 备份；导入前会确认，并在设备上保留导入前安全快照。</p></div><span className="storage-version">STORAGE V{state.storageVersion}</span></header>
          <div className="data-summary">{counts.map(([label, count]) => <span key={label}><strong>{count}</strong>{label}</span>)}</div>
          <div className="data-actions"><button className="secondary-button" type="button" onClick={exportBackup}><Download size={15} />Export Backup</button><button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}><Upload size={15} />Import Backup</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => setImportFile(event.target.files?.[0])} /><button className="danger-button" type="button" onClick={() => { setResetText(""); setResetOpen(true); }}><RotateCcw size={15} />Reset All Progress</button></div>
          {message ? <p className="settings-message" role="status">{message}</p> : null}
        </section>
      </div>
      <p className="autosave-footer">所有修改都会立即写入 V2 Repository，无需额外提交。</p>

      <Modal open={Boolean(importFile)} onClose={() => { if (!importing) setImportFile(undefined); }} title="导入备份？" eyebrow="IMPORT BACKUP" description="导入会用备份内容替换当前 V2 数据；系统会先保存当前状态的安全快照。" footer={<><button className="secondary-button" type="button" disabled={importing} onClick={() => setImportFile(undefined)}>取消</button><button className="primary-button" type="button" disabled={importing} onClick={confirmImport}>{importing ? "正在导入…" : "确认导入"}</button></>}><div className="import-file-card"><Upload size={18} /><div><strong>{importFile?.name}</strong><small>{importFile ? `${Math.ceil(importFile.size / 1024)} KB` : ""}</small></div></div></Modal>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="确认重置所有数据" eyebrow="DANGER ZONE" description="此操作会删除当前设备上的 V2 学习成长数据，无法通过界面撤销。" footer={<><button className="secondary-button" type="button" onClick={() => setResetOpen(false)}>取消</button><button className="danger-button" type="button" disabled={resetText !== "RESET"} onClick={confirmReset}><RotateCcw size={14} />永久重置</button></>}>
        <div className="reset-dialog"><div className="reset-warning"><AlertTriangle size={18} /><div><strong>将删除以下数据</strong><p>Tasks、Notes、Practice Sessions、Activities、Evidence、Project Milestone 状态、Weekly Reviews、能力等级与设置。</p></div></div><label className="full-field"><span>输入 <strong>RESET</strong> 以继续</span><input autoFocus type="text" value={resetText} onChange={(event) => setResetText(event.target.value)} placeholder="RESET" autoComplete="off" /></label></div>
      </Modal>
    </>
  );
}
