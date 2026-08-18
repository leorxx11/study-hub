import { Edit3, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { NoteModal } from "../components/notes/NoteModal";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { noteTypeLabels } from "../data/noteTemplates";
import { projects } from "../data/projects";
import { skills } from "../data/skills";
import { useStudyState } from "../hooks/useStudyState";
import type { Note, NoteType } from "../types";
import { formatDate } from "../utils/date";

type NoteFilter = "all" | NoteType;
const filters: NoteFilter[] = ["all", "learning", "bug", "automation", "deployment", "project", "review"];

function plainSummary(content: string) {
  return content.replace(/^#{1,6}\s*/gm, "").replace(/[*_`>-]/g, "").replace(/\s+/g, " ").trim();
}

export function Notes() {
  const { state, deleteNote } = useStudyState();
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  const visibleNotes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return [...state.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).filter((note) => {
      if (filter !== "all" && note.type !== filter) return false;
      if (!normalized) return true;
      const skillNames = (note.skillIds ?? []).map((id) => skills.find((skill) => skill.id === id)?.name ?? "").join(" ");
      return `${note.title} ${note.content} ${skillNames}`.toLocaleLowerCase().includes(normalized);
    });
  }, [filter, query, state.notes]);

  const edit = (note: Note) => { setSelectedNote(undefined); setEditingNote(note); setEditorOpen(true); };
  const remove = (note: Note) => {
    if (!window.confirm(`删除记录「${note.title}」？关联的自动 Evidence 与 Activity 也会移除。`)) return;
    deleteNote(note.id);
    setSelectedNote(undefined);
  };

  return (
    <>
      <PageHeader eyebrow="KNOWLEDGE BASE" title="Engineering Log" description="把学习、问题定位、自动化与交付经验沉淀为可检索、可关联的工程记录。" action={<button className="primary-button" type="button" onClick={() => { setEditingNote(undefined); setEditorOpen(true); }}><Plus size={15} />New Record</button>} />
      <section className="notes-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="记录类型筛选">{filters.map((item) => <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "all" ? "All" : noteTypeLabels[item]}</button>)}</div>
        <label className="search-field"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、内容或 Skill" aria-label="搜索记录" /></label>
      </section>

      {visibleNotes.length ? (
        <div className="note-list">
          {visibleNotes.map((note) => {
            const project = projects.find((item) => item.id === note.projectId);
            const noteSkills = (note.skillIds ?? []).map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);
            return (
              <article className="note-card" key={note.id}>
                <button className="note-card-main" type="button" onClick={() => setSelectedNote(note)}>
                  <span className={`note-type ${note.type}`}>{noteTypeLabels[note.type]}</span>
                  <h2>{note.title}</h2>
                  <time dateTime={note.updatedAt}>{formatDate(note.updatedAt, { year: "numeric", month: "2-digit", day: "2-digit" })}</time>
                  <p>{plainSummary(note.content) || "暂无正文"}</p>
                  <div className="tag-list">{noteSkills.map((skill) => <span key={skill!.id}>{skill!.name}</span>)}{project ? <span>{project.name}</span> : null}</div>
                </button>
                <div className="note-card-actions"><button type="button" onClick={() => edit(note)} aria-label={`编辑 ${note.title}`}><Edit3 size={14} /></button><button type="button" onClick={() => remove(note)} aria-label={`删除 ${note.title}`}><Trash2 size={14} /></button></div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state compact-notes-empty"><div className="empty-icon"><FileText size={23} /></div><span className="detail-kicker">NO RECORDS</span><h2>{query || filter !== "all" ? "没有匹配的记录" : "从第一条真实经验开始"}</h2><p>{query || filter !== "all" ? "试试更换筛选或搜索词。" : "记录一个请求、一条定位链路或一次工程推进，让能力有证据可循。"}</p><button className="primary-button" type="button" onClick={() => { setEditingNote(undefined); setEditorOpen(true); }}><Plus size={15} />New Record</button></section>
      )}

      <NoteModal open={editorOpen} note={editingNote} onClose={() => { setEditorOpen(false); setEditingNote(undefined); }} />
      <Modal open={Boolean(selectedNote)} onClose={() => setSelectedNote(undefined)} title={selectedNote?.title ?? "记录详情"} eyebrow={selectedNote ? `${noteTypeLabels[selectedNote.type].toUpperCase()} · ${formatDate(selectedNote.updatedAt, { year: "numeric", month: "2-digit", day: "2-digit" })}` : undefined} wide footer={selectedNote ? <><button className="danger-button" type="button" onClick={() => remove(selectedNote)}><Trash2 size={14} />删除</button><button className="primary-button" type="button" onClick={() => edit(selectedNote)}><Edit3 size={14} />编辑</button></> : null}>
        {selectedNote ? <div className="note-detail"><div className="tag-list">{(selectedNote.skillIds ?? []).map((id) => skills.find((skill) => skill.id === id)).filter(Boolean).map((skill) => <span key={skill!.id}>{skill!.name}</span>)}{projects.find((project) => project.id === selectedNote.projectId) ? <span>{projects.find((project) => project.id === selectedNote.projectId)!.name}</span> : null}</div><pre>{selectedNote.content}</pre></div> : null}
      </Modal>
    </>
  );
}
