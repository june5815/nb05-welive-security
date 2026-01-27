import { Injector } from "./injector";

const { httpServer } = Injector();
httpServer.start();
