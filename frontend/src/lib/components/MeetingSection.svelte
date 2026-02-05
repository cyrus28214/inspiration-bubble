<script lang="ts">
  import SidebarSection from './SidebarSection.svelte';
  import { onMount } from 'svelte';
  import { brainstormStore } from '../stores';
  import { performMindmapUpdate } from '../operations';

  let isRecording = false;
  let recognition: any = null;
  let meetingText: string = "";
  let interimText: string = "";
  let placeholder = "点击麦克风开始录制，语音内容将实时转化为文字并显示在这里。";

  onMount(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
            // 1. Update text display
            meetingText += finalTranscript + '\n';
            
            // 2. Add to store immediately (so it's safe)
            updateStore(finalTranscript);
            
            // 3. Trigger Mindmap Update
            // We set inputAlreadyInHistory: true because we just added it above
            performMindmapUpdate(finalTranscript, { inputAlreadyInHistory: true });
        }
        
        interimText = currentInterim;
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            alert('请允许麦克风权限以使用语音功能。');
        }
        isRecording = false;
      };
    }
  });

  function updateStore(text: string) {
      brainstormStore.update(s => ({
          ...s,
          voiceTextHistory: [...s.voiceTextHistory, text]
      }));
  }

  function toggleRecording() {
      if (!recognition) {
          alert("您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge。");
          return;
      }

      if (isRecording) {
          recognition.stop();
          isRecording = false;
      } else {
          try {
            recognition.start();
            isRecording = true;
          } catch (e: any) {
              console.error("Recording start error:", e);
              // If it's already started, just sync the state
              if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
                  isRecording = true;
              }
          }
      }
  }

  function downloadMinutes() {
      if (!meetingText) {
          alert('暂无纪要内容');
          return;
      }
      const blob = new Blob([meetingText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Meeting_Minutes_${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  }
</script>

<SidebarSection title="AI 纪要">
    <div slot="actions" class="actions-group">
        <button 
            class="circle-btn voice-btn" 
            class:recording={isRecording}
            on:click={toggleRecording} 
            title={isRecording ? "停止录音" : "语音录入"}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                {#if isRecording}
                    <!-- Stop Icon -->
                    <rect x="6" y="6" width="12" height="12"></rect>
                {:else}
                    <!-- Mic Icon -->
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
                {/if}
            </svg>
        </button>
        <button class="circle-btn download-btn" on:click={downloadMinutes} title="下载纪要">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </div>

    <div class="meeting-content">
        {#if meetingText || interimText}
            <div class="text-content">{meetingText}<span class="interim">{interimText}</span></div>
        {:else}
            <p class="placeholder">{placeholder}</p>
        {/if}
        {#if isRecording}
             <div class="recording-bar">
                 <span class="pulse-dot"></span> 正在录音...
             </div>
        {/if}
    </div>
</SidebarSection>

<style>
    .actions-group {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .circle-btn {
        background: white; 
        color: #4a90e2; 
        border: 1px solid #4a90e2; 
        width: 30px; 
        height: 30px;
        padding: 0; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .circle-btn:hover {
        background: #4a90e2;
        color: white;
        transform: scale(1.05);
    }
    
    .circle-btn.recording {
        background-color: #ff4d4f;
        border-color: #ff4d4f;
        color: white;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(255, 77, 79, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
    }

    .meeting-content {
        padding: 20px;
        min-height: 120px;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    .placeholder {
        color: #999;
        font-size: 0.9rem;
        text-align: center;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 20px 0;
    }
    .text-content {
        white-space: pre-wrap;
        font-size: 0.9rem;
        color: #333;
        line-height: 1.6;
    }

    .interim {
        color: #999;
    }
    
    .recording-bar {
        position: absolute;
        bottom: 10px;
        right: 15px;
        font-size: 0.8rem;
        color: #ff4d4f;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 241, 240, 0.9);
        padding: 2px 8px;
        border-radius: 12px;
    }
    .pulse-dot {
        width: 6px;
        height: 6px;
        background-color: #ff4d4f;
        border-radius: 50%;
        animation: blink 1s infinite;
    }
    @keyframes blink {
        50% { opacity: 0; }
    }
</style>
