import { Check, ChevronDown, Circle, Pin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TopicDetail } from "../components/roadmap/TopicDetail";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { roadmapModules, roadmapPaths, roadmapTopics, topicById } from "../data/roadmapV3";
import { stages } from "../data/stages";
import { useStudyState } from "../hooks/useStudyState";
import { getCurrentTopics, getModuleProgress, getPathProgress, getTopicStatus, topicStatusLabels } from "../services/v3Selectors";

export function Roadmap() {
  const { state } = useStudyState();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("topic");
  const initialTopic = requested && topicById.has(requested) ? requested : state.settings.currentFocusTopicIds[0] ?? roadmapTopics[0].id;
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopic);
  const selectedTopic = topicById.get(selectedTopicId) ?? roadmapTopics[0];
  const [selectedPathId, setSelectedPathId] = useState(selectedTopic.pathId);
  const currentTopics = getCurrentTopics(state);

  useEffect(() => {
    if (!requested || !topicById.has(requested)) return;
    setSelectedTopicId(requested);
    setSelectedPathId(topicById.get(requested)!.pathId);
  }, [requested]);

  const pathModules = useMemo(() => roadmapModules.filter((module) => module.pathId === selectedPathId), [selectedPathId]);
  const selectTopic = (id: string) => {
    const topic = topicById.get(id);
    if (!topic) return;
    setSelectedTopicId(id);
    setSelectedPathId(topic.pathId);
    setSearchParams({ topic: id }, { replace: true });
  };
  const selectedPath = roadmapPaths.find((path) => path.id === selectedPathId) ?? roadmapPaths[0];
  const stage = stages.find((item) => item.id === selectedPath.stageId);

  return (
    <>
      <PageHeader eyebrow="LEARNING NAVIGATION" title="Roadmap" description="路线不是课程锁。一次只选择 1–3 个 Current Topics，知道今晚学什么、学到什么程度、如何带回真实实践。" />
      <section className="roadmap-focus-strip"><div><Pin size={15} /><span>Current Focus</span></div>{currentTopics.map((topic) => topic ? <button type="button" className={selectedTopicId === topic.id ? "active" : ""} onClick={() => selectTopic(topic.id)} key={topic.id}><strong>{topic.title}</strong><small>{topicStatusLabels[getTopicStatus(state, topic.id)]}</small></button> : null)}</section>
      <nav className="path-tabs" aria-label="学习路径">{roadmapPaths.map((path) => { const pathProgress = getPathProgress(state, path.id); return <button type="button" className={selectedPathId === path.id ? "active" : ""} onClick={() => { setSelectedPathId(path.id); const first = roadmapModules.find((module) => module.pathId === path.id)?.topicIds[0]; if (first) selectTopic(first); }} key={path.id}><span>{path.code}</span><div><strong>{path.title}</strong><small>{pathProgress.done}/{pathProgress.total} Topics</small></div></button>; })}</nav>
      <div className="v3-roadmap-context"><span>{selectedPath.code} PATH</span><strong>{selectedPath.title}</strong><p>{selectedPath.description}</p>{stage ? <small>{stage.period} · {stage.title}</small> : null}</div>
      <div className="v3-roadmap-layout">
        <aside className="topic-tree">
          {pathModules.map((module) => { const progress = getModuleProgress(state, module.id); const containsSelected = module.topicIds.includes(selectedTopicId); return <details open={containsSelected || progress.active > 0} key={module.id}><summary><div><strong>{module.title}</strong><small>{progress.done} / {progress.total} Done</small></div><ProgressBar value={progress.done} max={progress.total} label={`${module.title} 完成进度`} /><ChevronDown size={14} /></summary><div className="tree-topic-list">{module.topicIds.map((id) => { const topic = topicById.get(id)!; const status = getTopicStatus(state, id); return <button type="button" className={`${selectedTopicId === id ? "active" : ""} ${status}`} onClick={() => selectTopic(id)} key={id}><span>{status === "done" ? <Check size={11} /> : status === "not_started" ? <Circle size={10} /> : <i />}</span><em>{String(topic.order).padStart(2, "0")}</em><strong>{topic.title}</strong></button>; })}</div></details>; })}
        </aside>
        <TopicDetail topic={selectedTopic} onSelectTopic={selectTopic} />
      </div>
    </>
  );
}
