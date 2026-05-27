<script lang="ts">
  export let stepName: string;
  export let currentStep: string;
  export let question: any[];
  export let startup: any = null;
  import { Label } from '$lib/components/ui/label/index.js';
  import { Textarea } from '$lib/components/ui/textarea';

  $: organizationalAnswers =
    startup?.uratQuestionAnswers
      ?.filter((answer: any) => answer.uratQuestion.readinessType === 'Organizational')
      ?.sort((a: any, b: any) => a.uratQuestion.id - b.uratQuestion.id) ?? [];
</script>

<div class="flex-1 overflow-auto px-1" class:hidden={currentStep !== stepName}>
  <div class="flex flex-col gap-5">
    <div class="rounded-xl border border-slate-200/50 bg-[#6366f1]/5 px-4 py-2.5 dark:border-[#6366f1]/20 dark:bg-[#6366f1]/10">
      <span class="text-xs font-bold uppercase tracking-wider text-[#6366f1]">Organizational Readiness Level</span>
    </div>
    {#each question as q, i}
      <div class="grid w-full gap-2 rounded-xl border border-slate-200/50 bg-white/40 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <Label for="org_{i}" class="text-sm font-semibold text-slate-700 dark:text-white/80">{i + 1}. {q.question}</Label>
        <Textarea
          placeholder="Enter your answer here..."
          id="org_{i}"
          name={`organizational${i}`}
          value={organizationalAnswers[i]?.response ?? ''}
          class="min-h-[80px] rounded-xl border-slate-200/70 bg-white/70 resize-none focus-visible:ring-2 focus-visible:ring-[#6366f1] dark:border-white/10 dark:bg-white/5"
        />
        <span class="text-right text-[11px] text-slate-400 dark:text-white/30">{(organizationalAnswers[i]?.response ?? '').length} characters</span>
        <input type="hidden" name={`organizational${i}id`} value={`${q.id}`} />
        {#if organizationalAnswers[i]?.id}
          <input type="hidden" name={`organizational${i}answerId`} value={`${organizationalAnswers[i].id}`} />
        {/if}
      </div>
    {/each}
  </div>
</div>
