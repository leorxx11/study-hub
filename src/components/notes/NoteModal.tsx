import { useEffect, useState, type FormEvent } from "react";
import { noteTemplates, noteTypeLabels } from "../../data/noteTemplates";
import { useStudyState, type NoteDraft } from "../../hooks/useStudyState";
import type { Note, NoteType } from "../../types";
import { RelationFields } from "../forms/RelationFields";
import { Modal } from "../ui/Modal";

interface NoteModalProps {
  open: boolean;
  note?: Note;
  defaults?: Partial<NoteDraft>;
  onClose: () => void;
}

export function NoteModal({ open, note, defaults, onClose }: NoteModalProps) {
  const { state, createNote, updateNote } = useStudyState();
  const [type, setType] = useState<NoteType>("learning");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [stageId, setStageId] = useState<string | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    const nextType = note?.type ?? defaults?.type ?? "learning";
    setType(nextType);
    setTitle(note?.title ?? defaults?.title ?? "");
    setContent(note?.content ?? defaults?.content ?? noteTemplates[nextType]);
    setSkillIds([...(note?.skillIds ?? defaults?.skillIds ?? [])]);
    setStageId(note?.stageId ?? defaults?.stageId ?? state.currentStageId);
    setProjectId(note?.projectId ?? defaults?.projectId);
  }, [defaults, note, open, state.currentStageId]);

  const changeType = (nextType: NoteType) => {
    setType(nextType);
    if (!note) setContent(noteTemplates[nextType]);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const draft: NoteDraft = { type, title: title.trim(), content: content.trim(), skillIds, stageId, projectId };
    if (note) updateNote(note.id, draft);
    else createNote(draft);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={note ? "编辑记录" : "新建记录"} eyebrow="ENGINEERING LOG" description="支持多行 Markdown 风格内容；不必填满模板，只保留有价值的证据。" wide footer={<><button className="secondary-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="submit" form="note-form">{note ? "保存修改" : "保存记录"}</button></>}>
      <form id="note-form" className="record-form" onSubmit={submit}>
        <div className="note-type-picker" role="group" aria-label="记录类型">{(Object.keys(noteTypeLabels) as NoteType[]).map((item) => <button type="button" className={type === item ? "active" : ""} aria-pressed={type === item} onClick={() => changeType(item)} key={item}>{noteTypeLabels[item]}</button>)}</div>
        <label className="full-field"><span>标题 *</span><input type="text" value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder={`${noteTypeLabels[type]} 标题`} required /></label>
        <label className="full-field"><span>内容</span><textarea className="note-editor" rows={18} value={content} onChange={(event) => setContent(event.target.value)} /></label>
        <RelationFields skillIds={skillIds} stageId={stageId} projectId={projectId} onSkillIdsChange={setSkillIds} onStageIdChange={setStageId} onProjectIdChange={setProjectId} />
      </form>
    </Modal>
  );
}
