<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms';
  import { toast } from 'svelte-sonner';
  import { goto } from '$app/navigation';

  // export let data: PageData;
  let { data }: { data: PageData } = $props();
  let isLoading = false;

  // async function onSubmit() {
  //   isLoading = true;

  //   setTimeout(() => {
  //     isLoading = false;
  //   }, 3000);
  // }

  const { form, errors, enhance, message, submitting } = superForm(data.form);

  function getPasswordStrength(password: string) {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    return Math.min(score, 4);
  }

  const passwordStrength = $derived(getPasswordStrength($form.password ?? ''));

  $effect(() => {
    if ($submitting) {
      toast.dismiss();
      toast.info('Creating account...');
    }

    if ($message && !$submitting) {
      toast.dismiss();
      toast.success('Account created successfully');
      goto('/login');
    }

    if ($errors.repeatPassword && !$submitting) {
      toast.dismiss();
      toast.error('Signup failed', {
        description: $errors.repeatPassword.toString()
      });
    }
  });
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<div class="grid h-screen overflow-hidden lg:grid-cols-[0.96fr_1.04fr]">
  <div class="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.24),transparent_30%)]"></div>
    <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%,rgba(255,255,255,0.03))]"></div>
    <div class="relative z-10 flex items-center justify-between px-10 py-8 text-white/90">
      <a href="/" class="text-xl font-black tracking-tight">LaunchUp</a>
      <div class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur">
        Build a stronger first signal
      </div>
    </div>
    <div class="relative z-10 flex flex-1 items-center px-10 pb-8">
      <div class="max-w-xl space-y-6 text-white">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Create your account</p>
        <h1 class="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
          A cleaner onboarding path starts here.
        </h1>
        <p class="text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
          The form is intentionally focused so startups can get in quickly, without feeling like they are battling the interface.
        </p>
        <div class="grid gap-4 pt-2 sm:grid-cols-3 sm:pt-4">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Signup</p>
            <p class="mt-2 text-lg font-semibold">Shorter path</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Password</p>
            <p class="mt-2 text-lg font-semibold">Strength meter</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p class="text-sm text-white/55">Friction</p>
            <p class="mt-2 text-lg font-semibold">Minimized</p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-8 right-8 w-[22rem]">
      <img src="register.svg" alt="" class="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.28)]" />
    </div>
  </div>

  <div class="relative flex h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_36%),linear-gradient(to_bottom,#ffffff,#f7f9ff)] px-6 py-6 dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_36%),linear-gradient(to_bottom,#020617,#050816)]">
    <div class="absolute left-6 top-6 lg:hidden">
      <a href="/" class="text-xl font-black tracking-tight">LaunchUp</a>
    </div>
    <form
      method="post"
      class="w-full max-w-[32rem] rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_26px_80px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:p-8"
      use:enhance
    >
      <div class="space-y-2 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#6366f1]">Register</p>
        <h1 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Create your account</h1>
        <p class="text-balance text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
          Use your best startup details. You can refine everything after sign in.
        </p>
      </div>
      <div class="mt-6 grid gap-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2.5">
            <Label for="firstName">First name</Label>
            <Input
              name="firstName"
              id="firstName"
              type="text"
              required
              placeholder="John"
              bind:value={$form.firstName}
              class="h-10 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div class="grid gap-2.5">
            <Label for="lastName">Last name</Label>
            <Input
              name="lastName"
              id="lastName"
              type="text"
              required
              bind:value={$form.lastName}
              placeholder="Doe"
              class="h-10 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>
        <div class="grid gap-2.5">
          <Label for="email">Email</Label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="johndoe@example.com"
            required
            bind:value={$form.email}
            class="h-10 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
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
            class="h-10 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
          />
          <div class="grid grid-cols-4 gap-2 pt-0.5" aria-hidden="true">
            {#each Array(4) as _, segment}
              <span
                class={`h-1.5 rounded-full transition-colors duration-200 ${
                  segment < passwordStrength
                    ? passwordStrength >= 4
                      ? 'bg-emerald-500'
                      : passwordStrength >= 3
                        ? 'bg-sky-500'
                        : passwordStrength >= 2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              ></span>
            {/each}
          </div>
        </div>
        <div class="grid gap-2.5">
          <Label for="repeatPassword">Repeat password</Label>
          <Input
            name="repeatPassword"
            id="repeatPassword"
            type="password"
            required
            bind:value={$form.repeatPassword}
            class="h-11 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <Button
          type="submit"
          class="h-11 w-full rounded-full bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={$submitting}
        >
          Create account
        </Button>
      </div>
      <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?
        <a href="/login" class="font-semibold text-[#4f46e5] underline-offset-4 hover:underline">Login</a>
      </div>
    </form>
  </div>
</div>
