import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
import { adminService } from "./admin.service";

export const adminController = {
  async users(_req: AuthedRequest, res: Response) {
    res.json({ data: await adminService.listUsers() });
  },

  async projects(_req: AuthedRequest, res: Response) {
    res.json({ data: await adminService.listProjects() });
  },

  async stats(_req: AuthedRequest, res: Response) {
    res.json({ data: await adminService.stats() });
  },
};
