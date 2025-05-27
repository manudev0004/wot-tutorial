// This code creates a simple motion sensor Thing using Node-WoT.
const { Servient } = require("@node-wot/core");
const HttpClientFactory = require("@node-wot/binding-http").HttpClientFactory;
const { fetch } = require("undici");

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());

async function fetchTD(url) {
  const res = await fetch(url);
  const text = await res.text();
  return JSON.parse(text);
}

servient.start().then(async (WoT) => {
  const motionTD = await fetchTD("http://localhost:8889/motionsensor");
  const motionSensor = await WoT.consume(motionTD);

  const coffeeTD = await fetchTD("http://localhost:8888/coffeemachine");
  const coffeeMachine = await WoT.consume(coffeeTD);

  console.log("Mashup started...");

  setInterval(async () => {
    const motion = await motionSensor.readProperty("motion");
    const value = await motion.value();
    if (value === true) {
      console.log("Motion detected. Brewing coffee...");
      await coffeeMachine.invokeAction("brewCoffee", "espresso");
    } else {
      console.log("No motion.");
    }
  }, 3000);
});
