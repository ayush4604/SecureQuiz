import * as React from 'react';

import { ExpoScreenPinningViewProps } from './ExpoScreenPinning.types';

export default function ExpoScreenPinningView(props: ExpoScreenPinningViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
