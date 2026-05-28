<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { PUBLIC_API_URL } from '$env/static/public';

  export let data: { audits: any[]; access: string };
  let audits = data.audits ?? [];
  let overridingId: number | null = null;
  let overrideValue: number | null = null;
  let overriding = false;

  async function overrideAudit(id: number) {
    if (overrideValue === null) return;
    overriding = true;
    try {
      const res = await fetch(`${PUBLIC_API_URL}/admin/ai/bias-audits/override/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.access}` },
        body: JSON.stringify({ correctedScore: overrideValue })
      });
      if (res.ok) {
        const updated = await res.json();
        audits = audits.map(a => (a.id === id ? updated : a));
        overridingId = null;
        overrideValue = null;
      }
    } catch (e) {
      // ignore
    } finally {
      overriding = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">AI Bias Audits</h1>
      <p class="mt-1 text-sm text-muted-foreground">Review and override AI bias audit corrections</p>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-muted/30 border-b">
            <th class="px-6 py-3 text-left font-medium">ID</th>
            <th class="px-6 py-3 text-left font-medium">Entity</th>
            <th class="px-6 py-3 text-left font-medium">Original</th>
            <th class="px-6 py-3 text-left font-medium">Corrected</th>
            <th class="px-6 py-3 text-left font-medium">Bias Flagged</th>
            <th class="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each audits as a}
            <tr class="hover:bg-muted/50 group border-b transition-colors">
              <td class="px-6 py-4 font-mono text-xs text-muted-foreground">{a.id}</td>
              <td class="px-6 py-4">{a.entityType}#{a.entityId}</td>
              <td class="px-6 py-4">{a.originalScore}</td>
              <td class="px-6 py-4">{a.correctedScore}</td>
              <td class="px-6 py-4">{a.biasFlagged ? 'Yes' : 'No'}</td>
              <td class="px-6 py-4 text-right">
                {#if overridingId === a.id}
                  <input type="number" bind:value={overrideValue} class="mr-2" />
                  <Button on:click={() => overrideAudit(a.id)} disabled={overriding}>{overriding ? 'Saving...' : 'Save'}</Button>
                {:else}
                  <Button on:click={() => { overridingId = a.id; overrideValue = a.correctedScore ?? a.originalScore; }}>Override</Button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
