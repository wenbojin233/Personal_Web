import { useEffect, useRef, useState } from "react";
import CvSectionPanel from "./components/CvSectionPanel";
import ChatPanel from "./components/ChatPanel";
import ProductSectionPanel from "./components/ProductSectionPanel";
import Sidebar from "./components/Sidebar";
import StaticSectionPanel from "./components/StaticSectionPanel";
import { DEFAULT_CHAT_COPY, streamChatCompletion } from "./lib/chat";

const sections = {
  home: {
    key: "home",
    navLabel: "\u9996\u9875",
    mode: "chat",
    title: "Hi，我是 Wenbo Jin 的私人助手",
    subtitle: "你可以直接问我关于 Wenbo Jin 的教育、经历、项目和兴趣。",
    emptyResponse: "这里会显示关于 Wenbo Jin 的回答。",
    quickAsks: [
      { label: "Wenbo 是谁？", prompt: "请用简短的话介绍一下 Wenbo Jin" },
      { label: "教育背景", prompt: "Wenbo Jin 的教育背景是什么？" },
      { label: "AI 项目经验", prompt: "Wenbo Jin 做过哪些 AI 相关项目或工作？" },
    ],
  },
  cv: {
    key: "cv",
    navLabel: "CV",
    mode: "static",
    title: "Wenbo Jin",
    subtitle:
      "AI product manager with experience across large models, industrial AI, investment research, and fintech product workflows.",
    education: [
      {
        title: "\u675c\u514b\u5927\u5b66",
        org: "\u91d1\u878d\u79d1\u6280\u7855\u58eb",
        date: "2024.09 \u2013 2026.05",
      },
      {
        title: "\u5a01\u65af\u5eb7\u661f\u5927\u5b66\u9ea6\u8fea\u900a\u5206\u6821",
        org: "\u53cc\u4e13\u4e1a\uff1a\u8ba1\u7b97\u673a\u79d1\u5b66 \u0026 \u7ecf\u6d4e\u5b66",
        date: "2019.08 \u2013 2023.12",
      },
    ],
    experience: [
      {
        title: "AI\u4ea7\u54c1\u7ecf\u7406\u5b9e\u4e60\u751f",
        org: "\u4eac\u4e1c\u96c6\u56e2-\u4eac\u4e1c\u5de5\u4e1a",
        date: "2025.08 \u2013 2025.12",
      },
      {
        title: "AI\u4ea7\u54c1\u7ecf\u7406\u5b9e\u4e60\u751f",
        org: "\u5546\u6c64\u79d1\u6280-\u5546\u6c64\u7814\u7a76\u9662\u65e5\u65e5\u65b0\u5927\u6a21\u578b",
        date: "2025.05 \u2013 2025.08",
      },
      {
        title: "\u6570\u636e\u5206\u6790\u4e0e\u884c\u4e1a\u7814\u7a76\u5b9e\u4e60\u751f",
        org: "\u7533\u4e07\u5b8f\u6e90\u8bc1\u5238\u7814\u7a76\u6240",
        date: "2024.05 \u2013 2024.08",
      },
      {
        title: "\u4ea7\u54c1\u7ecf\u7406",
        org: "Epic \u00d7 \u5a01\u65af\u5eb7\u661f\u5927\u5b66\u9ea6\u8fea\u900a\u5206\u6821\u6821\u4f01\u5408\u4f5c",
        date: "2023.09 \u2013 2023.12",
      },
      {
        title: "\u56fd\u9645\u8d38\u6613\u4e8b\u52a1\u5b9e\u4e60\u751f",
        org: "\u8d5b\u5c14\u7f51\u7edc\u6709\u9650\u516c\u53f8",
        date: "2023.06 \u2013 2023.08",
      },
      {
        title: "\u8f6f\u4ef6\u5de5\u7a0b\u5b9e\u4e60\u751f",
        org: "\u4e91\u6da6\u5927\u6570\u636e\u670d\u52a1\u6709\u9650\u516c\u53f8",
        date: "2021.06 \u2013 2021.08",
      },
    ],
  },
  products: {
    key: "products",
    navLabel: "\u4ea7\u54c1",
    mode: "static",
    title: "Selected Work",
    subtitle: "Curated Product Design 2026",
    intro: "",
    works: [
      {
        index: "01",
        title: "AI投资分析建议产品",
        description:
          "面向个人与专业投资者的智能研究助手，结合市场数据、财报信息与策略框架，快速生成结构化投资分析与建议，帮助用户更高效地完成标的筛选、逻辑验证与决策支持。",
        tags: ["AI Investment", "2026"],
        accent: "primary",
      },
      {
        index: "02",
        title: "智能量化投资产品",
        description:
          "聚焦策略生成、回测分析与执行辅助的量化投资平台，通过自动化信号处理与策略评估流程，提升投资研究效率，并为量化决策提供更稳定的产品化支持。",
        tags: ["Quantitative Investing", "2026"],
        accent: "secondary",
      },
    ],
    ctaTitle: "Have a vision?",
    ctaText: "Let's curate something exceptional",
    footerNote: "\u00a9 2024 Wenbo Jin. Built with intentionality.",
    footerLinks: ["Twitter", "LinkedIn", "Read.cv"],
  },
};

export default function App() {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [placeholder, setPlaceholder] = useState(DEFAULT_CHAT_COPY.idlePlaceholder);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeSection === "home") {
      inputRef.current?.focus();
    }
  }, [activeSection]);

  const currentSection = sections[activeSection];

  const runQuery = async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query || isStreaming) {
      return;
    }

    setIsStreaming(true);
    setResponseText("");
    setInputValue("");
    setPlaceholder(DEFAULT_CHAT_COPY.thinkingPlaceholder);

    try {
      await streamChatCompletion({
        query,
        onStart: () => setPlaceholder(DEFAULT_CHAT_COPY.readyPlaceholder),
        onChunk: (chunk) => {
          setResponseText((current) => current + chunk);
        },
      });
    } catch (error) {
      setResponseText(`${DEFAULT_CHAT_COPY.errorPrefix}${error.message}`);
      setPlaceholder(DEFAULT_CHAT_COPY.retryPlaceholder);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickAsk = (prompt) => {
    setInputValue(prompt);
    runQuery(prompt);
  };

  return (
    <div className="app-shell">
      <div className="background-glow" />
      <Sidebar
        sections={Object.values(sections)}
        activeSection={activeSection}
        onSelectSection={(sectionKey) => {
          setActiveSection(sectionKey);
          setResponseText("");
          setInputValue("");
          setPlaceholder(DEFAULT_CHAT_COPY.idlePlaceholder);
        }}
      />

      <main className={`main-content ${currentSection.mode === "static" ? "main-content-scrollable" : ""}`}>
        {currentSection.mode === "chat" ? (
          <ChatPanel
            section={currentSection}
            inputRef={inputRef}
            inputValue={inputValue}
            placeholder={placeholder}
            responseText={responseText}
            isStreaming={isStreaming}
            quickAsks={currentSection.quickAsks}
            onInputChange={setInputValue}
            onSubmit={runQuery}
            onQuickAsk={handleQuickAsk}
          />
        ) : currentSection.key === "cv" ? (
          <CvSectionPanel section={currentSection} />
        ) : currentSection.key === "products" ? (
          <ProductSectionPanel section={currentSection} />
        ) : (
          <StaticSectionPanel section={currentSection} />
        )}
      </main>
    </div>
  );
}
