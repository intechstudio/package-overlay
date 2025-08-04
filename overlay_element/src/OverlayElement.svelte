<svelte:options customElement={{tag: 'overlay-element', shadow: 'none'}} />
<script>

  let numberOfRows = 4;
  let channelValues = [];
  let areSlidersVisible = true;
  let timeoutValue;
  let timeoutValueId;
  let selectedArea = "topleft";

  window.onmessage = (event) => {
    const [port] = event.ports;
    port.onmessage = (e) => {
      let data = e.data;
      if (data.id == "channel-value") {
        areSlidersVisible = true;
        if (timeoutValue) {
          clearTimeout(timeoutValueId);
          timeoutValueId = setTimeout(() => {
            areSlidersVisible = false;
          }, timeoutValue);
        }

        let channel = data.channel;
        while (channel >= channelValues.length) {
          channelValues.push({});
        } 
        channelValues[channel].value = data.value;
        channelValues[channel].min = Number(data.min);
        channelValues[channel].max = Number(data.max);
        if (![data.value, data.min, data.max].some(isNaN)) {
            channelValues[channel].progress =
              `${((data.value - data.min) / (data.max - data.min)) * 127}px`;
          }
        channelValues = [...channelValues];
      } else if (data.id == "configuration") {
        numberOfRows = data.numberOfRows;
        if (
          data.timeoutValue &&
          !isNaN(Number(data.timeoutValue)) &&
          Number(data.timeoutValue) > 0
        ) {
          if (!timeoutValue) {
            areSlidersVisible = false;
          }
          timeoutValue = Number(data.timeoutValue);
        } else {
          timeoutValue = undefined;
          clearTimeout(timeoutValueId);
          areSlidersVisible = true;
        }

        selectedArea = data.selectedArea;
        console.log({selectedArea})
      }
    };
    port.start();
  }

  $: updateConfiguration()

  function updateConfiguration(e) {
    
  }
</script>


<overlay-element-tag
  style:height={20 * numberOfRows}
  class:align-left={selectedArea.includes("left")}
  class:align-right={selectedArea.includes("right")}
  class:align-bottom={selectedArea.includes("bottom")}
  class:align-top={selectedArea.includes("top")}
  class:align-center={selectedArea.includes("center")}>
  {#if areSlidersVisible}
    {#each channelValues as valueData}
      <div class="display-value-wrapper">
        <div 
          class="display-value-background" 
          style:width={valueData.progress ?? 64} />
        <p class="display-value-text">{valueData.value ?? ""}</p>
      </div>
    {/each}
  {/if}
</overlay-element-tag>

<style>
  overlay-element-tag {
    position: absolute;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 4px;
  }
  overlay-element-tag.align-left {
    left: 0px;
  }
  overlay-element-tag.align-top {
    top: 0px;
  }
  overlay-element-tag.align-right {
    right: 0px;
  }
  overlay-element-tag.align-bottom {
    bottom: 0px;
  }
  overlay-element-tag.align-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  div.display-value-wrapper {
    width: 127px;
    background-color: black;
    height: 16px;
    margin-top: 4px;
    margin-right: 4px;
    position: relative;
  }
  div.display-value-background {
    background-color: orange;
    height: 16px;
  }
  p.display-value-text {
    color: white;
    font-weight: bold;
    position: absolute;
    margin: 0;
    top: 0;
    text-align: center;
    width: 100%;
  }
</style>