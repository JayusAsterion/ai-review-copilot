# Graph Report - ai-review-copilot  (2026-06-14)

## Corpus Check
- 81 files · ~26,937 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 447 nodes · 999 edges · 46 communities (36 shown, 10 thin omitted)
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
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_generateStaticBugReport|generateStaticBugReport]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]

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

## Communities (46 total, 10 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.12
Nodes (16): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.08
Nodes (45): extractJsonObject(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeBugReportResult(), normalizeOllamaUrl(), normalizePriority(), normalizeReproductionRate() (+37 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.21
Nodes (10): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+2 more)

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.14
Nodes (14): GuideBadge, UserGuideSection, userGuideSections, metadata, GuideCodeBlock(), GuideCodeBlockProps, GuideLayout(), GuideLayoutProps (+6 more)

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 8 - "RootLayout"
Cohesion: 0.20
Nodes (9): geistMono, geistSans, metadata, ThemeProvider(), ThemeToggle(), Tooltip(), TooltipContent(), TooltipProvider() (+1 more)

### Community 9 - "BugReportPage"
Cohesion: 0.16
Nodes (14): sampleNewFileContent, sampleOldFileContent, CodeReviewFormProps, DiffSource, focusOptions, OutputStyle, outputStyles, ReviewDepth (+6 more)

### Community 18 - "GuideBadge"
Cohesion: 0.07
Nodes (28): actionCards, AppShell(), AppShellProps, navItems, acceptedAttachments, BugAttachmentUploader(), BugAttachmentUploaderProps, acceptedFiles (+20 more)

### Community 24 - "useIsMobile"
Cohesion: 0.11
Nodes (32): useIsMobile(), cn(), Progress(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+24 more)

### Community 25 - "cn"
Cohesion: 0.25
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 26 - "combineGeneratedDiffs"
Cohesion: 0.15
Nodes (12): acceptedFiles, FileDropzone(), MultiFileDiffBuilder(), MultiFileDiffBuilderProps, statusClassName, GeneratedFileDiff, ReviewFileVersion, Tabs() (+4 more)

### Community 30 - "BugReportForm"
Cohesion: 0.12
Nodes (8): buildLocalDraft(), ConfigSelectProps, examples, priorityClassName, ResultsPanelProps, resultToMarkdown(), summarizeSource(), testTypes

### Community 33 - "Community 33"
Cohesion: 0.14
Nodes (11): metadata, providerOptions, ReviewWorkspace(), ReviewWorkspaceProps, OllamaSettingsCard(), BugReportForm(), CodeReviewForm(), metadata (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (13): addTextFinding(), lineNumberFor(), riskFromFindings(), runStaticHeuristics(), ScanTarget, GeneratedTestCase, ReviewFinding, ReviewInput (+5 more)

### Community 35 - "generateStaticBugReport"
Cohesion: 0.17
Nodes (12): ReviewResultPanel(), ReviewResultPanelProps, riskClassName, severityClassName, Card(), CardAction(), CardContent(), CardDescription() (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.21
Nodes (12): ConnectionState, OllamaSettingsCardProps, recommendedModels, OllamaModel, SelectContent(), SelectGroup(), SelectLabel(), SelectScrollDownButton() (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (9): sampleBugReport, BugReportFormProps, emptyBugReport, environmentOptions, reproductionOptions, BugReportInput, ReproductionRate, Select() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.35
Nodes (10): countChangedLines(), createDiffId(), createGeneratedFileDiff(), fallbackMatchKey(), filenameFromPath(), generateUnifiedDiff(), GenerateUnifiedDiffParams, matchKey() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (6): sampleNewFiles, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs(), generateMultiFileDiffs(), ReviewSourceFile

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

## Knowledge Gaps
- **76 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `metadata`, `metadata` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `useIsMobile` to `GPU Ollama Deployment`, `generateStaticBugReport`, `runOllamaCodeReview`, `runOllamaBugReport`, `buildBugReportPrompt`, `Community 36`, `Community 40`, `BugReportPage`, `Community 42`, `Community 41`, `Community 44`, `Community 45`, `Community 37`, `RootLayout`, `testOllamaConnection`, `GuideBadge`, `cn`, `combineGeneratedDiffs`?**
  _High betweenness centrality (0.411) - this node is a cross-community bridge._
- **Why does `Button()` connect `GuideBadge` to `GPU Ollama Deployment`, `normalizeOllamaUrl`, `generateStaticBugReport`, `Community 36`, `Community 37`, `runOllamaBugReport`, `testOllamaConnection`, `RootLayout`, `BugReportPage`, `useIsMobile`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Badge()` connect `GuideBadge` to `Community 33`, `normalizeOllamaUrl`, `generateStaticBugReport`, `Community 36`, `Community 37`, `testOllamaConnection`, `BugReportPage`, `useIsMobile`, `combineGeneratedDiffs`, `BugReportForm`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `normalizeOllamaUrl` be split into smaller, more focused modules?**
  _Cohesion score 0.07619738751814223 - nodes in this community are weakly interconnected._
- **Should `runOllamaCodeReview` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._