# Graph Report - ai-review-copilot  (2026-06-16)

## Corpus Check
- 112 files · ~49,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 650 nodes · 1604 edges · 51 communities (42 shown, 9 thin omitted)
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
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
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroupCount()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ollama Docker Deployment Variants** — docker_docker_compose_gpu_ollama_service, docker_docker_compose_ollama_service, docker_docker_compose_gpu_nvidia_gpu_reservation [INFERRED 0.95]

## Communities (51 total, 9 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.12
Nodes (16): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.18
Nodes (20): extractJsonObject(), normalizeBugReportResult(), normalizeFalsePositiveCheck(), normalizeFinding(), normalizeGeneratedTestCase(), normalizePriority(), normalizeReproductionRate(), normalizeReviewResult() (+12 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.07
Nodes (30): getOllamaSettingsForModule(), loadOllamaLocalSettings(), normalizeSettings(), useOllamaLocalSettings(), useOllamaModuleSettings(), AI_MODULES, DEFAULT_OLLAMA_LOCAL_SETTINGS, DEFAULT_OLLAMA_MODULE_MODELS (+22 more)

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.11
Nodes (19): initialsFromName(), UserMenu(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+11 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.16
Nodes (8): adapter, globalForPrisma, handler, jsonError(), POST(), stringFromPayload(), authOptions, AzureSelectionResponse

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.30
Nodes (11): getAzureDevOpsErrorResponse(), getOrganizationFromRequest(), jsonError(), POST(), AzureDevOpsRequestError, fetchAzureProjects(), normalizeAzureOrganization(), GET() (+3 more)

### Community 8 - "RootLayout"
Cohesion: 0.15
Nodes (12): BugReportResultPanelProps, priorityClassName, severityClassName, BugPriority, BugReportResult, BugSeverity, OllamaModel, OllamaSettings (+4 more)

### Community 9 - "BugReportPage"
Cohesion: 0.10
Nodes (35): addUniqueWarning(), AzureDevOpsChangesApiItem, AzureDevOpsChangesApiResponse, AzureDevOpsItemContentResponse, AzureDevOpsIterationsApiItem, AzureDevOpsListApiResponse, AzureDevOpsProjectApiItem, AzureDevOpsPullRequestApiItem (+27 more)

### Community 24 - "useIsMobile"
Cohesion: 0.08
Nodes (29): useIsMobile(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction() (+21 more)

### Community 25 - "Community 25"
Cohesion: 0.19
Nodes (12): getAzureStatusForUser(), getIsoFromUnixSeconds(), isTokenExpired(), normalizeAzureConnectionStatus(), GET(), AzureIntegrationStatus, AzureProject, AzureProjectsResponse (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.73
Nodes (5): fetchAzureRepositories(), normalizeAzureProject(), GET(), getAzureDevOpsErrorResponse(), jsonError()

### Community 33 - "Community 33"
Cohesion: 0.28
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (6): fetchAzurePullRequests(), normalizeAzurePullRequestStatus(), normalizeAzureRepositoryId(), GET(), getAzureDevOpsErrorResponse(), jsonError()

### Community 35 - "Community 35"
Cohesion: 0.05
Nodes (53): fetchAzureApi(), getErrorCode(), readJsonPayload(), sampleBugReport, ConnectionState, OllamaSettingsCardProps, recommendedModels, ModuleModelCardProps (+45 more)

### Community 36 - "Community 36"
Cohesion: 0.06
Nodes (42): sampleNewFileContent, sampleNewFiles, sampleOldFileContent, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs(), countChangedLines(), createDiffId() (+34 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (21): cn(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), Breadcrumb(), BreadcrumbEllipsis() (+13 more)

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (4): config, proxy(), redirectToSignIn(), sessionCookieNames

### Community 40 - "Community 40"
Cohesion: 0.23
Nodes (8): BugReportResultPanel(), GeneratedTestCase, TestCaseResult, bugReportResultToMarkdown(), formatList(), formatNumberedList(), severityLabel, testCaseToMarkdown()

### Community 41 - "Community 41"
Cohesion: 0.05
Nodes (37): actionCards, LoginScreen(), GuideBadge, UserGuideSection, userGuideSections, acceptedAttachments, BugAttachmentUploader(), BugAttachmentUploaderProps (+29 more)

### Community 44 - "Community 44"
Cohesion: 0.21
Nodes (7): geistMono, geistSans, metadata, AuthGate(), AuthSessionProvider(), ThemeProvider(), TooltipProvider()

### Community 45 - "Community 45"
Cohesion: 0.36
Nodes (7): addTextFinding(), lineNumberFor(), riskFromFindings(), runStaticHeuristics(), ScanTarget, ReviewFinding, ReviewResult

### Community 46 - "Community 46"
Cohesion: 0.14
Nodes (14): AppShellProps, navItems, ThemeToggle(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+6 more)

### Community 47 - "Community 47"
Cohesion: 0.31
Nodes (8): buildBugReportPrompt(), buildTestCasesPrompt(), formatOptionalField(), modeLabels, truncateContent(), BugReportInput, ReviewInput, TestCaseInput

### Community 48 - "Community 48"
Cohesion: 0.42
Nodes (8): buildMissingInformation(), buildTestCases(), generateStaticBugReport(), includesAny(), inferSeverity(), priorityFromSeverity(), sentenceFrom(), splitSteps()

### Community 50 - "Community 50"
Cohesion: 0.26
Nodes (11): buildReviewInput(), fetchAzureDevOpsJson(), fetchAzureDevOpsList(), fetchAzurePullRequestReviewContext(), getChangedFilesSummary(), getChangesArray(), normalizeAzurePullRequestId(), normalizeBranchName() (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.30
Nodes (12): getInstalledOllamaModels(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeOllamaUrl(), readErrorBody(), runOllamaBugReport(), runOllamaCodeReview() (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (5): isModelInstalled(), isSameOllamaModel(), normalizeOllamaModelName(), getStatusClassName(), ModuleModelCard()

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

## Knowledge Gaps
- **101 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `handler`, `metadata` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 37` to `GPU Ollama Deployment`, `Community 33`, `Community 35`, `Community 36`, `runOllamaCodeReview`, `Community 41`, `Community 46`, `Community 18`, `Community 54`, `useIsMobile`?**
  _High betweenness centrality (0.279) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 41` to `GPU Ollama Deployment`, `Community 33`, `Community 35`, `runOllamaBugReport`, `runOllamaCodeReview`, `Community 36`, `Community 37`, `RootLayout`, `Community 46`, `useIsMobile`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 41` to `Community 35`, `runOllamaBugReport`, `Community 36`, `Community 37`, `RootLayout`, `Community 46`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `runOllamaBugReport` be split into smaller, more focused modules?**
  _Cohesion score 0.06765327695560254 - nodes in this community are weakly interconnected._
- **Should `runOllamaCodeReview` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._