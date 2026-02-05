<script lang="ts">
  import SidebarSection from './SidebarSection.svelte';
  import { brainstormStore } from '../stores';
  import { api } from '../api';

  // Function to summarize individual items (lazy loading)
  async function loadSummary(index: number, item: any) {
      if (item.summary || item.loading) return;
      
      // Temporarily mark loading in UI if possible, or just local state
      // For now, let's just call API and update store
      try {
          const res = await api.summarize(item.title, item.snippet);
          
          brainstormStore.update(s => {
              const newInspiration = [...s.inspiration];
              // Find by reference or index if consistent
              if (newInspiration[index]) {
                  newInspiration[index] = { ...newInspiration[index], ...res, aiLoaded: true };
              }
              return { ...s, inspiration: newInspiration };
          });
      } catch (e) {
          console.error(e);
      }
  }
</script>

<SidebarSection title="AI 灵感推荐">
    <div class="ai-content">
        {#if $brainstormStore.inspiration.length === 0}
            <div class="empty-state">
                暂无推荐灵感，请先输入想法。
            </div>
        {:else}
            {#each $brainstormStore.inspiration as item, i}
                <div class="inspiration-item">
                    <a href={item.link} target="_blank" class="inspiration-title">💡 {item.title}</a>
                    <div class="inspiration-snippet">{item.snippet}</div>
                    
                    {#if item.aiLoaded}
                         <div class="ai-summary">
                            <div class="summary-text">✨ {item.summary}</div>
                            <div class="tags">
                                {#each item.tags || [] as tag}
                                    <span class="tag">#{tag}</span>
                                {/each}
                            </div>
                         </div>
                    {:else}
                         <!-- Trigger lazy load automatically or by button? 
                              Original app did it automatically. Let's do a button for now to save tokens/API calls -->
                         <button class="summarize-btn" on:click={() => loadSummary(i, item)}>点击生成 AI 解读</button>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</SidebarSection>

<style>
    .ai-content {
        padding: 20px;
    }
    .empty-state {
        color: #999; 
        font-size: 0.9rem;
        text-align: center; 
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
    }
    .inspiration-item {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    .inspiration-title {
        display: block;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
        text-decoration: none;
        transition: color 0.2s;
    }
    .inspiration-title:hover {
        color: #4a90e2;
    }
    .inspiration-snippet {
        font-size: 0.85rem;
        color: #666;
        line-height: 1.5;
        margin-bottom: 8px;
    }
    .summarize-btn {
        background: none;
        border: 1px dashed #ccc;
        color: #888;
        font-size: 0.8rem;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 4px;
        width: 100%;
    }
    .summarize-btn:hover {
        border-color: #4a90e2;
        color: #4a90e2;
    }
    .ai-summary {
        background: #f0f7ff;
        padding: 10px;
        border-radius: 6px;
        margin-top: 8px;
        font-size: 0.85rem;
    }
    .tags {
        margin-top: 5px;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }
    .tag {
        background: #fff;
        color: #4a90e2;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        border: 1px solid #dbeafe;
    }
</style>
