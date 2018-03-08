import { NgModule, ModuleWithProviders, InjectionToken, Inject } from '@angular/core';
import { TinyStatePlugin, TINY_STATE_PLUGINS } from '../plugin';
import { tinyStateVersion } from '../util';

export interface ReduxDevtoolsPluginConfig {
  enabled?: boolean; // default: true
}

export const REDUX_DEVTOOLS_PLUGIN_CONFIG = new InjectionToken<ReduxDevtoolsPluginConfig>(
  'REDUX_DEVTOOLS_PLUGIN_CONFIG'
);

export const REDUX_DEVTOOLS_PLUGIN_WINDOW = new InjectionToken<Window | null>(
  'REDUX_DEVTOOLS_PLUGIN_CONFIG'
);

export function windowFactory(): Window | null {
  return typeof window !== 'undefined' ? window : null;
}

/**
 * Adds support for the Redux Devtools Extension:
 * https://github.com/gaearon/redux-devtools
 */
@NgModule()
export class ReduxDevtoolsPluginModule {
  static forRoot(config: ReduxDevtoolsPluginConfig = {}): ModuleWithProviders {
    return {
      ngModule: ReduxDevtoolsPluginModule,
      providers: [
        ReduxDevtoolsPlugin,
        {
          provide: TINY_STATE_PLUGINS,
          useClass: ReduxDevtoolsPlugin,
          multi: true
        },
        { provide: REDUX_DEVTOOLS_PLUGIN_CONFIG, useValue: config },
        {
          provide: REDUX_DEVTOOLS_PLUGIN_WINDOW,
          useFactory: windowFactory
        }
      ]
    };
  }
}

/**
 * @internal
 */
export interface ReduxDevtoolsInstance {
  send(action: string, state: object): void;
}

export class ReduxDevtoolsPlugin implements TinyStatePlugin {
  private _devTools: ReduxDevtoolsInstance | null = null;

  constructor(
    @Inject(REDUX_DEVTOOLS_PLUGIN_CONFIG) private _config: ReduxDevtoolsPluginConfig,
    @Inject(REDUX_DEVTOOLS_PLUGIN_WINDOW) private _window: Window | null
  ) {
    if (this._window == null) {
      return;
    }
    const globalDevtools: { connect(config: any): ReduxDevtoolsInstance } | undefined =
      (this._window as any)['__REDUX_DEVTOOLS_EXTENSION__'] ||
      (this._window as any)['devToolsExtension'];

    if (!globalDevtools) {
      return;
    }
    this._devTools = globalDevtools.connect({
      name: `TinyState ${tinyStateVersion()}`
    });
  }

  handleNewState(state: object): void {
    if (this._config.enabled === false || !this._devTools) {
      return;
    }
    this._devTools.send('NO_NAME', state);
  }
}
