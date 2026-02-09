<script lang="ts">
  import SidebarSection from './SidebarSection.svelte';
  import { brainstormStore } from '../stores';
  // import type { Thought } from '../types'; 

  let expandedIndices = new Set<number>();

  function toggleExpand(index: number) {
      if (expandedIndices.has(index)) {
          expandedIndices.delete(index);
      } else {
          expandedIndices.add(index);
      }
      expandedIndices = expandedIndices; // trigger reactivity
  }
</script>

<SidebarSection title="最近灵感">
    <div class="thought-history">
        <p class="history-hint">最近录入的灵感：</p>
        
        {#if $brainstormStore.thoughts.length === 0}
            <div class="empty-state">尚未录入灵感</div>
        {/if}

        {#each $brainstormStore.thoughts as thought, i}
             <!-- svelte-ignore a11y-click-events-have-key-events -->
             <!-- svelte-ignore a11y-no-static-element-interactions -->
             <div 
                class="thought-item" 
                class:expanded={expandedIndices.has(i)}
                on:click={() => toggleExpand(i)}
             >
                <div class="original-text">
                    <span>{thought.original || thought.summary || '未命名'}</span>
                </div>
                
                <div class="thought-details">
                    {#if thought.summary}
                         <div class="summary-text">📝 总结：{thought.summary}</div>
                    {/if}
                    <div class="thought-tags">
                        {#each (thought.keywords || []) as kw}
                            <span class="thought-tag">#{typeof kw === 'string' ? kw : (kw.text || kw.name)}</span>
                        {/each}
                    </div>
                </div>
             </div>
        {/each}
    </div>
</SidebarSection>

<style>
    .thought-history {
        padding: 20px;
    }
    .history-hint {
        color: #999; 
        font-size: 0.9rem; 
        margin: 0 0 15px 0;
    }
    .empty-state {
        color: #999;
        font-size: 0.9rem;
        text-align: center;
        padding: 30px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80px;
        border: 1px dashed #eee;
        border-radius: 6px;
    }
    .thought-item {
        padding: 12px;
        background: #fff;
        border: 1px solid #eee;
        border-left: 4px solid #4a90e2;
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        max-height: 50px; /* Collapsed height approx */
        overflow: hidden;
    }
    .thought-item.expanded {
        max-height: 500px; /* Expanded max height */
        background-color: #f8fbff;
    }

    /* Adjust layout for collapsed state to hide details */
    .thought-item:not(.expanded) .thought-details {
        display: none;
    }

    .original-text {
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        line-height: 1.5;
        white-space: nowrap; 
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .thought-item.expanded .original-text {
        white-space: normal;
    }

    .original-text span {
        word-wrap: break-word;
    }
    
    .summary-text {
        color: #666;
        font-size: 0.85rem;
        background: #f9f9f9;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 10px;
        line-height: 1.5;
    }
    .thought-tags {
        display: flex;
        flex-wrap: wrap;

        gap: 5px;
    }
    .thought-tag {
        font-size: 0.75rem;
        color: #4a90e2;
        background: #eef5ff;
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid #d0e3ff;
    }
</style>
