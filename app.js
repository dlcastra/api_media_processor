import express from "express";
import {server, AppSettings as settings} from "./src/core/settings.js";
import ImageRouter from "./src/imageApp/routers.js";
import {processBusQueue} from "./src/azure/handlers.js";


server.use(express.json());
server.use("/api", ImageRouter);

processBusQueue(
    settings.AZURE_SERVICE_BUS_CONNECTION_STRING,
    settings.AZURE_SERVICE_BUS_QUEUE_NAME
).catch(
    err => console.error("Failed to start queue processor:", err
    )
);


server.listen(settings.PORT || 3000, () => {
    console.log(`Server listening on port ${settings.PORT}`);
});
