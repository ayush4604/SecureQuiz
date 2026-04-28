import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoScreenPinningViewProps } from './ExpoScreenPinning.types';

const NativeView: React.ComponentType<ExpoScreenPinningViewProps> =
  requireNativeView('ExpoScreenPinning');

export default function ExpoScreenPinningView(props: ExpoScreenPinningViewProps) {
  return <NativeView {...props} />;
}
