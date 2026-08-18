import { Check, Circle } from "lucide-react";
import { useStudyState } from "../../hooks/useStudyState";
import type { PracticeGroup } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";

export function ChecklistGroupCard({ group }: { group: PracticeGroup }) {
  const { state, toggleChecklist } = useStudyState();
  const completed = group.items.filter((item) => state.checklist[item.id]).length;
  return (
    <section className="checklist-card">
      <header>
        <div><span className="detail-kicker">WORK PRACTICE</span><h2>{group.title}</h2></div>
        <strong>{completed}<small>/{group.items.length}</small></strong>
      </header>
      <p>{group.description}</p>
      <ProgressBar value={completed} max={group.items.length} label={`${group.title} 完成进度`} tone={completed === group.items.length ? "green" : "blue"} />
      <div className="checklist-items">
        {group.items.map((item) => {
          const checked = Boolean(state.checklist[item.id]);
          return (
            <button type="button" role="checkbox" aria-checked={checked} className={`checklist-item${checked ? " checked" : ""}`} onClick={() => toggleChecklist(item.id)} key={item.id}>
              <span className="check-control">{checked ? <Check size={13} /> : <Circle size={13} />}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
