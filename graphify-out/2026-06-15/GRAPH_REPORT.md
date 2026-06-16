# Graph Report - ai-review-copilot  (2026-06-15)

## Corpus Check
- 85 files · ~33,784 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 492 nodes · 1173 edges · 42 communities (33 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7029fad9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Ollama Runtime Config|Ollama Runtime Config]]
- [[_COMMUNITY_GPU Ollama Deployment|GPU Ollama Deployment]]
- [[_COMMUNITY_normalizeOllamaUrl|normalizeOllamaUrl]]
- [[_COMMUNITY_runOllamaBugReport|runOllamaBugReport]]
- [[_COMMUNITY_runOllamaCodeReview|runOllamaCodeReview]]
- [[_COMMUNITY_testOllamaConnection|testOllamaConnection]]
- [[_COMMUNITY_buildBugReportPrompt|buildBugReportPrompt]]
- [[_COMMUNITY_buildCodeReviewPrompt|buildCodeReviewPrompt]]
- [[_COMMUNITY_RootLayout|RootLayout]]
- [[_COMMUNITY_BugReportPage|BugReportPage]]
- [[_COMMUNITY_ReviewWorkspace|ReviewWorkspace]]
- [[_COMMUNITY_ThemeProvider|ThemeProvider]]
- [[_COMMUNITY_sampleFilePath|sampleFilePath]]
- [[_COMMUNITY_sampleNewFile|sampleNewFile]]
- [[_COMMUNITY_sampleOldFile|sampleOldFile]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_HistoryPage|HistoryPage]]
- [[_COMMUNITY_useIsMobile|useIsMobile]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_combineGeneratedDiffs|combineGeneratedDiffs]]
- [[_COMMUNITY_BugReportForm|BugReportForm]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 155 edges
2. `Button()` - 23 edges
3. `Badge()` - 21 edges
4. `Label()` - 10 edges
5. `bugReportResultToMarkdown()` - 10 edges
6. `Separator()` - 9 edges
7. `runOllamaBugReport()` - 9 edges
8. `generateStaticBugReport()` - 9 edges
9. `OllamaSettings` - 9 edges
10. `Input()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `ReviewFileUploader()` --calls--> `cn()`  [EXTRACTED]
  src/components/file-uploader/review-file-uploader.tsx → src/lib/utils.ts
- `FileDropzone()` --calls--> `cn()`  [EXTRACTED]
  src/components/review-input/multi-file-diff-builder.tsx → src/lib/utils.ts
- `Accordion()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionTrigger()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ollama Docker Deployment Variants** — docker_docker_compose_gpu_ollama_service, docker_docker_compose_ollama_service, docker_docker_compose_gpu_nvidia_gpu_reservation [INFERRED 0.95]

## Communities (42 total, 9 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.12
Nodes (16): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.11
Nodes (39): extractJsonObject(), getInstalledOllamaModels(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeBugReportResult(), normalizeFalsePositiveCheck(), normalizeFinding() (+31 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.06
Nodes (33): actionCards, AppShell(), AppShellProps, navItems, ThemeToggle(), acceptedAttachments, BugAttachmentUploader(), BugAttachmentUploaderProps (+25 more)

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.22
Nodes (7): geistMono, geistSans, metadata, ThemeProvider(), Tooltip(), TooltipProvider(), TooltipTrigger()

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.25
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 9 - "BugReportPage"
Cohesion: 0.11
Nodes (23): BugReportResultPanel(), BugReportResultPanelProps, priorityClassName, severityClassName, buildMissingInformation(), buildTestCases(), generateStaticBugReport(), includesAny() (+15 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (14): GuideBadge, UserGuideSection, userGuideSections, metadata, GuideCodeBlock(), GuideCodeBlockProps, GuideLayout(), GuideLayoutProps (+6 more)

### Community 24 - "useIsMobile"
Cohesion: 0.10
Nodes (33): useIsMobile(), cn(), Progress(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+25 more)

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (10): metadata, ConfigSelectProps, examples, priorityClassName, ResultsPanelProps, TestCasesWorkspace(), testTypes, TestCaseCoverageLevel (+2 more)

### Community 26 - "combineGeneratedDiffs"
Cohesion: 0.09
Nodes (28): sampleNewFiles, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs(), countChangedLines(), createDiffId(), createGeneratedFileDiff(), fallbackMatchKey() (+20 more)

### Community 30 - "BugReportForm"
Cohesion: 0.05
Nodes (51): getOllamaSettingsForModule(), loadOllamaLocalSettings(), normalizeSettings(), useOllamaModuleSettings(), AI_MODULES, DEFAULT_OLLAMA_LOCAL_SETTINGS, DEFAULT_OLLAMA_MODULE_MODELS, getOllamaPreset() (+43 more)

### Community 33 - "Community 33"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (6): confidenceClassName, ReviewResultPanel(), ReviewResultPanelProps, riskClassName, severityClassName, reviewResultToMarkdown()

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (15): isModelInstalled(), isSameOllamaModel(), normalizeOllamaModelName(), useOllamaLocalSettings(), getStatusClassName(), ModuleModelCard(), ModuleModelCardProps, OptimizedOllamaModelsSettings() (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (11): ConnectionState, OllamaSettingsCardProps, recommendedModels, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (9): OllamaModelStatusProps, Select(), SelectContent(), SelectGroup(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

## Knowledge Gaps
- **79 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `metadata`, `metadata` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `useIsMobile` to `GPU Ollama Deployment`, `Community 33`, `runOllamaBugReport`, `Community 36`, `Community 37`, `buildBugReportPrompt`, `Community 39`, `Community 40`, `runOllamaCodeReview`, `RootLayout`, `Community 35`, `Community 41`, `Community 38`, `testOllamaConnection`, `Community 18`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.375) - this node is a cross-community bridge._
- **Why does `Button()` connect `runOllamaBugReport` to `GPU Ollama Deployment`, `Community 34`, `Community 33`, `Community 36`, `Community 37`, `Community 38`, `BugReportPage`, `Community 18`, `useIsMobile`, `Community 25`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Badge()` connect `runOllamaBugReport` to `Community 34`, `Community 36`, `Community 37`, `Community 38`, `BugReportPage`, `Community 18`, `useIsMobile`, `Community 25`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `normalizeOllamaUrl` be split into smaller, more focused modules?**
  _Cohesion score 0.10853658536585366 - nodes in this community are weakly interconnected._
- **Should `runOllamaBugReport` be split into smaller, more focused modules?**
  _Cohesion score 0.06493506493506493 - nodes in this community are weakly interconnected._