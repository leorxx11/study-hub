import { Check, Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useStudyState, type WeeklyReviewV3Draft } from "../../hooks/useStudyState";
import { getWeeklyLogs } from "../../services/v3Selectors";
import type { GrowthLevel } from "../../types";

const questions: { key: "mainWork" | "learned" | "repetitiveWork" | "deepDive" | "nextWeekTop3"; label: string; placeholder: string }[] = [
  { key: "mainWork", label: "1. 这周主要做了什么？", placeholder: "Daily Log 会给你一个起点，也可以完全重写。" },
  { key: "learned", label: "2. 真正学到的东西是什么？", placeholder: "不是看过什么，而是现在真的理解了什么。" },
  { key: "repetitiveWork", label: "3. 哪些工作很重复 / 价值比较低？", placeholder: "哪些步骤值得自动化？当前实习质量如何？" },
  { key: "deepDive", label: "4. 有什么问题值得下周深入？", placeholder: "留下最值得继续研究的技术问题。" },
  { key: "nextWeekTop3", label: "5. 下周最重要的 3 件事？", placeholder: "1.\n2.\n3." },
];

const growthFields = [
  ["technicalUnderstanding", "技术理解"], ["problemSolving", "问题定位"], ["automation", "自动化"], ["engineeringProcess", "工程流程"],
] as const;
const growthOptions: { value: GrowthLevel; label: string }[] = [{ value: "same", label: "没变化" }, { value: "some", label: "有一点" }, { value: "clear", label: "明显提升" }];

export function WeeklyReviewV3Form({ week }: { week: string }) {
  const { state, saveWeeklyReviewV3 } = useStudyState();
  const saved = state.weeklyReviewsV3.find((review) => review.week === week);
  const logs = getWeeklyLogs(state, week);
  const automaticSummary = useMemo(() => logs.map((log) => `${log.date.slice(5)} · ${log.work.replace(/\s+/g, " ").slice(0, 150)}`).join("\n"), [logs]);
  const empty = useMemo<WeeklyReviewV3Draft>(() => ({ week, mainWork: automaticSummary, learned: "", repetitiveWork: "", deepDive: "", nextWeekTop3: "", growthCheck: { technicalUnderstanding: "same", problemSolving: "same", automation: "same", engineeringProcess: "same" } }), [automaticSummary, week]);
  const [draft, setDraft] = useState<WeeklyReviewV3Draft>(empty);
  const [notice, setNotice] = useState(false);
  useEffect(() => { setDraft(saved ? { week: saved.week, mainWork: saved.mainWork, learned: saved.learned, repetitiveWork: saved.repetitiveWork, deepDive: saved.deepDive, nextWeekTop3: saved.nextWeekTop3, growthCheck: saved.growthCheck } : empty); }, [empty, saved]);
  const submit = (event: FormEvent) => { event.preventDefault(); saveWeeklyReviewV3(draft); setNotice(true); window.setTimeout(() => setNotice(false), 1800); };
  return (
    <form className="v3-review-form" onSubmit={submit}><div className="v3-section-heading"><div><span>WEEKLY REVIEW</span><h2>理解这一周，而不是给它打分</h2></div>{notice ? <small className="save-notice"><Check size={12} />已保存</small> : saved ? <small>已保存，可继续修改</small> : <small>5 个问题</small>}</div><div className="review-question-list">{questions.map((question) => <label key={question.key}><span>{question.label}</span><textarea rows={question.key === "mainWork" || question.key === "nextWeekTop3" ? 5 : 4} value={draft[question.key]} onChange={(event) => setDraft((current) => ({ ...current, [question.key]: event.target.value }))} placeholder={question.placeholder} /></label>)}</div><section className="growth-check"><div><span>GROWTH CHECK</span><h3>这一周相比上周</h3><p>不用于排名，只是定期问自己：到底有没有进步？</p></div><div className="growth-check-grid">{growthFields.map(([key, label]) => <fieldset key={key}><legend>{label}</legend><div>{growthOptions.map((option) => <button type="button" className={draft.growthCheck[key] === option.value ? "active" : ""} aria-pressed={draft.growthCheck[key] === option.value} onClick={() => setDraft((current) => ({ ...current, growthCheck: { ...current.growthCheck, [key]: option.value } }))} key={option.value}>{option.label}</button>)}</div></fieldset>)}</div></section><button className="primary-button review-submit" type="submit"><Save size={14} />保存本周复盘</button></form>
  );
}
