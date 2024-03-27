let controller = undefined;
let messagePorts = new Set();

exports.loadPackage = async function (
  gridController,
  persistedData
) {
  controller = gridController;
};

exports.unloadPackage = async function () {
  controller = undefined;
  messagePorts.forEach((port) => port.close());
  messagePorts.clear();
};

exports.addMessagePort = async function (port) {
  port.on("message", (e) => {
    onMessage(port, e.data);
  });

  messagePorts.add(port);

  port.postMessage({
    type: "message",
    message: "Hello from the overlay package",
  });

  port.on("close", () => {
    messagePorts.delete(port);
  });
  port.start();
};

exports.sendMessage = async function (args) {
  // the incoming data from package_send

  if (args[0]) {
    //controller.sendMessageToRuntime({})

    for (const port of messagePorts) {
      port.postMessage({
        type: "overlay-command",
        message: args,
      });
    }
    controller.sendMessageToRuntime({
      id: "overlay-package",
      payload: args,
    });
  }


}

async function onMessage(port, data) {
  if (data.type === "request-echo") {
    port.postMessage({
      type: "echo",
      message: "Echo message",
    });
  }
  console.log("SDASDA", data)
  port.postMessage({
    type: "echo",
    message: "Echo message",
  });
}