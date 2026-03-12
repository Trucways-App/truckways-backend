import { AuthConfig } from "src/Auth/config/auth-config.type";
import { AppConfig } from "./app-config";


export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  
};
