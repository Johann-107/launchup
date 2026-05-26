<script lang="ts">
  import type { PageData } from './$types';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { superForm } from 'sveltekit-superforms';
  import { toast } from 'svelte-sonner';
  import { Loader } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  const { form, errors, enhance, submitting } = superForm(data.form);

  $effect(() => {
    if ($errors.email && !$submitting) {
      toast.dismiss();
      toast.error('Login failed');
    }
  });
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
  <div class="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.2),transparent_30%)]"></div>
    <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,255,255,0.03))]"></div>
    <div class="relative z-10 flex items-center justify-between px-10 py-8 text-white/90">
      <a href="/" class="text-xl font-black tracking-tight">LaunchUp</a>
      <div class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur">
        Focused access for founders
      </div>
    </div>
    <div class="relative z-10 flex flex-1 items-center px-10 pb-10">
      <div class="max-w-xl space-y-6 text-white">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Welcome back</p>
        <h1 class="text-5xl font-black tracking-[-0.05em] text-white">
          Sign in to resume your startup journey.
        </h1>
        <p class="text-lg leading-8 text-white/72">
          Everything here is tuned for speed, clarity, and a cleaner signal when it matters most.
        </p>
        <div class="grid gap-4 pt-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Access</p>
            <p class="mt-2 text-lg font-semibold">Fast login</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Signal</p>
            <p class="mt-2 text-lg font-semibold">Clear status</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Flow</p>
            <p class="mt-2 text-lg font-semibold">Less friction</p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-10 right-10 w-[24rem]">
      <img src="loginv2.svg" alt="" class="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.28)]" />
    </div>
  </div>

  <div class="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_36%),linear-gradient(to_bottom,#ffffff,#f7f9ff)] px-6 py-10 dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_36%),linear-gradient(to_bottom,#020617,#050816)]">
    <div class="absolute left-6 top-6 lg:hidden">
      <a href="/" class="text-xl font-black tracking-tight">LaunchUp</a>
    </div>
    <form
      method="post"
      use:enhance
      class="w-full max-w-md rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_26px_80px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:p-10"
    >
      <div class="space-y-3 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#6366f1]">Login</p>
        <h1 class="text-4xl font-black tracking-tight text-slate-950 dark:text-white">Welcome back</h1>
        <p class="text-balance text-base leading-7 text-slate-600 dark:text-slate-300">
          Enter your email and password to continue.
        </p>
      </div>
      <div class="mt-8 grid gap-5">
        <div class="grid gap-2.5">
          <Label for="email">Email</Label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            bind:value={$form.email}
            class="h-11 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <div class="grid gap-2.5">
          <Label for="password">Password</Label>
          <Input
            name="password"
            id="password"
            type="password"
            required
            bind:value={$form.password}
            class="h-11 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
          />
        </div>
        {#if $errors.email}
          <p class="text-sm font-medium text-rose-500">Invalid credentials</p>
        {/if}
        <Button
          type="submit"
          class="h-12 w-full rounded-full bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={$submitting}
        >
          {#if $submitting}
            <Loader class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          Login
        </Button>
      </div>
      <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?
        <a href="/register" class="font-semibold text-[#4f46e5] underline-offset-4 hover:underline">Sign up</a>
      </div>
    </form>
  </div>
</div>
