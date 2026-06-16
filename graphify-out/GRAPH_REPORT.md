# Graph Report - ai-review-copilot  (2026-06-16)

## Corpus Check
- 113 files · ~50,026 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 662 nodes · 1629 edges · 53 communities (45 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d58568c`
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
- [[_COMMUNITY_Community 26|Community 26]]
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
- [[_COMMUNITY_Community 56|Community 56]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 157 edges
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

## Communities (53 total, 8 thin omitted)

### Community 0 - "Ollama Runtime Config"
Cohesion: 0.33
Nodes (6): NVIDIA GPU Reservation, GPU Ollama Service, Ollama API Port 11434, ollama_data Volume, OLLAMA_ORIGINS, Ollama Service

### Community 1 - "GPU Ollama Deployment"
Cohesion: 0.12
Nodes (16): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 2 - "normalizeOllamaUrl"
Cohesion: 0.05
Nodes (71): extractJsonObject(), getInstalledOllamaModels(), getOllamaEndpoint(), getReadableError(), mapOllamaModels(), normalizeBugReportResult(), normalizeFalsePositiveCheck(), normalizeFinding() (+63 more)

### Community 3 - "runOllamaBugReport"
Cohesion: 0.14
Nodes (15): getOllamaSettingsForModule(), loadOllamaLocalSettings(), normalizeSettings(), useOllamaModuleSettings(), AI_MODULES, DEFAULT_OLLAMA_LOCAL_SETTINGS, DEFAULT_OLLAMA_MODULE_MODELS, OLLAMA_MODEL_PRESETS (+7 more)

### Community 4 - "runOllamaCodeReview"
Cohesion: 0.09
Nodes (24): initialsFromName(), UserMenu(), themeOptions, ThemeToggle(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup() (+16 more)

### Community 5 - "testOllamaConnection"
Cohesion: 0.17
Nodes (6): AzureConnectionRow, AzureSelectionRow, adapter, globalForPrisma, handler, authOptions

### Community 6 - "buildBugReportPrompt"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 8 - "RootLayout"
Cohesion: 0.10
Nodes (9): OllamaSettingsCard(), metadata, ConfigSelectProps, examples, priorityClassName, ResultsPanelProps, TestCasesWorkspace(), testTypes (+1 more)

### Community 9 - "BugReportPage"
Cohesion: 0.10
Nodes (34): addUniqueWarning(), AzureDevOpsChangesApiItem, AzureDevOpsChangesApiResponse, AzureDevOpsItemContentResponse, AzureDevOpsIterationsApiItem, AzureDevOpsListApiResponse, AzureDevOpsProjectApiItem, AzureDevOpsPullRequestApiItem (+26 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (14): AppShellProps, navItems, iconSizes, Logo(), LogoProps, textSizes, Sheet(), SheetContent() (+6 more)

### Community 24 - "useIsMobile"
Cohesion: 0.09
Nodes (39): useIsMobile(), cn(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AlertAction(), CardAction() (+31 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (10): useOllamaLocalSettings(), metadata, OptimizedOllamaModelsSettings(), AzureDevOpsCard(), ConnectedAccountsSettings(), ConnectionTestResult, formatDate(), formatStatus() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (10): AzurePrImportPanelProps, AzurePullRequest, AzurePullRequestsResponse, AzurePullRequestStatus, AzureStatusResponse, Alert(), AlertDescription(), AlertTitle() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (16): getAzureDevOpsErrorResponse(), getOrganizationFromRequest(), jsonError(), POST(), AzureDevOpsRequestError, fetchAzureProjects(), GET(), getAzureDevOpsErrorResponse() (+8 more)

### Community 33 - "Community 33"
Cohesion: 0.21
Nodes (10): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.26
Nodes (11): buildReviewInput(), fetchAzureDevOpsJson(), fetchAzureDevOpsList(), fetchAzurePullRequestReviewContext(), getChangedFilesSummary(), getChangesArray(), normalizeAzurePullRequestId(), normalizeBranchName() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.26
Nodes (11): ConnectionState, OllamaSettingsCardProps, recommendedModels, Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel() (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (16): sampleNewFiles, sampleOldFiles, sampleReviewDiff, combineGeneratedDiffs(), countChangedLines(), createDiffId(), createGeneratedFileDiff(), fallbackMatchKey() (+8 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (5): HoverCardContent(), Progress(), ScrollArea(), ScrollBar(), Switch()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (10): isModelInstalled(), isSameOllamaModel(), getStatusClassName(), ModuleModelCard(), ModuleModelCardProps, Card(), CardContent(), CardDescription() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.26
Nodes (17): fetchAzureFileContent(), fetchAzurePullRequests(), fetchAzureRepositories(), normalizeAzureOrganization(), normalizeAzureProject(), normalizeAzurePullRequestStatus(), normalizeAzureRepositoryId(), GET() (+9 more)

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (11): metadata, BugReportResultPanel, providerOptions, ReviewResultPanel, ReviewWorkspace(), ReviewWorkspaceProps, BugReportForm(), CodeReviewForm() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (8): geistMono, geistSans, metadata, sora, AuthGate(), AuthSessionProvider(), ThemeProvider(), TooltipProvider()

### Community 45 - "Community 45"
Cohesion: 0.43
Nodes (6): getAzureStatusForUser(), getIsoFromUnixSeconds(), isTokenExpired(), normalizeAzureConnectionStatus(), GET(), AzureIntegrationStatus

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (15): sampleNewFileContent, sampleOldFileContent, AzurePrImportPanel(), CodeReviewFormProps, DiffSource, focusOptions, InputSource, OutputStyle (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (10): acceptedFiles, FileDropzone(), MultiFileDiffBuilderProps, statusClassName, ReviewFileVersion, Tabs(), TabsContent(), TabsList() (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.36
Nodes (7): addTextFinding(), lineNumberFor(), riskFromFindings(), runStaticHeuristics(), ScanTarget, ReviewFinding, ReviewResult

### Community 49 - "Community 49"
Cohesion: 0.06
Nodes (38): actionCards, LoginScreen(), AppShell(), sampleBugReport, GuideBadge, UserGuideSection, userGuideSections, acceptedAttachments (+30 more)

### Community 50 - "Community 50"
Cohesion: 0.50
Nodes (4): config, proxy(), redirectToSignIn(), sessionCookieNames

### Community 51 - "Community 51"
Cohesion: 0.83
Nodes (3): fetchAzureApi(), getErrorCode(), readJsonPayload()

### Community 56 - "Community 56"
Cohesion: 0.20
Nodes (6): confidenceClassName, ReviewResultPanel(), ReviewResultPanelProps, riskClassName, severityClassName, reviewResultToMarkdown()

## Knowledge Gaps
- **110 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `handler`, `AzureConnectionRow` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `useIsMobile` to `GPU Ollama Deployment`, `Community 33`, `Community 35`, `runOllamaCodeReview`, `Community 37`, `Community 38`, `buildBugReportPrompt`, `Community 40`, `RootLayout`, `Community 46`, `Community 47`, `Community 49`, `Community 18`, `Community 26`?**
  _High betweenness centrality (0.279) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 49` to `GPU Ollama Deployment`, `normalizeOllamaUrl`, `Community 35`, `runOllamaBugReport`, `runOllamaCodeReview`, `Community 38`, `Community 33`, `RootLayout`, `Community 46`, `Community 47`, `Community 18`, `Community 56`, `Community 25`, `Community 26`, `useIsMobile`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 49` to `normalizeOllamaUrl`, `runOllamaBugReport`, `Community 35`, `Community 38`, `RootLayout`, `Community 41`, `Community 46`, `Community 47`, `Community 18`, `Community 56`, `Community 25`, `Community 26`, `useIsMobile`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GPU Ollama Deployment` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `normalizeOllamaUrl` be split into smaller, more focused modules?**
  _Cohesion score 0.05450165612767239 - nodes in this community are weakly interconnected._
- **Should `runOllamaBugReport` be split into smaller, more focused modules?**
  _Cohesion score 0.14210526315789473 - nodes in this community are weakly interconnected._