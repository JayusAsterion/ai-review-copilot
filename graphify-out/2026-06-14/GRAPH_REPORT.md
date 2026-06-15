# Graph Report - ai-review-copilot  (2026-06-14)

## Corpus Check
- 81 files · ~27,091 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 448 nodes · 1000 edges · 34 communities (27 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d49e09c`
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
- [[_COMMUNITY_GuideBadge|GuideBadge]]
- [[_COMMUNITY_HistoryPage|HistoryPage]]
- [[_COMMUNITY_useIsMobile|useIsMobile]]
- [[_COMMUNITY_cn|cn]]
- [[_COMMUNITY_combineGeneratedDiffs|combineGeneratedDiffs]]
- [[_COMMUNITY_BugReportForm|BugReportForm]]
- [[_COMMUNITY_generateStaticBugReport|generateStaticBugReport]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 155 edges
2. `Button()` - 21 edges
3. `Badge()` - 19 edges
4. `bugReportResultToMarkdown()` - 10 edges
5. `Label()` - 9 edges
6. `generateStaticBugReport()` - 9 edges
7. `Separator()` - 8 edges
8. `runOllamaBugReport()` - 8 edges
9. `AppShell()` - 7 edges
10. `Input()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ReviewFileUploader()` --calls--> `cn()`  [EXTRACTED]
  src/components/file-uploader/review-file-uploader.tsx → src/lib/utils.ts
- `FileDropzone()` --calls--> `cn()`  [EXTRACTED]
  src/components/review-input/multi-file-diff-builder.tsx → src/lib/utils.ts
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert.tsx → src/lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ollama Docker Deployment Variants** — docker_docker_compose_gpu_ollama_service, docker_docker_compose_ollama_service, docker_docker_compose_gpu_nvidia_gpu_reservation [INFERRED 0.95]

## Communities (34 total, 7 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.11
Nodes (17): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+9 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.14
Nodes (26): extractJsonObject(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeBugReportResult(), normalizeOllamaUrl(), normalizePriority(), normalizeReproductionRate() (+18 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.16
Nodes (10): HoverCardContent(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+2 more)

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.18
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 8 - "RootLayout"
Cohesion: 0.20
Nodes (9): geistMono, geistSans, metadata, ThemeProvider(), ThemeToggle(), Tooltip(), TooltipContent(), TooltipProvider() (+1 more)

### Community 9 - "BugReportPage"
Cohesion: 0.07
Nodes (33): metadata, modeOptions, providerOptions, ReviewWorkspace(), ReviewWorkspaceProps, sampleNewFileContent, sampleOldFileContent, OllamaSettingsCard() (+25 more)

### Community 18 - "GuideBadge"
Cohesion: 0.06
Nodes (33): actionCards, AppShell(), AppShellProps, navItems, GuideBadge, UserGuideSection, userGuideSections, acceptedAttachments (+25 more)

### Community 24 - "useIsMobile"
Cohesion: 0.08
Nodes (29): useIsMobile(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction() (+21 more)

### Community 25 - "cn"
Cohesion: 0.13
Nodes (22): cn(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarBadge(), AvatarFallback() (+14 more)

### Community 26 - "combineGeneratedDiffs"
Cohesion: 0.09
Nodes (28): sampleNewFiles, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs(), countChangedLines(), createDiffId(), createGeneratedFileDiff(), fallbackMatchKey() (+20 more)

### Community 30 - "BugReportForm"
Cohesion: 0.06
Nodes (42): sampleBugReport, ConnectionState, OllamaSettingsCardProps, recommendedModels, BugReportForm(), BugReportFormProps, emptyBugReport, environmentOptions (+34 more)

### Community 35 - "generateStaticBugReport"
Cohesion: 0.08
Nodes (32): BugReportResultPanel(), BugReportResultPanelProps, priorityClassName, severityClassName, ReviewResultPanel(), ReviewResultPanelProps, riskClassName, severityClassName (+24 more)

## Knowledge Gaps
- **77 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `metadata`, `metadata` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `GPU Ollama Deployment`, `runOllamaBugReport`, `generateStaticBugReport`, `runOllamaCodeReview`, `buildBugReportPrompt`, `testOllamaConnection`, `RootLayout`, `BugReportPage`, `GuideBadge`, `useIsMobile`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.410) - this node is a cross-community bridge._
- **Why does `Button()` connect `GuideBadge` to `GPU Ollama Deployment`, `generateStaticBugReport`, `runOllamaBugReport`, `testOllamaConnection`, `RootLayout`, `BugReportPage`, `useIsMobile`, `cn`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Badge()` connect `GuideBadge` to `generateStaticBugReport`, `BugReportPage`, `cn`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.11255411255411256 - nodes in this community are weakly interconnected._
- **Should `normalizeOllamaUrl` be split into smaller, more focused modules?**
  _Cohesion score 0.14039408866995073 - nodes in this community are weakly interconnected._
- **Should `runOllamaCodeReview` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._