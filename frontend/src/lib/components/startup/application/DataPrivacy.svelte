<script lang="ts">
  import { Label } from '$lib/components/ui/label';
  import { ShieldCheck } from 'lucide-svelte';
  export let dataPrivacy: boolean, toggleDataPrivacy: Function;
  export let stepName: string;
  export let currentStep: string;
</script>

<div class="flex-1 overflow-auto px-1" class:hidden={currentStep !== stepName}>
  <div class="flex flex-col gap-5">
    <!-- Data privacy & consent card -->
    <div class="rounded-2xl border border-slate-200/60 bg-white/40 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div class="flex items-center gap-2.5 mb-3">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1]/10 dark:bg-[#6366f1]/20">
          <ShieldCheck class="h-4 w-4 text-[#6366f1]" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Data privacy & consent</h4>
          <p class="text-xs text-slate-500 dark:text-white/50">Please read and agree to the following before proceeding.</p>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200/50 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-white/60 max-h-40 overflow-y-auto">
        By proceeding, you agree to the collection and processing of your startup's data for the
        purposes of the LaunchUp incubation evaluation program. Your information will be stored
        securely and shared only with assigned mentors and incubation managers within the program.
        In compliance with the Data Privacy Act (DPA) of 2012 (Republic Act 10173), I agree and
        authorize the Development and Acceleration Support for Innovation Growth (DASIG)
        consortium members to use the personal information for the purpose of LaunchUp programs
        and initiatives. I also acknowledge and warrant that I have acquired the consent from all
        parties relevant to this consent and hold free and harmless and indemnify DASIG from any
        complaint, suit, or damages which any party may file or claim in relation to my consent.
      </div>
      <label class="mt-4 flex items-center gap-3 cursor-pointer group">
        <input type="hidden" name="data_privacy" value={`${dataPrivacy}`} />
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200
            {dataPrivacy
              ? 'border-[#6366f1] bg-[#6366f1] text-white'
              : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}"
          on:click|preventDefault={() => toggleDataPrivacy(!dataPrivacy)}
        >
          {#if dataPrivacy}
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        <span class="text-sm font-medium text-slate-700 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          I agree to the data privacy and consent form
        </span>
      </label>
    </div>

    <!-- Eligibility card is separate, shown together in consent step -->
  </div>
</div>
