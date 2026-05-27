<script lang="ts">
  export let label: string;
  export let active: boolean = false;
  export let onclick: () => void;
  export let rounded: 'left' | 'right' | 'none' = 'none'; // kept for backward compatibility if needed elsewhere
  export let className: string = '';
</script>

<button
  class={`px-4 py-1.5 text-xs font-semibold focus:outline-none transition-all duration-300 rounded-xl
    ${active ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}
    ${className}
  `}
  on:click={onclick}
>
  {label}
</button>
