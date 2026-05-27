<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  export let stepName: string;
  export let currentStep: string;
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Upload, FileText, Loader } from 'lucide-svelte';

  let files: any;
  export let access: string;
  export let startup: any = null;
  let processing = false;
  let information: {
    title: string;
    startup_description: string;
    problem_statement: string;
    target_market: string;
    solution_description: string;
    objectives: string;
    scope: string;
    methodology: string;
  };

  let formData = {
    name: startup?.name ?? '',
    links: startup?.links ?? ''
  };

  // Initialize information with existing capsule proposal data if available
  $: if (startup?.capsuleProposal && !files) {
    information = {
      title: startup.capsuleProposal.title || '',
      startup_description: startup.capsuleProposal.description || '',
      problem_statement: startup.capsuleProposal.problemStatement || '',
      target_market: startup.capsuleProposal.targetMarket || '',
      solution_description: startup.capsuleProposal.solutionDescription || '',
      objectives: startup.capsuleProposal.objectives || '',
      scope: startup.capsuleProposal.scope || '',
      methodology: startup.capsuleProposal.methodology || ''
    };
  }

  async function getInformation() {
    processing = true;
    if (!files || !files[0]) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('capsuleProposal', files[0]);

    const response = await fetch(
      `${PUBLIC_API_URL}/startups/parse-capsule-proposal`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (response.ok) {
      information = data;
    }

    processing = false;
  }

  $: if (files) {
    getInformation();
  }
</script>

<div class="flex-1 overflow-auto px-1" class:hidden={currentStep !== stepName}>
  <div class="flex h-0 flex-col gap-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="grid gap-2">
        <Label for="startup_name" class="text-sm font-semibold text-slate-700 dark:text-white/70">Startup name <span class="text-red-500">*</span></Label>
        <Input
          name="startup_name"
          id="startup_name"
          type="text"
          placeholder="e.g. GreenPath Technologies"
          required
          bind:value={formData.name}
          class="h-11 rounded-xl border-slate-200/70 bg-white/70 backdrop-blur focus-visible:ring-2 focus-visible:ring-[#6366f1] dark:border-white/10 dark:bg-white/5"
        />
      </div>
      <div class="grid gap-2">
        <Label for="links" class="text-sm font-semibold text-slate-700 dark:text-white/70">Supporting links <span class="text-slate-400">(optional)</span></Label>
        <Input
          name="links"
          id="links"
          type="text"
          placeholder="e.g. GitHub, demo, pitch deck URL"
          bind:value={formData.links}
          class="h-11 rounded-xl border-slate-200/70 bg-white/70 backdrop-blur focus-visible:ring-2 focus-visible:ring-[#6366f1] dark:border-white/10 dark:bg-white/5"
        />
      </div>
    </div>

    <div class="grid gap-2">
      <Label class="text-sm font-semibold text-slate-700 dark:text-white/70">Capsule proposal <span class="text-red-500">*</span></Label>
      <p class="text-xs text-slate-500 dark:text-white/40">Upload a typed PDF or an image of a handwritten/annotated canvas document.</p>
      <label
        for="capsuleProposal"
        class="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/70 bg-slate-50/40 transition-all duration-200 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#6366f1]/30"
      >
        {#if files}
          {#if processing}
            <div class="flex flex-col items-center justify-center gap-2">
              <Loader class="h-6 w-6 animate-spin text-[#6366f1]" />
              <span class="text-sm font-medium text-slate-600 dark:text-white/60">Processing your capsule proposal...</span>
            </div>
          {:else}
            <div class="flex flex-col items-center gap-2">
              <FileText class="h-6 w-6 text-[#6366f1]" />
              <span class="text-sm font-medium text-slate-700 dark:text-white/70">{files[0].name}</span>
              <span class="text-xs text-emerald-600 dark:text-emerald-400">✓ Processed successfully</span>
            </div>
          {/if}
        {:else if startup?.capsuleProposal?.fileName}
          <div class="flex flex-col items-center justify-center gap-2">
            <FileText class="h-6 w-6 text-[#6366f1]" />
            <span class="text-sm font-medium text-slate-700 dark:text-white/70">{startup.capsuleProposal.fileName}</span>
          </div>
        {:else}
          <Upload class="h-6 w-6 text-slate-400 dark:text-white/30 mb-2" />
          <span class="text-sm font-medium text-slate-600 dark:text-white/50">Click to upload or drag and drop</span>
          <span class="text-xs text-slate-400 dark:text-white/30">PDF or image (JPG, PNG) up to 10MB</span>
        {/if}
      </label>
      <input
        id="capsuleProposal"
        name="capsuleProposal"
        class="hidden"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        bind:files
      />
    </div>
    {#if information}
      <input type="hidden" name="title" value={information.title} />
      <input type="hidden" name="startupDescription" value={information.startup_description} />
      <input type="hidden" name="problemStatement" value={information.problem_statement} />
      <input type="hidden" name="targetMarket" value={information.target_market} />
      <input type="hidden" name="solutionDescription" value={information.solution_description} />
      <input type="hidden" name="objectives" value={information.objectives} />
      <input type="hidden" name="scope" value={information.scope} />
      <input type="hidden" name="methodology" value={information.methodology} />
    {/if}
  </div>
</div>
