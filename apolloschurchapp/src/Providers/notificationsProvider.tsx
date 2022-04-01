import React from 'react'
import { NotificationsProvider as BaseNotificationsProvider } from '@apollosproject/ui-notifications';
import { get } from 'lodash';
import { EventEmitter } from 'events';

interface NotificationEventsContext {
  emitter: EventEmitter
}

const Ctx = React.createContext<NotificationEventsContext>({
  emitter: new EventEmitter()
})

export class NotificationsProvider extends BaseNotificationsProvider {
  private readonly emitter = new EventEmitter();

  constructor(props: any) {
    super(props);
  }

  onOpened = (openResult: any) => {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
    // URL looks like this
    // apolloschurchapp://AppStackNavigator/Connect
    // apolloschurchapp://SomethingElse/Connect
    // apolloschurchapp://SomethingElse/ContentSingle?itemId=SomeItemId:blablalba
    const url = get(openResult, 'notification.payload.additionalData.url');
    if (
      openResult?.action?.actionID &&
      this.props.actionMap[openResult.action.actionID]
    ) {
      this.props.actionMap[openResult.action.actionID](
        openResult.notification.payload.additionalData
      );
    } else if (url) {
      this.navigate(url);
    }

    this.emitter.emit('opened', openResult)
  };

  render() {
    const rendered = super.render();

    return <Ctx.Provider value={{ emitter: this.emitter }}>
        {rendered}
      </Ctx.Provider>
  }
}

/**
 * Hooks a listener up to the 'opened' event of OneSignal, and removes the listener
 * when the component unmounts.
 */
export function useNotificationOpenedEffect(effect: (openResult: any) => void, deps?: React.DependencyList) {
  const {emitter} = React.useContext(Ctx)

  React.useEffect(() => {
    emitter.on('opened', effect)

    return () => { emitter.off('opened', effect) }
  }, [...(deps || []), emitter])
}
