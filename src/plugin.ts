import { InjectionToken } from '@angular/core';

export abstract class TinyStatePlugin {
  abstract handleNewState(state: Readonly<object>): void;
}
/**
 * TINY_STATE_PLUGINS is used as a multi provider in Angular.
 */
export const TINY_STATE_PLUGINS = new InjectionToken<Plugin>('TINY_STATE_PLUGINS');
