<script lang="ts">
  import SidebarSection from './SidebarSection.svelte';
  import { brainstormStore, isRecommending } from '../stores';
  import { fetchInspirations } from '../operations';

  function isNodeInserted(nodeId: string): boolean {
      return $brainstormStore.nodes.some(n => n.id === nodeId);
  }

  function insertNode(item: { title: string; node_id: string; parent_node_id: string }) {
      if (isNodeInserted(item.node_id)) return;
      brainstormStore.addInspirationNode(item.node_id, item.title, item.parent_node_id);
  }
</script>

<SidebarSection title="AI 灵感推荐">
    <div class="ai-content">
        <div class="controls-row">
            <button
                class="recommend-btn"
                onclick={fetchInspirations}
                disabled={$isRecommending || $brainstormStore.voiceTextHistory.length === 0}
            >
                {#if $isRecommending}
                    <span class="spinner"></span>
                    正在生成...
                {:else}
                    生成灵感推荐
                {/if}
            </button>

            <label class="auto-toggle">
                <input
                    type="checkbox"
                    checked={$brainstormStore.autoInspiration}
                    onchange={() => brainstormStore.toggleAutoInspiration()}
                />
                <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">自动</span>
            </label>
        </div>

        {#if $brainstormStore.inspiration.length === 0 && !$isRecommending}
            <div class="empty-state">
                暂无推荐灵感，请先输入想法后点击上方按钮。
            </div>
        {/if}

        {#each $brainstormStore.inspiration as item, i}
            <div class="inspiration-card">
                <div class="card-header">
                    <span class="card-index">{i + 1}</span>
                    <h4 class="card-title">{item.title}</h4>
                </div>
                <p class="card-description">{item.description}</p>
                <div class="card-reason">
                    <span class="reason-label">推荐理由</span>
                    <span class="reason-text">{item.reason}</span>
                </div>
                <button
                    class="insert-btn"
                    class:inserted={isNodeInserted(item.node_id)}
                    onclick={() => insertNode(item)}
                    disabled={isNodeInserted(item.node_id)}
                >
                    {#if isNodeInserted(item.node_id)}
                        已添加
                    {:else}
                        + 添加到思维导图
                    {/if}
                </button>
            </div>
        {/each}
    </div>
</SidebarSection>

<style>
    .ai-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .controls-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .recommend-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex: 1;
        padding: 10px 16px;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s, opacity 0.2s;
    }

    .recommend-btn:hover:not(:disabled) {
        background: #357abd;
    }

    .recommend-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .empty-state {
        color: #999;
        font-size: 0.85rem;
        text-align: center;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .inspiration-card {
        background: white;
        border: 1px solid #e8edf3;
        border-radius: 10px;
        padding: 14px;
        transition: box-shadow 0.2s, border-color 0.2s;
    }

    .inspiration-card:hover {
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.12);
        border-color: #c8d9f0;
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }

    .card-index {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        background: #4a90e2;
        color: white;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
    }

    .card-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
        line-height: 1.3;
    }

    .card-description {
        font-size: 0.85rem;
        color: #555;
        line-height: 1.6;
        margin: 0 0 10px;
    }

    .card-reason {
        background: #f0f7ff;
        border-radius: 6px;
        padding: 8px 10px;
        font-size: 0.8rem;
        line-height: 1.5;
    }

    .reason-label {
        display: inline-block;
        color: #4a90e2;
        font-weight: 600;
        margin-right: 6px;
    }

    .reason-text {
        color: #666;
    }

    .insert-btn {
        display: block;
        width: 100%;
        margin-top: 10px;
        padding: 7px 12px;
        background: white;
        color: #4a90e2;
        border: 1px solid #c8d9f0;
        border-radius: 6px;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .insert-btn:hover:not(:disabled) {
        background: #4a90e2;
        color: white;
        border-color: #4a90e2;
    }

    .insert-btn.inserted {
        background: #f0faf0;
        color: #52c41a;
        border-color: #b7eb8f;
        cursor: default;
    }

    /* Auto toggle switch */
    .auto-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        flex-shrink: 0;
        user-select: none;
    }

    .auto-toggle input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-track {
        position: relative;
        width: 36px;
        height: 20px;
        background: #ccc;
        border-radius: 10px;
        transition: background 0.2s;
    }

    .auto-toggle input:checked + .toggle-track {
        background: #4a90e2;
    }

    .toggle-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .auto-toggle input:checked + .toggle-track .toggle-thumb {
        transform: translateX(16px);
    }

    .toggle-label {
        font-size: 0.8rem;
        color: #666;
        white-space: nowrap;
    }
</style>
