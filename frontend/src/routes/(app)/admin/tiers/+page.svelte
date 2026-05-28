<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { PUBLIC_API_URL } from '$env/static/public';

  import { toast } from 'svelte-sonner';

  export let data: { tiers: any[]; access: string };
  // Store the string representation of weights for editing
  let tiers = (data.tiers ?? []).map(t => ({
    ...t,
    weightsStr: t.weights ? JSON.stringify(t.weights, null, 2) : ''
  }));
  let saving = false;
  let saveSuccess = false;

  function addTier() {
    tiers = [...tiers, { tierLabel: 'New', threshold: 0, weights: null, weightsStr: '' }];
  }

  function removeTier(i: number) {
    tiers = tiers.filter((_, idx) => idx !== i);
  }

  async function save() {
    saving = true;
    saveSuccess = false;
    try {
      const payload = tiers.map(t => {
        let w = null;
        if (t.weightsStr && t.weightsStr.trim().length > 0) {
          try {
            w = JSON.parse(t.weightsStr);
          } catch(e) {
            throw new Error(`Invalid JSON in weights for ${t.tierLabel}`);
          }
        }
        return { tierLabel: t.tierLabel, threshold: Number(t.threshold), weights: w };
      });

      const res = await fetch(`${PUBLIC_API_URL}/admin/tiers/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.access}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save');
      }
      
      saveSuccess = true;
      toast.success('Tier configs saved successfully!');
      setTimeout(() => { saveSuccess = false; }, 2000);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
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
      <Button onclick={addTier}>Add Tier</Button>
      <Button onclick={save} disabled={saving} class="relative w-24 overflow-hidden transition-all duration-300">
        {#if saving}
          <div class="absolute inset-0 flex items-center justify-center bg-primary">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
          </div>
        {:else if saveSuccess}
          <div class="absolute inset-0 flex items-center justify-center bg-green-500 text-white transition-transform duration-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        {:else}
          <span class="transition-opacity duration-300">Save</span>
        {/if}
      </Button>
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
              <td class="px-6 py-4"><Input bind:value={t.weightsStr} placeholder={`{"engagement":0.5}`} /></td>
              <td class="px-6 py-4 text-right">
                <button class="text-sm text-red-600" onclick={() => removeTier(i)}>Remove</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
