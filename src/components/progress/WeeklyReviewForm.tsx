import { Check, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useStudyState, type WeeklyReviewDraft } from "../../hooks/useStudyState";
import { getWeekKey } from "../../utils/date";

const reviewFields: { key: Exclude<keyof WeeklyReviewDraft, "week">; label: string; placeholder: string }[] = [
  { key: "learned", label: "这周学了什么？", placeholder: "概念、技术或新的理解" },
  { key: "work", label: "这周公司做了什么？", placeholder: "只写抽象工作内容，不写敏感信息" },
  { key: "mostValuableProblem", label: "最有价值的问题是什么？", placeholder: "现象、定位路径与价值" },
  { key: "automated", label: "我自动化了什么？", placeholder: "脚本、工具或减少的重复步骤" },
  { key: "unclear", label: "还有什么没搞懂？", placeholder: "把模糊点留给下周验证" },
  { key: "nextWeekGoals", label: "下周三个目标是什么？", placeholder: "1.\n2.\n3." },
  { key: "resumeValue", label: "这周有什么值得未来写进简历？", placeholder: "结果、规模、效率或技术难点" },
];

const emptyReview = (week: string): WeeklyReviewDraft => ({ week, learned: "", work: "", mostValuableProblem: "", automated: "", unclear: "", nextWeekGoals: "", resumeValue: "" });

export function WeeklyReviewForm() {
  const { state, weeklyMetrics, saveWeeklyReview } = useStudyState();
  const week = getWeekKey();
  const saved = state.weeklyReviews.find((review) => review.week === week);
  const [draft, setDraft] = useState<WeeklyReviewDraft>(emptyReview(week));
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraft(saved ? { week: saved.week, learned: saved.learned, work: saved.work, mostValuableProblem: saved.mostValuableProblem, automated: saved.automated, unclear: saved.unclear, nextWeekGoals: saved.nextWeekGoals, resumeValue: saved.resumeValue } : emptyReview(week));
  }, [saved, week]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveWeeklyReview(draft);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <section className="weekly-review-card">
      <header className="weekly-review-header"><div><span className="detail-kicker">WEEKLY REVIEW · {week}</span><h2>把一周的行动变成可表达的成长</h2><p>系统数据已自动汇总，你只需要补充判断与反思。</p></div><div className="review-save-state">{savedNotice ? <span><Check size={13} />已保存</span> : saved ? <small>上次已保存</small> : <small>尚未保存</small>}</div></header>
      <div className="review-system-metrics"><span><strong>{weeklyMetrics.tasksCompleted}</strong> Tasks Completed</span><span><strong>{weeklyMetrics.practices}</strong> Practices</span><span><strong>{weeklyMetrics.bugCases}</strong> Bug Cases</span><span><strong>{weeklyMetrics.notes}</strong> Notes</span><span><strong>{weeklyMetrics.milestones}</strong> Project Milestones</span></div>
      <form className="weekly-review-form" onSubmit={submit}>{reviewFields.map((field) => <label key={field.key}><span>{field.label}</span><textarea rows={field.key === "nextWeekGoals" ? 4 : 3} value={draft[field.key]} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} /></label>)}<button className="primary-button" type="submit"><Save size={14} />保存本周复盘</button></form>
    </section>
  );
}
