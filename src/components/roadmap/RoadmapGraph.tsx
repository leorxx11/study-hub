import { ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { roadmapCategories, roadmapNodes } from "../../data/roadmap";
import type { RoadmapCategory } from "../../types";
import { RoadmapDetail } from "./RoadmapDetail";

const categoryClass: Record<RoadmapCategory, string> = { testing: "testing", engineering: "engineering", development: "development" };

export function RoadmapGraph() {
  const [selectedId, setSelectedId] = useState(roadmapNodes[0].id);
  const selectedNode = roadmapNodes.find((node) => node.id === selectedId) ?? roadmapNodes[0];

  return (
    <div className="roadmap-layout">
      <section className="roadmap-map" aria-label="SDET 成长路线能力图">
        <div className="roadmap-root">
          <span>PRIMARY PATH</span>
          <strong>测试开发 / SDET</strong>
          <small>从测试执行到质量工程</small>
        </div>
        <div className="roadmap-trunk" aria-hidden="true" />
        <div className="roadmap-columns">
          {roadmapCategories.map((category) => (
            <section className={`roadmap-column ${categoryClass[category.id]}`} key={category.id}>
              <header>
                <span className="category-index">0{roadmapCategories.findIndex((item) => item.id === category.id) + 1}</span>
                <div><h2>{category.title}</h2><p>{category.description}</p></div>
              </header>
              <div className="node-list">
                {roadmapNodes.filter((node) => node.category === category.id).map((node) => (
                  <button
                    className={`roadmap-node${node.id === selectedId ? " active" : ""}`}
                    type="button"
                    aria-pressed={node.id === selectedId}
                    onClick={() => setSelectedId(node.id)}
                    key={node.id}
                  >
                    <div className="node-title-row"><strong>{node.title}</strong><ChevronRight size={15} /></div>
                    <p>{node.summary}</p>
                    <div className="node-meta">
                      <span>{node.shortTitle}</span>
                      <span className="priority-stars" aria-label={`优先级 ${node.priority} 星`}>
                        {Array.from({ length: 5 }, (_, index) => <Star key={index} size={10} fill={index < node.priority ? "currentColor" : "none"} />)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <RoadmapDetail node={selectedNode} />
    </div>
  );
}
