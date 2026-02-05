<script lang="ts">
  export let title: string;
  export let collapsed = false;
  
  function toggle() {
    collapsed = !collapsed;
  }
</script>

<section class:collapsed>
  <div class="section-header">
    <div class="header-content">
        <slot name="header" />
        {#if !$$slots.header}
           <h2>{title}</h2>
        {/if}
    </div>
    
    <div class="header-actions">
        <slot name="actions" />
        <button class="toggle-btn" title={collapsed ? "展开" : "折叠"} on:click={toggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: {collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
    </div>
  </div>
  
  <div class="section-content-wrapper">
    <div class="section-content">
       <slot />
    </div>
  </div>
</section>

<style>
  section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    background-color: #fafafa;
    padding-right: 15px;
    min-height: 50px;
  }

  .header-content {
      flex-grow: 1;
  }

  /* Target h2 directly if passed via slot or default */
  .header-content :global(h2), h2 { 
    font-size: 1.1rem;
    padding: 15px;
    margin: 0;
    border: none;
    background: transparent;
    color: #333;
  }

  .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
  }

  .toggle-btn {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 4px;
  }
  .toggle-btn:hover {
    background: #f0f0f0;
    color: #4a90e2;
  }

  .section-content-wrapper {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s ease-out;
  }
  
  .section-content {
      overflow: hidden;
  }

  section.collapsed .section-content-wrapper {
    grid-template-rows: 0fr;
  }
</style>
