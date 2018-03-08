import { Container } from './container';
import { TinyStatePlugin, TINY_STATE_PLUGINS } from './plugin';
import { Inject, SkipSelf, Optional, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export type ContainerInstanceMap = Map<string, Container<any>>;

/**
 * @internal
 */
export class RootContainer implements OnDestroy {
  private readonly _containers = new BehaviorSubject<ContainerInstanceMap>(
    new Map<string, Container<any>>()
  );
  private _plugins: TinyStatePlugin[];
  private _combinedStateSubscription: Subscription = new Subscription();

  constructor(
    @Optional()
    @Inject(TINY_STATE_PLUGINS)
    plugins: TinyStatePlugin[] | null,
    @SkipSelf()
    @Optional()
    rootContainer: RootContainer
  ) {
    if (rootContainer) {
      throw new Error('TinyState: Multiple instances of RootContainer found!');
    }
    this._plugins = Array.isArray(plugins) ? plugins : [];
    this._assignCombinedState();
  }

  private _assignCombinedState() {
    this._combinedStateSubscription = this._containers
      .pipe(switchMap(containers => this._getCombinedState(containers)))
      .pipe(
        map(states =>
          states.reduce(
            (acc, curr) => {
              acc[curr.containerName] = curr.state;
              return acc;
            },
            <{ [key: string]: any }>{}
          )
        )
      )
      .subscribe(c => {
        for (const plugin of this._plugins) {
          plugin.handleNewState(c);
        }
      });
  }

  private _getCombinedState(containers: ContainerInstanceMap) {
    return combineLatest(
      ...Array.from(containers.entries()).map(([containerName, container]) => {
        return container.select(s => s).pipe(map(state => ({ containerName, state })));
      })
    );
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this._combinedStateSubscription.unsubscribe();
  }

  /**
   * @internal
   */
  registerContainer(container: Container<any>) {
    const containers = new Map(this._containers.value);
    if (containers.has(container.getContainerInstanceId())) {
      throw new Error(
        `TinyState: Container with duplicate instance ID found! ${container.getContainerInstanceId()}` +
          ` is already registered. Please check your getContainerInstanceId() methods!`
      );
    }
    containers.set(container.getContainerInstanceId(), container);
    this._containers.next(containers);
  }

  /**
   * @internal
   */
  unregisterContainer(container: Container<any>) {
    const containers = new Map(this._containers.value);
    containers.delete(container.getContainerInstanceId());
    this._containers.next(containers);
  }
}
