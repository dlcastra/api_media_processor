import express from "express";
import {server, AppSettings} from "./src/core/settings.js";
import ImageRouter from "./src/imageApp/routers.js";


server.use(express.json());
server.use("/api", ImageRouter);

server.listen(AppSettings.PORT, () => {
    console.log(`Server listening on port ${AppSettings.PORT}`);
});
