<script>
  import { flip } from 'svelte/animate';
  import { ArrowRight, Sparkles } from 'lucide-svelte';
  import Button from '../ui/button/button.svelte';
</script>

<div class="relative h-full w-full pt-10 md:pt-16">
  <div
    class="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82),transparent_70%),radial-gradient(#ecf3fc_1px,transparent_1px)] [background-size:auto,2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_100%_56%_at_50%_44%,#000_72%,transparent_110%)] dark:bg-[radial-gradient(circle_at_center,rgba(7,17,31,0.84),transparent_70%),radial-gradient(#17213a_1px,transparent_1px)]"
  ></div>

  <div
    class="mx-auto grid min-h-[calc(100vh-5rem)] w-[min(72rem,86vw)] items-center gap-16 py-10 lg:grid-cols-[1.15fr_0.85fr]"
    id="hero"
  >
    <div class="flex flex-col gap-7">
      <div class="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200">
        <Sparkles class="h-4 w-4 text-[#6366f1]" />
        Precision for founders who need clarity fast
      </div>
      <div class="space-y-5">
        <p class="max-w-3xl text-6xl font-black tracking-[-0.05em] sm:text-7xl lg:text-[5.5rem]">
          <span class="bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
            A better way to launch, judge, and grow serious startups.
          </span>
        </p>
        <p class="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
          LaunchUp gives founders a sharper application journey, a clearer readiness signal, and a calmer path from first impression to funding conversation.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <a data-sveltekit-reload href="/register">
          <Button class="group h-12 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 px-6 text-white shadow-[0_8px_30px_rgba(15,23,42,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-slate-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.35)] dark:from-white dark:to-slate-200 dark:text-slate-950 dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)]">
            Get Started
            <ArrowRight class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </a>
        <a data-sveltekit-reload href="/objectives">
          <Button variant="outline" class="h-12 rounded-full border-slate-200 bg-white/80 px-6 text-slate-800 shadow-sm backdrop-blur transition-all duration-200 hover:border-slate-400 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
            View objectives
          </Button>
        </a>
        <a href="#howitwork" class="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white/75 px-5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:border-[#6366f1]/30 hover:text-[#4f46e5] dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
          See the flow
        </a>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">AI grounded</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">Less noise</p>
        </div>
        <div class="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Readiness</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">Sharper signal</p>
        </div>
        <div class="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Outcome</p>
          <p class="mt-2 text-2xl font-black text-slate-950 dark:text-white">Better decisions</p>
        </div>
      </div>
    </div>
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_62%)] blur-3xl"></div>
      <div class="relative w-full max-w-[34rem] rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <div class="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#6366f1]/30 blur-[2.5rem] mix-blend-multiply dark:mix-blend-screen"></div>
        <div class="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#0ea5e9]/30 blur-[2.5rem] mix-blend-multiply dark:mix-blend-screen"></div>
        <img src="/startup.svg" alt="startup" class="relative z-10 w-full animate-fade drop-shadow-[0_24px_50px_rgba(15,23,42,0.12)]" />
      </div>
    </div>
  </div>
</div>
