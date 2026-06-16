# Graph Report - ai-review-copilot  (2026-06-16)

## Corpus Check
- 111 files · ~49,937 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 651 nodes · 1605 edges · 55 communities (47 shown, 8 thin omitted)
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 155 edges
2. `Button()` - 28 edges
3. `Badge()` - 24 edges
4. `normalizeAzureOrganization()` - 18 edges
5. `fetchAzurePullRequestReviewContext()` - 14 edges
6. `authOptions` - 13 edges
7. `normalizeAzureProject()` - 13 edges
8. `Label()` - 12 edges
9. `Separator()` - 11 edges
10. `normalizeAzureRepositoryId()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ReviewFileUploader()` --calls--> `cn()`  [EXTRACTED]
  src/components/file-uploader/review-file-uploader.tsx → src/lib/utils.ts
- `FileDropzone()` --calls--> `cn()`  [EXTRACTED]
  src/components/review-input/multi-file-diff-builder.tsx → src/lib/utils.ts
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert.tsx → src/lib/utils.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ollama Docker Deployment Variants** — docker_docker_compose_gpu_ollama_service, docker_docker_compose_ollama_service, docker_docker_compose_gpu_nvidia_gpu_reservation [INFERRED 0.95]

## Communities (55 total, 8 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.11
Nodes (29): cn(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem() (+21 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.18
Nodes (20): extractJsonObject(), normalizeBugReportResult(), normalizeFalsePositiveCheck(), normalizeFinding(), normalizeGeneratedTestCase(), normalizePriority(), normalizeReproductionRate(), normalizeReviewResult() (+12 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.16
Nodes (8): getOllamaSettingsForModule(), useOllamaModuleSettings(), metadata, AppShell(), ReviewWorkspace(), metadata, metadata, TestCasesWorkspace()

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.11
Nodes (19): initialsFromName(), UserMenu(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+11 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.14
Nodes (10): getAzureStatusForUser(), getIsoFromUnixSeconds(), isTokenExpired(), normalizeAzureConnectionStatus(), adapter, globalForPrisma, handler, authOptions (+2 more)

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.27
Nodes (11): getAzureDevOpsErrorResponse(), getOrganizationFromRequest(), isTokenExpired(), jsonError(), POST(), AzureDevOpsRequestError, fetchAzureProjects(), GET() (+3 more)

### Community 8 - "RootLayout"
Cohesion: 0.14
Nodes (18): loadOllamaLocalSettings(), normalizeSettings(), AI_MODULES, DEFAULT_OLLAMA_LOCAL_SETTINGS, DEFAULT_OLLAMA_MODULE_MODELS, OLLAMA_MODEL_PRESETS, AiModule, BugSeverity (+10 more)

### Community 9 - "BugReportPage"
Cohesion: 0.08
Nodes (41): addUniqueWarning(), AzureDevOpsChangesApiItem, AzureDevOpsChangesApiResponse, AzureDevOpsItemContentResponse, AzureDevOpsIterationsApiItem, AzureDevOpsListApiResponse, AzureDevOpsProjectApiItem, AzureDevOpsPullRequestApiItem (+33 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (14): GuideBadge, UserGuideSection, userGuideSections, metadata, GuideCodeBlock(), GuideCodeBlockProps, GuideLayout(), GuideLayoutProps (+6 more)

### Community 24 - "useIsMobile"
Cohesion: 0.08
Nodes (29): useIsMobile(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction() (+21 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (15): AzureDevOpsCard(), ConnectionTestResult, formatDate(), formatStatus(), initialsFromName(), MicrosoftAccountCard(), AzureConfigureResponse, AzureProject (+7 more)

### Community 26 - "combineGeneratedDiffs"
Cohesion: 0.20
Nodes (14): OllamaModelStatusProps, ConnectionState, OllamaSettingsCardProps, recommendedModels, Select(), SelectContent(), SelectGroup(), SelectItem() (+6 more)

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (5): fetchAzureRepositories(), GET(), getAzureDevOpsErrorResponse(), isTokenExpired(), jsonError()

### Community 33 - "Community 33"
Cohesion: 0.23
Nodes (9): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea(), Input() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.34
Nodes (13): fetchAzureFileContent(), fetchAzurePullRequests(), normalizeAzureOrganization(), normalizeAzureProject(), normalizeAzurePullRequestStatus(), normalizeAzureRepositoryId(), GET(), getAzureDevOpsErrorResponse() (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (6): ConfigSelectProps, examples, priorityClassName, ResultsPanelProps, testTypes, Label()

### Community 36 - "Community 36"
Cohesion: 0.05
Nodes (50): providerOptions, ReviewWorkspaceProps, sampleNewFileContent, sampleNewFiles, sampleOldFileContent, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs() (+42 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (5): HoverCardContent(), Progress(), ScrollArea(), ScrollBar(), Switch()

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (17): BugReportResultPanelProps, priorityClassName, severityClassName, confidenceClassName, ReviewResultPanel(), ReviewResultPanelProps, riskClassName, severityClassName (+9 more)

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (4): config, proxy(), redirectToSignIn(), sessionCookieNames

### Community 40 - "Community 40"
Cohesion: 0.21
Nodes (9): BugReportResultPanel(), BugReportResult, GeneratedTestCase, TestCaseResult, bugReportResultToMarkdown(), formatList(), formatNumberedList(), severityLabel (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.09
Nodes (24): actionCards, LoginScreen(), sampleBugReport, acceptedAttachments, BugAttachmentUploader(), BugAttachmentUploaderProps, acceptedFiles, ReviewFileUploader() (+16 more)

### Community 44 - "Community 44"
Cohesion: 0.21
Nodes (7): geistMono, geistSans, metadata, AuthGate(), AuthSessionProvider(), ThemeProvider(), TooltipProvider()

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (8): addTextFinding(), lineNumberFor(), riskFromFindings(), runStaticHeuristics(), ScanTarget, ReviewFinding, ReviewInput, ReviewResult

### Community 46 - "Community 46"
Cohesion: 0.19
Nodes (10): AppShellProps, navItems, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+2 more)

### Community 47 - "Community 47"
Cohesion: 0.36
Nodes (7): buildBugReportPrompt(), buildCodeReviewPrompt(), formatOptionalField(), modeLabels, truncateContent(), BugReportInput, TestCaseInput

### Community 48 - "Community 48"
Cohesion: 0.36
Nodes (9): buildMissingInformation(), buildTestCases(), generateStaticBugReport(), includesAny(), inferSeverity(), priorityFromSeverity(), sentenceFrom(), splitSteps() (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.19
Nodes (8): AzurePrImportPanelProps, AzurePullRequestStatus, AzureStatusResponse, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (5): normalizeAzurePullRequestId(), GET(), getAzureDevOpsErrorResponse(), isTokenExpired(), jsonError()

### Community 51 - "Community 51"
Cohesion: 0.53
Nodes (4): ThemeToggle(), Tooltip(), TooltipContent(), TooltipTrigger()

### Community 52 - "Community 52"
Cohesion: 0.27
Nodes (13): getInstalledOllamaModels(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeOllamaUrl(), readErrorBody(), runOllamaBugReport(), runOllamaCodeReview() (+5 more)

### Community 53 - "Community 53"
Cohesion: 0.21
Nodes (10): isModelInstalled(), isSameOllamaModel(), normalizeOllamaModelName(), useOllamaLocalSettings(), metadata, getStatusClassName(), ModuleModelCard(), ModuleModelCardProps (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

## Knowledge Gaps
- **101 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `handler`, `metadata` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `GPU Ollama Deployment` to `Community 33`, `Community 35`, `Community 36`, `Community 37`, `runOllamaCodeReview`, `Community 38`, `Community 41`, `Community 46`, `Community 49`, `Community 18`, `Community 51`, `Community 54`, `useIsMobile`, `combineGeneratedDiffs`?**
  _High betweenness centrality (0.278) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 41` to `GPU Ollama Deployment`, `Community 33`, `Community 35`, `runOllamaCodeReview`, `Community 36`, `Community 38`, `Community 46`, `Community 49`, `Community 18`, `Community 51`, `Community 53`, `useIsMobile`, `Community 25`, `combineGeneratedDiffs`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 41` to `GPU Ollama Deployment`, `Community 35`, `Community 36`, `Community 38`, `Community 46`, `Community 49`, `Community 18`, `Community 53`, `Community 25`, `combineGeneratedDiffs`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `runOllamaCodeReview` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `testOllamaConnection` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._