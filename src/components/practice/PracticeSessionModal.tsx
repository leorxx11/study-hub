import { Check, Circle, FilePlus2, RotateCcw, Trash2 } from "lucide-react";
import { useStudyState } from "../../hooks/useStudyState";
import type { PracticeRecord } from "../../types";
import { formatDate } from "../../utils/date";
import { Modal } from "../ui/Modal";

export function PracticeSessionModal({ record, open, onClose, onCreateNote }: { record?: PracticeRecord; open: boolean; onClose: () => void; onCreateNote: (record: PracticeRecord) => void }) {
  const { togglePracticeItem, updatePracticeNotes, togglePracticeComplete, deletePractice } = useStudyState();
  if (!record) return <Modal open={open} onClose={onClose} title="实践记录"><div className="compact-empty">正在准备实践记录…</div></Modal>;
  const completed = record.checklist.filter((item) => item.completed).length;
  const isComplete = Boolean(record.completedAt);

  const remove = () => {
    if (!window.confirm(`删除实践「${record.title}」？关联 Activity 与 Evidence 也会移除。`)) return;
    deletePractice(record.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={record.title} eyebrow={`${record.type.toUpperCase()} PRACTICE`} description={`创建于 ${formatDate(record.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })} · ${completed}/${record.checklist.length} checks`} wide footer={<><button className="danger-button" type="button" onClick={remove}><Trash2 size={14} />删除</button>{isComplete ? <button className="secondary-button" type="button" onClick={() => togglePracticeComplete(record.id)}><RotateCcw size={14} />重新打开</button> : <button className="primary-button" type="button" onClick={() => togglePracticeComplete(record.id)}><Check size={14} />完成 Practice</button>}{isComplete && record.type !== "general" ? <button className="primary-button" type="button" onClick={() => onCreateNote(record)}><FilePlus2 size={14} />Create {record.type === "bug" ? "Bug" : record.type === "automation" ? "Automation" : "Deployment"} Note</button> : null}</>}>
      <div className={`practice-session${isComplete ? " completed" : ""}`}>
        {isComplete ? <div className="completion-banner"><Check size={16} /><div><strong>PracticeRecord completed</strong><span>{formatDate(record.completedAt, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></div></div> : null}
        <div className="session-checklist">
          {record.checklist.map((item) => <button type="button" role="checkbox" aria-checked={item.completed} className={item.completed ? "checked" : ""} onClick={() => togglePracticeItem(record.id, item.id)} key={item.id}><span>{item.completed ? <Check size={14} /> : <Circle size={14} />}</span>{item.label}</button>)}
        </div>
        <label className="session-notes"><span>实践笔记</span><textarea rows={7} value={record.notes ?? ""} onChange={(event) => updatePracticeNotes(record.id, event.target.value)} placeholder="记录现象、证据、定位过程或下一步。不写真实公司敏感信息。" /></label>
      </div>
    </Modal>
  );
}
