<svelte:options customElement={{tag: 'show-overlay-value-action', shadow: 'none'}} />
<script>
  import { AtomicInput, AtomicSuggestions } from "@intechstudio/grid-uikit";
    import { onMount } from "svelte";
  let channel = "";
  let value = "";
  let min = "";
  let max = "";

  let currentCodeValue = "";

  let ref;

  function handleConfigUpdate(config) {
    const regex =
        /^gps\("package-overlay",\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/;
    if (currentCodeValue != config.script){
        currentCodeValue = config.script;
        const match = config.script.match(regex);
        if (match) {
            channel = match[1] ?? "null";
            value = match[2];
            min = match[3];
            max = match[4];
        }
    }
  }

  onMount(() => {
    const event = new CustomEvent("updateConfigHandler", {
        bubbles: true,
        detail: { handler: handleConfigUpdate },
    });
    ref.dispatchEvent(event);
  });

  $: channel, value, min, max, function() {
    var code = `gps("package-overlay", ${channel}, ${value}, ${min}, ${max})`;
    if (currentCodeValue != code){
        currentCodeValue = code;    
        const event = new CustomEvent("updateCode", {
            bubbles: true,
            detail: { script: String(code) },
        });
        if (ref){
            ref.dispatchEvent(event);
        }
    }
  }()
</script>

<show-overlay-value
  class="{$$props.class} flex flex-col w-full pb-2 px-2 pointer-events-auto"
  bind:this={ref}
>
    <div class="w-full flex">
        <div class="atomicInput" style="width: 25%;">
            <div class="text-gray-500 text-sm pb-1">Channel</div>
            <AtomicInput
                inputValue={channel}
                on:change={(e) => {
                    channel = e.detail;
                }}/>
        </div>        
        <div class="atomicInput" style="width: 25%;">
            <div class="text-gray-500 text-sm pb-1">Value</div>
            <AtomicInput
                inputValue={value}
                on:change={(e) => {
                    value = e.detail;
                }}/>
        </div>        
        <div class="atomicInput" style="width: 25%;">
            <div class="text-gray-500 text-sm pb-1">Min</div>
            <AtomicInput
                inputValue={min}
                on:change={(e) => {
                    min = e.detail;
                }}/>
        </div>        
        <div class="atomicInput" style="width: 25%;">
            <div class="text-gray-500 text-sm pb-1">Max</div>
            <AtomicInput
                inputValue={max}
                on:change={(e) => {
                    max = e.detail;
                }}/>
        </div>
    </div>
</show-overlay-value>