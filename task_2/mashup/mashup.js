// This code creates a simple motion sensor Thing using Node-WoT.
const { Servient } = require("@node-wot/core");
const HttpClient = require("@node-wot/binding-http").HttpClient;

const servient = new Servient();
servient.addClientFactory(new HttpClient());

servient.start().then(async (WoT) => {
  const motionTD = await WoT.fetch("http://localhost:8889/");
  const motionSensor = await WoT.consume(motionTD);

  const coffeeTD = await WoT.fetch("http://localhost:8888/");
  const coffeeMachine = await WoT.consume(coffeeTD);

  console.log("Mashup started...");

  setInterval(async () => {
    const motion = await motionSensor.readProperty("motion");
    if (motion === true) {
      console.log("Motion detected. Brewing coffee...");
      await coffeeMachine.invokeAction("brewCoffee", { type: "espresso" });
    } else {
      console.log("No motion.");
    }
  }, 3000);
});
