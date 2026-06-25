import { AppModule } from "./AppModule.js";
import { ModuleContext } from "./ModuleContext.js";
import { app } from "electron";

export async function initModules(modules: AppModule[]): Promise<void> {
  const context: ModuleContext = { app };
  for (const module of modules) {
    await module.enable(context);
  }
}
