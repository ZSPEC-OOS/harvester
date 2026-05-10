"use client";
import { useState } from "react";
import { ActionCard } from "../cards/ActionCard";
import { ActiveSourcesCard } from "../cards/ActiveSourcesCard";
import { ApiConfigCard } from "../cards/ApiConfigCard";
import { ErrorBox } from "../cards/ErrorBox";
import { OutputCard } from "../cards/OutputCard";
import { ReferenceResultsCard } from "../cards/ReferenceResultsCard";
import { SearchConfigCard } from "../cards/SearchConfigCard";
import { ConsoleLog } from "../console/ConsoleLog";
import type { ApiConfig, CandidateSource, ResearchLogEntry, SearchConfig } from "@/types/research";

export function ResearchConsole(){const year=new Date().getFullYear(); const [searchConfig,setSearchConfig]=useState<SearchConfig>({topic:"",citationStyle:"apa",startYear:2000,endYear:year,searchDepth:50,includePreprints:true,excludePatents:true,onlyOpenAccess:false}); const [apiConfig,setApiConfig]=useState<ApiConfig>({nickname:"",baseUrl:"",modelId:"",apiKey:""}); const [logs,setLogs]=useState<ResearchLogEntry[]>([]); const [sources,setSources]=useState<CandidateSource[]>([]); const [output,setOutput]=useState(""); const [isRunning,setIsRunning]=useState(false); const [error,setError]=useState("");
const handleRun=()=>{ if(!searchConfig.topic.trim()){setError("Topic is required."); return;} setError(""); setIsRunning(true); setLogs((p)=>[...p,{id:crypto.randomUUID(),timestamp:new Date().toLocaleTimeString(),phase:"init",message:`Starting research for \"${searchConfig.topic}\"`}]); setTimeout(()=>{setSources([{id:"1",title:"Sample Paper",authors:["Ada Lovelace","Alan Turing"],year:2024,journal:"Journal of AI Research",doi:"10.1234/example",url:"https://doi.org/10.1234/example",sourceType:"journal"}]); setOutput(`# Research Summary\n\nTopic: ${searchConfig.topic}\n\n- Placeholder run complete.`); setLogs((p)=>[...p,{id:crypto.randomUUID(),timestamp:new Date().toLocaleTimeString(),phase:"synthesis",message:"Run completed."}]); setIsRunning(false);},2000);};
const handleExport=(f:"txt"|"bibtex"|"ris")=>console.log("Export",f); const handleStop=()=>setIsRunning(false);
return <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4"><SearchConfigCard config={searchConfig} onChange={setSearchConfig}/><ApiConfigCard config={apiConfig} onChange={setApiConfig}/><ActionCard onRun={handleRun} onStop={handleStop} onExport={handleExport} estimatedPapers={Math.max(25,searchConfig.searchDepth*2)} isRunning={isRunning} disableRun={!searchConfig.topic.trim()} /><ActiveSourcesCard sources={sources}/></div><div className="space-y-4">{error&&<ErrorBox message={error}/>}<ConsoleLog entries={logs}/><OutputCard output={output} isLoading={isRunning}/><ReferenceResultsCard sources={sources}/></div></div>;}
