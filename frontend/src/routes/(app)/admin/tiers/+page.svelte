<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { PUBLIC_API_URL } from '$env/static/public';

  export let data: { tiers: any[]; access: string };
  let tiers = data.tiers ?? [];
  let saving = false;
  let message: string | null = null;

  function addTier() {
    tiers = [...tiers, { tierLabel: 'New', threshold: 0, weights: null }];
  }

  function removeTier(i: number) {
    tiers = tiers.filter((_, idx) => idx !== i);
  }

  async function save() {
    saving = true;
    message = null;
    try {
      const res = await fetch(`${PUBLIC_API_URL}/admin/tiers/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.access}` },
        body: JSON.stringify(tiers)
      });
      if (!res.ok) {
        message = 'Failed to save';
      } else {
        message = 'Saved';
      }
    } catch (e) {
      message = 'Failed to save';
    } finally {
      saving = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Tier Configs</h1>
      <p class="mt-1 text-sm text-muted-foreground">Edit tier thresholds and optional weights</p>
    </div>
    <div class="flex gap-2">
      <Button on:click={addTier}>Add Tier</Button>
      <Button on:click={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-muted/30 border-b">
            <th class="px-6 py-3 text-left font-medium">Label</th>
            <th class="px-6 py-3 text-left font-medium">Threshold</th>
            <th class="px-6 py-3 text-left font-medium">Weights (JSON)</th>
            <th class="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each tiers as t, i}
            <tr class="hover:bg-muted/50 group border-b transition-colors">
              <td class="px-6 py-4"><Input bind:value={t.tierLabel} /></td>
              <td class="px-6 py-4"><Input type="number" bind:value={t.threshold} /></td>
              <td class="px-6 py-4"><Input bind:value={t.weights} placeholder='{"engagement":0.5}' /></td>
              <td class="px-6 py-4 text-right">
                <button class="text-sm text-red-600" on:click={() => removeTier(i)}>Remove</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  {#if message}
    <div class="text-sm text-muted-foreground">{message}</div>
  {/if}
</div>
