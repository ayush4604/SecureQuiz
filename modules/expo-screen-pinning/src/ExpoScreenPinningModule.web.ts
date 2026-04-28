import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoScreenPinning.types';

type ExpoScreenPinningModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoScreenPinningModule extends NativeModule<ExpoScreenPinningModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoScreenPinningModule, 'ExpoScreenPinningModule');
