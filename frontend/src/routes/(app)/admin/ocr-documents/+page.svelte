<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { PUBLIC_API_URL } from '$env/static/public';

  export let data: { ocrs: any[]; access: string };
  let ocrs = data.ocrs ?? [];
  let toggling = false;

  // filtering & pagination
  let filter = '';
  let page = 1;
  const perPage = 12;

  $: filtered = ocrs.filter(o => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (String(o.originalFilename || '').toLowerCase().includes(f) || String(o.extractedText || '').toLowerCase().includes(f));
  });

  $: totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  $: pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // preview modal
  let previewOpen = false;
  let previewUrl: string | null = null;

  function openPreview(url: string) {
    previewUrl = url;
    previewOpen = true;
  }

  async function toggleSketch(doc: any) {
    toggling = true;
    try {
      const res = await fetch(`${PUBLIC_API_URL}/admin/ocr-documents/flag/${doc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.access}` },
        body: JSON.stringify({ sketchDetected: !doc.sketchDetected, note: 'Admin override' })
      });
      if (res.ok) {
        const updated = await res.json();
        ocrs = ocrs.map(o => (o.id === updated.id ? updated : o));
      }
    } catch (e) {
    } finally {
      toggling = false;
    }
  }

</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">OCR Documents</h1>
      <p class="mt-1 text-sm text-muted-foreground">Review recent OCR uploads and override sketch/legibility</p>
    </div>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-muted/30 border-b">
            <th class="px-6 py-3 text-left font-medium">ID</th>
            <th class="px-6 py-3 text-left font-medium">Filename</th>
            <th class="px-6 py-3 text-left font-medium">Sketch?</th>
            <th class="px-6 py-3 text-left font-medium">Sketch Confidence</th>
            <th class="px-6 py-3 text-left font-medium">Legibility</th>
            <th class="px-6 py-3 text-left font-medium">Dims</th>
            <th class="px-6 py-3 text-left font-medium">Extract (snippet)</th>
            <th class="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each pageItems as o}
            <tr class="hover:bg-muted/50 group border-b transition-colors">
              <td class="px-6 py-4 font-mono text-xs text-muted-foreground">{o.id}</td>
              <td class="px-6 py-4">{o.originalFilename}</td>
              <td class="px-6 py-4">{o.sketchDetected ? 'Yes' : 'No'}</td>
              <td class="px-6 py-4">{o.sketchConfidence ?? '-'}</td>
              <td class="px-6 py-4">{o.legibilityStatus}</td>
              <td class="px-6 py-4">{o.imageWidth ?? '-'}x{o.imageHeight ?? '-'}</td>
              <td class="px-6 py-4">{(o.extractedText || '').slice(0,120)}</td>
              <td class="px-6 py-4 text-right">
                <Button on:click={() => toggleSketch(o)} disabled={toggling}>{toggling ? 'Updating...' : (o.sketchDetected ? 'Unmark' : 'Mark Sketch')}</Button>
                {#if o.sourcePath}
                  <a class="ml-2 text-sm text-flutter-blue" href={o.sourcePath} target="_blank">Open</a>
                  <button class="ml-2 text-sm text-flutter-blue" on:click={() => openPreview(o.sourcePath)}>Preview</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <div class="mt-3">
      <input placeholder="Filter filename or text" bind:value={filter} class="px-2 py-1 border rounded" />
    </div>
    <div class="mt-3">
      <button class="px-3 py-1 border rounded mr-2" on:click={() => { if (page>1) page -=1 }}>Prev</button>
      <span class="text-sm">Page {page} / {totalPages}</span>
      <button class="px-3 py-1 border rounded ml-2" on:click={() => { if (page<totalPages) page +=1 }}>Next</button>
    </div>
  </div>

  <Dialog.Root bind:open={previewOpen}>
    <Dialog.Content class="max-w-3xl">
      {#if previewUrl}
        <img src={previewUrl} alt="preview" class="max-w-full h-auto" />
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>
