import { requireNativeModule } from 'expo-modules-core';

const ExpoScreenPinning = requireNativeModule('ExpoScreenPinning');

export function start(): void {
  ExpoScreenPinning.start();
}

export function stop(): void {
  ExpoScreenPinning.stop();
}

export function isPinned(): boolean {
  return ExpoScreenPinning.isPinned();
}
