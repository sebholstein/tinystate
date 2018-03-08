import { NgModule, ModuleWithProviders } from '@angular/core';
import { RootContainer } from './root_container';

@NgModule()
export class TinyStateModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TinyStateModule,
      providers: [RootContainer]
    };
  }
}
