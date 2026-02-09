<script lang="ts">
  import SidebarSection from './SidebarSection.svelte';
  import { brainstormStore, isAnalyzing } from '../stores';
  import { performMindmapUpdate } from '../operations';

  let ideaText = "";
  // Use store loading state instead of local
  $: isLoading = $isAnalyzing || false;

  async function handleSubmit() {
      if (!ideaText.trim() || isLoading) return;
      
      const text = ideaText;
      ideaText = ""; // Clear immediately for UX
      
      await performMindmapUpdate(text, { inputAlreadyInHistory: false });
  }
</script>


<SidebarSection title="想法输入">
    <div class="input-container">
        <textarea 
            bind:value={ideaText} 
            placeholder="在此输入你的想法、关键词或问题..."
            disabled={isLoading}
        ></textarea>
        <div class="actions">
            <button on:click={handleSubmit} disabled={isLoading}>
                {isLoading ? "AI 思考中..." : "捕捉灵感"}
            </button>
        </div>
    </div>
</SidebarSection>

<style>
    .input-container {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    textarea {
        width: 100%;
        height: 150px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        resize: none;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.3s;
        box-sizing: border-box;
    }
    textarea:focus {
        border-color: #4a90e2;
    }
    .actions {
        display: flex;
        gap: 10px;
    }
    button {
        background-color: #4a90e2;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: opacity 0.3s;
        flex-grow: 1;
    }
    button:hover {
        opacity: 0.9;
    }
</style>
