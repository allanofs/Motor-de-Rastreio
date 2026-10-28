import { CCR_MOTOR_MODULE } from "../ccr/shellAdapter";
import { MAMA_MOTOR_MODULE } from "../mama/shellAdapter";

export const MOTOR_MODULES = [CCR_MOTOR_MODULE, MAMA_MOTOR_MODULE] as const;

export type RegisteredMotorModuleId = (typeof MOTOR_MODULES)[number]["id"];

export function getMotorModuleDescriptor(id: RegisteredMotorModuleId) {
  return MOTOR_MODULES.find((module) => module.id === id);
}
