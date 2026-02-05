<script lang="ts">
  import { onMount } from 'svelte';
  import { brainstormStore } from './lib/stores';
  import MindMap from './lib/components/MindMap.svelte';
  import InputSection from './lib/components/InputSection.svelte';
  import HistorySection from './lib/components/HistorySection.svelte';
  import MeetingSection from './lib/components/MeetingSection.svelte';
  import InspirationSection from './lib/components/InspirationSection.svelte';

  onMount(() => {
    brainstormStore.init();
  });
  
  function clearCache() {
      if (confirm("确定要清空所有历史数据和缓存吗？此操作不可撤销。")) {
          localStorage.removeItem("brainstormData_MVP");
          location.reload();
      }
  }

  function toggleInspiration() {
      brainstormStore.toggleInspiration();
  }
</script>

<header>
    <h1>Inspiration Bubble 🫧</h1>
    <div class="user-info">
        <span class="mode-badge">头脑风暴模式</span>
        <button class="toggle-btn" on:click={toggleInspiration} class:active={$brainstormStore.showInspiration}>
            {$brainstormStore.showInspiration ? '关闭灵感' : '💡 灵感推荐'}
        </button>
        <button class="clear-btn" on:click={clearCache}>清空历史/缓存</button>
    </div>
</header>

<main class="app-container" style="grid-template-columns: 380px 1fr {$brainstormStore.showInspiration ? '340px' : '0px'}">
  <div class="sidebar-left">
     <InputSection />
     <HistorySection />
     <MeetingSection />
  </div>

  <div class="visual-area">
     <MindMap />
     <div class="visual-overlay left-top">
        <div class="visual-title">思维导图</div>
     </div>
  </div>

  {#if $brainstormStore.showInspiration}
    <div class="sidebar-right">
        <InspirationSection />
    </div>
  {/if}
</main>

<style>
  :global(body) {
    /* Styles are in app.css now */
  }

  :global(#app) {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  header {
    background-color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    z-index: 20;
    height: 60px;
  }
  
  h1 {
      font-size: 1.2rem;
      margin: 0;
      color: #333;
  }

  .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
  }
  
  .mode-badge {
      font-size: 0.9rem;
      color: #666;
  }
  
  .clear-btn {
      background: #fff1f0;
      border: 1px solid #ffccc7;
      color: #ff4d4f;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
  }
  .clear-btn:hover {
      background: #ff4d4f;
      color: white;
      border-color: #ff4d4f;
  }
  
  .toggle-btn {
      background: #f0f7ff;
      border: 1px solid #d0e3ff;
      color: #4a90e2;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
  }
  .toggle-btn:hover, .toggle-btn.active {
      background: #4a90e2;
      color: white;
      border-color: #4a90e2;
  }

  .app-container {
      display: grid;
      /* grid-template-columns is handled inline for dynamic behavior */
      grid-template-rows: 1fr; /* Ensure items respect container height */
      flex-grow: 1;
      min-height: 0; 
      overflow: hidden; 
  }
  
  .sidebar-left, .sidebar-right {
      background: #f5f7fa; /* Match body bg, sections have white cards */
      border-right: 1px solid #eee;
      border-left: 1px solid #eee;
      padding: 20px;
      overflow-y: auto;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: 0; /* Crucial: allow shrinking below content size to trigger scroll */
  }
  
  .visual-area {
      position: relative;
      background: #f5f7fa;
      overflow: hidden;
      background-image: radial-gradient(#ddd 1px, transparent 0);
      background-size: 20px 20px;
      min-height: 0; /* Consistency */
  }
  
  .visual-overlay {
      position: absolute;
      padding: 10px;
      pointer-events: none; /* Let clicks pass through to canvas unless on buttons */
  }
  .visual-overlay.left-top { top: 10px; left: 10px; }
  .visual-overlay.right-top { top: 10px; right: 10px; pointer-events: auto; }
  
  .action-btn {
      background: #f0f7ff; 
      color: #4a90e2; 
      border: 1px solid #d0e3ff; 
      border-radius: 4px; 
      padding: 5px 12px; 
      cursor: pointer;
  }
</style>
