<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import MindMap from "simple-mind-map";
  // Try importing CSS. If this fails, user might need to adjust vite config or alias.
  import "simple-mind-map/dist/simpleMindMap.esm.css";

  import { brainstormStore, isAnalyzing } from '../stores';
  import { transformNodesToMindMap, flattenMindMapData } from '../utils/mindmapTransform';
  import type { MindMapData } from '../utils/mindmapTransform';

  let container: HTMLElement;
  let mindMap: any;
  let unsubscribe: () => void;
  let isUpdatingFromMap = false;

  // State for functionality
  let showContextMenu = false;
  let contextMenuX = 0;
  let contextMenuY = 0;
  let activeNode: any = null;

  onMount(() => {
    unsubscribe = brainstormStore.subscribe(state => {
        if (isUpdatingFromMap) return;

        // Store internally works with MindNode objects (id/text separation handled)
        // transformNodesToMindMap handles converting MindNode[] -> MindMapData
        const data = transformNodesToMindMap(state.nodes);
        
        if (mindMap) {
             try {
                mindMap.setData(data);
             } catch(e) {
                 console.error("MindMap redraw error", e);
             }
        } else {
             // Initial creation
             // We can check isAnalyzing store here but usually false on init
             initMindMap(data, false);
        }
    });

    // Reactive statement for analyzing state specific effects
    // This separates data updates from UI state updates
    const unsubscribeAnalyzing = isAnalyzing.subscribe(analyzing => {
        if (analyzing) {
            showContextMenu = false;
        }
        if (mindMap && mindMap.setMode) {
             mindMap.setMode(analyzing ? 'readonly' : 'edit');
        }
    });

    window.addEventListener('keydown', handleGlobalKeyDown);

    // Merge unsubscribes
    const oldUnsub = unsubscribe;
    unsubscribe = () => {
        oldUnsub();
        unsubscribeAnalyzing();
    };
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
    if (mindMap) mindMap.destroy();
    window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  function initMindMap(data: MindMapData, isReadOnly: boolean = false) {
      if(!container) return;
      
      mindMap = new MindMap({
          el: container,
          data: data,
          theme: 'default',
          keyboard: true, // Enable built-in keyboard support
          readonly: isReadOnly
      } as any);

      mindMap.on('data_change', (event: any) => {
          isUpdatingFromMap = true;
          try {
             // Get current full data
             const newData = mindMap.getData(); 
             // Convert back to flat list
             const flattened = flattenMindMapData(newData);
             
             brainstormStore.update(s => ({
                 ...s,
                 nodes: flattened
             }));
          } finally {
             setTimeout(() => { isUpdatingFromMap = false; }, 0);
          }
      });

      // Track active node
      mindMap.on('node_active', (node: any, nodeList: any[]) => {
          activeNode = (nodeList && nodeList.length > 0) ? nodeList[0] : null;
      });

      // Context Menu
      mindMap.on('node_contextmenu', (e: any, node: any) => {
          // e might be the event or wrapper. simple-mind-map often passes (event, node)
          // Adjust based on observation if needed.
          // In some versions: (e, node) where e is MouseEvent
          // In others: (event) where event.detail is node
          
          // Let's assume (e, node) pattern or inspect arguments
          const event = e.detail ? e.detail.event : e; 
          const targetNode = e.detail ? e.detail.node : node;

          if (event && event.preventDefault) {
              event.preventDefault();
              contextMenuX = event.clientX;
              contextMenuY = event.clientY;
              showContextMenu = true;
              activeNode = targetNode;
          }
      });
      
      // Hide menu on click elsewhere
      mindMap.on('click', () => {
          showContextMenu = false;
      });
      mindMap.on('view_data_change', () => {
         // handle view changes if needed
      });
  }

  // Handle global shortcuts that are NOT related to mind map node manipulation
  // (Since simple-mind-map handles node manipulation with keyboard:true)
  function handleGlobalKeyDown(e: KeyboardEvent) {
       // Placeholder for future global shortcuts if needed
  }
  
  function isNodeSelected() {
      // Helper to check internal state if activeNode is not reliable
      return mindMap.renderer.activeNodeList.length > 0;
  }

  function handleMenuClick(command: string) {
      if (mindMap) {
          mindMap.execCommand(command);
      }
      showContextMenu = false;
  }
</script>

<div class="mindmap-wrapper" bind:this={container} on:contextmenu|preventDefault role="application">
    {#if $isAnalyzing}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>AI 正在优化思维导图...</p>
        </div>
    {/if}
</div>

{#if showContextMenu && !$isAnalyzing}
  <div class="context-menu" style="top: {contextMenuY}px; left: {contextMenuX}px">
      <div class="menu-item" on:click|stopPropagation={() => handleMenuClick('INSERT_NODE')} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleMenuClick('INSERT_NODE')}>
          添加同级节点 (Enter)
      </div>
      <div class="menu-item" on:click|stopPropagation={() => handleMenuClick('INSERT_CHILD_NODE')} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleMenuClick('INSERT_CHILD_NODE')}>
          添加子节点 (Tab)
      </div>
      <div class="menu-item delete" on:click|stopPropagation={() => handleMenuClick('REMOVE_NODE')} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleMenuClick('REMOVE_NODE')}>
          删除节点 (Del)
      </div>
  </div>
{/if}

<style>
    .mindmap-wrapper {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #f5f5f5; /* Light background */
        position: relative;
    }

    .context-menu {
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        border-radius: 6px;
        overflow: hidden;
        min-width: 160px;
        font-family: sans-serif;
    }
    .menu-item {
        padding: 10px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: background-color 0.2s;
        display: flex;
        justify-content: space-between;
    }
    .menu-item:hover {
        background-color: #f0f7ff;
    }
    .menu-item.delete {
        color: #ff4d4f;
        border-top: 1px solid #eee;
    }
    .menu-item.delete:hover {
        background-color: #fff1f0;
    }

    .loading-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(255, 255, 255, 0.7);
        z-index: 2000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: wait;
        backdrop-filter: blur(2px);
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
