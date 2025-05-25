// This code creates a simple motion sensor Thing using Node-WoT.
const { Servient } = require("@node-wot/core");
const HttpServer = require("@node-wot/binding-http").HttpServer;

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8889 }));

servient.start().then(async (WoT) => {
  const thing = await WoT.produce({
    title: "MotionSensor",
    description: "Simulated motion sensor",
    properties: {
      motion: {
        type: "boolean",
        readOnly: true
      }
    },
    actions: {
      triggerMotion: {
        description: "Motion detected"
      }
    }
  });

  let motionDetected = false;

  thing.setPropertyReadHandler("motion", () => motionDetected);

  thing.setActionHandler("triggerMotion", () => {
    motionDetected = true;
    console.log("Motion triggered");
    setTimeout(() => {
      motionDetected = false;
      console.log("Motion reset");
    }, 5000); 
  });

  thing.expose().then(() => {
    console.log("Motion Sensor available at http://localhost:8889/");
  });
});
