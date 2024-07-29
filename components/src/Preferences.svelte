<svelte:options customElement={{tag: 'overlay-preference', shadow: 'none'}} />
<script>
  import { Block, BlockBody, BlockRow, BlockTitle, MoltenButton, MoltenInput } from "@intechstudio/grid-uikit";
  import { onMount } from "svelte";

  let currentArea = "top-left";
  let numberOfRows = "4";
  let timeoutValue = "1000"; 
  let isConfigured = false;

  // @ts-ignore
  const messagePort = createPackageMessagePort("package-overlay");

  onMount(() => {
    messagePort.onmessage = (e) => {
      const data = e.data;
      if (data.type === "configuration") {
        numberOfRows = data.numberOfRows;
        timeoutValue = String(data.timeoutValue);
        currentArea = data.selectedArea ?? "top-left";
        isConfigured = true;
      }
    };

    messagePort.start();    
    messagePort.postMessage({
      type: "request-configuration",
    });
    return () => {
      messagePort.close();
    }
  })

  $: currentArea, numberOfRows, timeoutValue, isConfigured && updateConfiguration()

  function updateConfiguration(e) {
    let rows = Number(numberOfRows);
    if (isNaN(rows)) {
      rows = 4;
    } else if (rows < 1) {
      rows = 1;
    }
    rows = Math.round(rows);
    numberOfRows = String(rows);
    messagePort.postMessage({
      type: "save-configuration",
      numberOfRows: numberOfRows,
      selectedArea: currentArea,
      timeoutValue: Number(timeoutValue),
    });
  }
</script>

<main-app>
  <div class="px-4">
    <Block>
      <BlockTitle> Overlay Demo </BlockTitle>
      <BlockBody>
        Number of rows
      </BlockBody>
      <MoltenInput bind:target={numberOfRows} />
      <BlockBody>
        Timeout
      </BlockBody>
      <MoltenInput bind:target={timeoutValue} />
    </Block>
    <div class="container">
      {#each ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as direction}
      <!-- svelte-ignore a11y-interactive-supports-focus -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="area-selector {direction} {direction == currentArea ? 'selected' : ''}"
        role="button"
        on:click={() => currentArea = direction}
      />  
      {/each}
    </div>
  </div>
</main-app>
<style>
    .container {
    position: relative;
    width: 100px; /* Adjust the width of the rectangle */
    height: 55px; /* Adjust the height of the rectangle */
    border: 2px solid #ffffff4c;
    margin: 18px;
  }
  .area-selector {
    position: absolute;
    width: 20px; /* Adjust the size of the corner selectors */
    height: 20px; /* Adjust the size of the corner selectors */
    background-color: #4d6166;
    border: 2px solid #1e2628;
    cursor: pointer;
  }
  .top-left {
    top: -12px;
    left: -12px;
  }
  .top-right {
    top: -12px;
    right: -12px;
  }
  .bottom-left {
    bottom: -12px;
    left: -12px;
  }
  .bottom-right {
    bottom: -12px;
    right: -12px;
  }
  .center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .selected {
    background-color: #788991; /* Change background color when selected */
  }
</style>