const fs = require('fs');
let content = fs.readFileSync('src/routes/(app)/startups/[id]/readiness-level/+page.svelte', 'utf-8');

// 1. Change readiness_type to readinessType
content = content.replace(/readiness_type/g, 'readinessType');

// 2. Change h-0 to flex-1 in rated() snippet
content = content.replace('<div class="flex h-0 flex-col">', '<div class="flex flex-1 flex-col">');

// 3. Update the {:else} block for unrated startups
const target = `  {:else}
    <div class="mt-10 text-center text-2xl font-bold">
      {#if isMentor(role)}
        <p>You haven't rated this startup yet...</p>
      {:else}
        <p>Looks like you haven't been rated yet...</p>
      {/if}
    </div>
  {/if}`;

const replacement = `  {:else}
    {#if isMentor(role)}
      {@render mentor()}
    {:else}
      <div class="mt-10 text-center text-2xl font-bold">
        <p>Looks like you haven't been rated yet...</p>
      </div>
    {/if}
  {/if}`;
content = content.replace(target, replacement);

// 4. Append mentor() snippet
const mentorSnippet = `
{#snippet mentor()}
  <div class="flex h-full flex-col gap-3">
    <Stepper {current} />
    <div class="flex h-full flex-col overflow-scroll">
      <form method="post" bind:this={form} class="flex flex-1 flex-col">
        <Rubric
          questionnaires={rubrics().technology}
          step={1}
          {current}
          type={'technology'}
        />
        <Rubric
          questionnaires={rubrics().acceptance}
          step={2}
          {current}
          type={'acceptance'}
        />
        <Rubric
          questionnaires={rubrics().market}
          step={3}
          {current}
          type={'market'}
        />
        <Rubric
          questionnaires={rubrics().regulatory}
          step={4}
          {current}
          type={'regulatory'}
        />
        <Rubric
          questionnaires={rubrics().organizational}
          step={5}
          {current}
          type={'organizational'}
        />
        <Rubric
          questionnaires={rubrics().investment}
          step={6}
          {current}
          type={'investment'}
        />
      </form>
    </div>
    <div class="ml-auto flex gap-2">
      <Button variant="secondary" onclick={previous} disabled={current === 0}>Previous</Button>
      {#if current === 5}
        <Button onclick={() => form.submit()}>Submit</Button>
      {:else}
        <Button onclick={next} disabled={current === 6}>Next</Button>
      {/if}
    </div>
  </div>
{/snippet}
`;

content += mentorSnippet;

fs.writeFileSync('src/routes/(app)/startups/[id]/readiness-level/+page.svelte', content);
console.log('Fixed');
