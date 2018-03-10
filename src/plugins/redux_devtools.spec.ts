import { TestBed } from '@angular/core/testing';
import {
  ReduxDevtoolsPluginModule,
  REDUX_DEVTOOLS_PLUGIN_WINDOW,
  ReduxDevtoolsPlugin,
  ReduxDevtoolsInstance
} from './redux_devtools';
import { tinyStateVersion } from '../util';

describe('ReduxDevtoolsPluginModule', () => {
  describe('devtools available', () => {
    let windowMock: { __REDUX_DEVTOOLS_EXTENSION__: any };
    let plugin: ReduxDevtoolsPlugin;
    let devtoolsInstance: ReduxDevtoolsInstance;
    let connectFn: jest.Mock;

    beforeEach(() => {
      devtoolsInstance = { send: jest.fn() };
      connectFn = jest.fn().mockReturnValue(devtoolsInstance);
      windowMock = {
        __REDUX_DEVTOOLS_EXTENSION__: { connect: connectFn }
      };

      TestBed.configureTestingModule({
        imports: [ReduxDevtoolsPluginModule.forRoot()],
        providers: [{ provide: REDUX_DEVTOOLS_PLUGIN_WINDOW, useValue: windowMock }]
      });
      plugin = TestBed.get(ReduxDevtoolsPlugin);
    });

    it('should call the connect method with the TinyState name and version info', () => {
      expect(connectFn).toHaveBeenCalledWith({
        name: `TinyState ${tinyStateVersion()}`
      });
    });

    it('should pass the state to the redux devtools api', () => {
      const newState = { a: 1 };
      plugin.handleNewState({ ...newState });
      expect(devtoolsInstance.send).toHaveBeenCalledTimes(1);
      expect(devtoolsInstance.send).toHaveBeenCalledWith('NO_NAME', newState);
    });

    it('should not call the devtools api if were running on the server (no window available)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ReduxDevtoolsPluginModule.forRoot()],
        providers: [{ provide: REDUX_DEVTOOLS_PLUGIN_WINDOW, useValue: null }]
      });
      plugin = TestBed.get(ReduxDevtoolsPlugin);
      plugin.handleNewState({});
      expect(devtoolsInstance.send).not.toHaveBeenCalled();
    });

    it('should not call the devtools api if the devtools are not defined on the global window object', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ReduxDevtoolsPluginModule.forRoot()],
        providers: [{ provide: REDUX_DEVTOOLS_PLUGIN_WINDOW, useValue: {} }]
      });
      plugin = TestBed.get(ReduxDevtoolsPlugin);
      plugin.handleNewState({});
      expect(devtoolsInstance.send).not.toHaveBeenCalled();
    });
  });
});
