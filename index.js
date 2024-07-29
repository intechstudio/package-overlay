let path = require("path");
let fs = require("fs");

let controller = undefined;
let messagePorts = new Set();
let windowMessagePort;

let numberOfRows;
let selectedArea;
let timeoutValue;

exports.loadPackage = async function (gridController, persistedData) {
  controller = gridController;
  controller.sendMessageToEditor({
    type: "create-window",
    windowId: "overlay-window",
    windowFile: `file://${path.join(__dirname, "overlay.html")}`,
    fullscreen: true,
    transparent: true,
    alwaysOnTop: true,
    ignoreMouse: true,
    x: 0,
    y: 0,
  });
  numberOfRows = persistedData?.numberOfRows ?? 4;
  selectedArea = persistedData?.selectedArea ?? "top-left";
  timeoutValue = persistedData?.timeoutValue;
  /*controller.sendMessageToEditor(
    {
      type: "create-window",
      windowId: "overlay-window",
      windowFile: `file://${path.join(__dirname, "overlay.html")}`,
      fullscreen: false,
      width: 300,
      height: 400,
      resizable: true,
      transparent: false,
      alwaysOnTop: false,
      ignoreMouse: false,
      x: 0,
      y: 0,
    }
  );*/

  let iconSvg = fs.readFileSync(path.resolve(__dirname, "bar-icon.svg"), {
    encoding: "utf-8",
  });

  controller.sendMessageToEditor({
    type: "add-action",
    info: {
      actionId: 0,
      short: "xsmplo",
      displayName: "Show Value",
      rendering: "standard",
      category: "overlay",
      blockTitle: "Show Value",
      defaultLua: 'gps("package-overlay", 0, val, 0, 127)',
      color: "#a64305",
      icon: iconSvg,
      blockIcon: iconSvg,
      selectable: true,
      movable: true,
      hideIcon: false,
      type: "single",
      toggleable: true,
      actionComponent: "show-overlay-value-action",
    },
  });
};

exports.unloadPackage = async function () {
  controller.sendMessageToEditor({
    type: "close-window",
    windowId: "overlay-window",
  });
  controller.sendMessageToEditor({
    type: "remove-action",
    actionId: 0,
  });
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
  windowMessagePort?.close();
  windowMessagePort = undefined;
};

exports.addMessagePort = async function (port, senderId) {
  if (senderId === "overlay-window") {
    windowMessagePort?.close();
    windowMessagePort = port;
    port.start();
    sendConfigurationToOverlay();
  } else {
    port.on("message", (e) => {
      onMessage(port, e.data);
    });

    messagePorts.add(port);

    port.on("close", () => {
      messagePorts.delete(port);
    });
    port.start();
  }
};

exports.sendMessage = async function (args) {
  windowMessagePort.postMessage({
    id: "channel-value",
    channel: args[0],
    value: args[1],
    min: args[2],
    max: args[3],
  });
};

async function onMessage(port, data) {
  if (data.type === "request-configuration") {
    port.postMessage({
      type: "configuration",
      numberOfRows,
      selectedArea,
      timeoutValue,
    });
  } else if (data.type === "save-configuration") {
    numberOfRows = data.numberOfRows;
    selectedArea = data.selectedArea;
    timeoutValue = data.timeoutValue;
    controller.sendMessageToEditor({
      type: "persist-data",
      data: {
        numberOfRows,
        selectedArea,
        timeoutValue,
      },
    });
    sendConfigurationToOverlay();
  }
}

function sendConfigurationToOverlay() {
  windowMessagePort?.postMessage({
    id: "configuration",
    numberOfRows,
    selectedArea,
    timeoutValue,
  });
}
