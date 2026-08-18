import { BookOpenText, CalendarDays, CheckCircle2, FileCheck2, FolderCheck, Link2, MapPinCheck } from "lucide-react";
import type { Activity } from "../../types";
import { formatTime, getActivityDayLabel } from "../../utils/date";

const activityIcons = {
  task_completed: CheckCircle2,
  note_created: BookOpenText,
  practice_completed: FileCheck2,
  milestone_completed: FolderCheck,
  evidence_created: Link2,
  daily_log_created: CalendarDays,
  topic_completed: MapPinCheck,
};

export function ActivityFeed({ activities, emptyText = "完成任务、实践或记录后，动态会出现在这里。" }: { activities: Activity[]; emptyText?: string }) {
  if (!activities.length) return <div className="compact-empty">{emptyText}</div>;
  const groups = activities.reduce<Record<string, Activity[]>>((result, activity) => {
    const label = getActivityDayLabel(activity.createdAt);
    (result[label] ??= []).push(activity);
    return result;
  }, {});
  return (
    <div className="activity-feed">
      {Object.entries(groups).map(([label, items]) => (
        <section className="activity-day" key={label}>
          <h3>{label}</h3>
          {items.map((activity) => {
            const Icon = activityIcons[activity.type];
            return <div className="activity-row" key={activity.id}><span className="activity-icon"><Icon size={14} /></span><time dateTime={activity.createdAt}>{formatTime(activity.createdAt)}</time><div><strong>{activity.title}</strong>{activity.description ? <small>{activity.description}</small> : null}</div></div>;
          })}
        </section>
      ))}
    </div>
  );
}
