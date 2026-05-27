<script lang="ts">
  export let toggleEligibility: Function;
  export let eligibility: boolean;
  export let stepName: string;
  export let currentStep: string;
  import { ClipboardCheck } from 'lucide-svelte';
</script>

<div class="flex-1 overflow-auto px-1" class:hidden={currentStep !== stepName}>
  <div class="flex flex-col gap-5">
    <div class="rounded-2xl border border-slate-200/60 bg-white/40 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div class="flex items-center gap-2.5 mb-3">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1]/10 dark:bg-[#6366f1]/20">
          <ClipboardCheck class="h-4 w-4 text-[#6366f1]" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Eligibility & agreement</h4>
          <p class="text-xs text-slate-500 dark:text-white/50">Confirm your eligibility to participate in the program.</p>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200/50 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-white/60 max-h-40 overflow-y-auto">
        The applying startup must be an early-stage venture associated with a recognized university or
        incubation program. The team leader must be a registered user of the platform. I confirm that I
        have read, understood, and agree to comply with the eligibility criteria and rules of the program. I
        will review the eligibility requirements and agreement before proceeding.
      </div>
      <label class="mt-4 flex items-center gap-3 cursor-pointer group">
        <input type="hidden" name="eligibility" value={`${eligibility}`} />
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200
            {eligibility
              ? 'border-[#6366f1] bg-[#6366f1] text-white'
              : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}"
          on:click|preventDefault={() => toggleEligibility(!eligibility)}
        >
          {#if eligibility}
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        <span class="text-sm font-medium text-slate-700 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          I confirm eligibility and agree to program terms
        </span>
      </label>
    </div>
  </div>
</div>
