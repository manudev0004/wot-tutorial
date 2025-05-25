const { Servient } = require("@node-wot/core");
const HttpServer = require("@node-wot/binding-http").HttpServer;
const CoapServer = require("@node-wot/binding-coap").CoapServer;

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8888 }));
servient.addServer(new CoapServer({ port: 5683 }));

servient.start().then((WoT) => {
  WoT.produce({
    title: "CoffeeMachine",
    description: "Simulated Coffee Machine for WoT Tutorial",
    properties: {
      state: { type: "string", readOnly: true },
      waterLevel: { type: "number", readOnly: true },
      beanLevel: { type: "number", readOnly: true },
      binLevel: { type: "number", readOnly: true },
      power: { type: "boolean", writeOnly: true },
    },
    actions: {
      brewCoffee: {
        input: { type: "string", enum: ["espresso", "latte", "americano"] },
      },
      stopBrewing: {},
    },
    events: {
      warning: { data: { type: "string" } },
    },
  }).then((thing) => {
    // Initial values
    let currentState = "idle";
    let water = 60;
    let beans = 50;
    let bin = 10;
    let isOn = true;

    // Read property handlers
    thing.setPropertyReadHandler("state", () => currentState);
    thing.setPropertyReadHandler("waterLevel", () => water);
    thing.setPropertyReadHandler("beanLevel", () => beans);
    thing.setPropertyReadHandler("binLevel", () => bin);

    // Write property handler
    thing.setPropertyWriteHandler("power", async (val) => {
      isOn = await val.value();
      currentState = isOn ? "idle" : "off";
    });

    // Brew coffee
    thing.setActionHandler("brewCoffee", async (params) => {
      const type = await params.value();

      if (!isOn) {
        thing.emitEvent("warning", "Machine is turned off.");
        return;
      }

      if (water < 20 || beans < 20 || bin > 90) {
        thing.emitEvent(
          "warning",
          "Maintenance needed: Check water, beans, or empty the bin."
        );
        return;
      }

      currentState = "brewing";
      thing.emitEvent("warning", `Brewing your ${type}...`);

      // Simulate brewing process
      return new Promise((resolve) => {
        setTimeout(() => {
          water -= 10;
          beans -= 10;
          bin += 10;
          currentState = "idle";
          thing.emitEvent("warning", `${type} is ready!`);
          resolve();
        }, 3000);
      });
    });

    // Stop brewing
    thing.setActionHandler("stopBrewing", async () => {
      if (currentState === "brewing") {
        currentState = "idle";
        thing.emitEvent("warning", "Brewing stopped manually.");
      }
    });

    // Expose thing
    thing.expose().then(() => {
      console.log("Coffee Machine is running!");
    });
  });
});
