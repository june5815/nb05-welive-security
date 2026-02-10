import { Injector } from "./injector";

const { httpServer, notificationScheduler } = Injector();

httpServer.start();

notificationScheduler.start();

process.on("SIGTERM", async () => {
  notificationScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  notificationScheduler.stop();
  process.exit(0);
});
