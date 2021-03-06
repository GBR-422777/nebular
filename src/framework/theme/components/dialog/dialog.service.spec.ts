import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NbOverlayContainerAdapter, NbOverlayModule, NbOverlayService } from '../cdk';
import { NbDialogService } from './dialog.service';
import { NbDialogModule } from './dialog.module';
import { NbThemeModule } from '../../theme.module';
import { NB_DOCUMENT } from '../../theme.options';


@Component({ selector: 'nb-test-dialog', template: '<button class="test-focusable-button"></button>' })
class NbTestDialogComponent {
}

@NgModule({
  declarations: [NbTestDialogComponent],
  entryComponents: [NbTestDialogComponent],
})
class NbTestDialogModule {
}


describe('dialog-service', () => {
  let dialog: NbDialogService;
  let overlayContainerService: NbOverlayContainerAdapter;
  let overlayContainer: HTMLElement;
  let overlayService: NbOverlayService;
  let document: Document;

  const queryBackdrop = () => overlayContainer.querySelector('.overlay-backdrop');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NbTestDialogModule,
        NbThemeModule.forRoot({ name: 'default' }),
        NbDialogModule.forRoot(),
        NbOverlayModule.forRoot(),
      ],
    });

    dialog = TestBed.get(NbDialogService);
    overlayContainerService = TestBed.get(NbOverlayContainerAdapter);
    document = TestBed.get(NB_DOCUMENT);
    overlayService = TestBed.get(NbOverlayService);
  });

  beforeEach(() => {
    overlayContainer = document.createElement('div');
    overlayContainerService.setContainer(overlayContainer);
  });

  afterAll(() => {
    overlayContainerService.clearContainer();
  });

  it('should render dialog', () => {
    const ref = dialog.open(NbTestDialogComponent);
    expect(ref.componentRef).toBeTruthy();
    expect(ref.componentRef.instance instanceof NbTestDialogComponent).toBeTruthy();
  });

  it('should assign default backdropClass', () => {
    dialog.open(NbTestDialogComponent);
    expect(queryBackdrop()).toBeTruthy();
  });

  it('should assign backdropClass if provided', () => {
    dialog.open(NbTestDialogComponent, { backdropClass: 'nb-overlay-test-backdrop-class' });
    expect(overlayContainer.querySelector('.nb-overlay-test-backdrop-class')).toBeTruthy();
  });


  it('should render with backdrop if hasBackdrop is true', () => {
    dialog.open(NbTestDialogComponent, { hasBackdrop: true });
    expect(queryBackdrop()).toBeTruthy();
  });

  it('should render without backdrop if hasBackdrop is false', () => {
    dialog.open(NbTestDialogComponent, { hasBackdrop: false });
    expect(queryBackdrop()).toBeFalsy();
  });

  it('should leave capability scroll content under dialog if hasScroll is true', () => {
    const noopSpy = spyOn(overlayService.scrollStrategies, 'noop');
    const blockSpy = spyOn(overlayService.scrollStrategies, 'block');

    dialog.open(NbTestDialogComponent, { hasScroll: true });

    expect(noopSpy).toHaveBeenCalledTimes(1);
    expect(blockSpy).toHaveBeenCalledTimes(0);
  });

  it('should disable scroll under dialog if hasScroll is false', () => {
    const noopSpy = spyOn(overlayService.scrollStrategies, 'noop');
    const blockSpy = spyOn(overlayService.scrollStrategies, 'block');

    dialog.open(NbTestDialogComponent, { hasScroll: false });

    expect(noopSpy).toHaveBeenCalledTimes(0);
    expect(blockSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire onBackdropClick if backdrop was clicked', done => {
    const ref = dialog.open(NbTestDialogComponent, { closeOnBackdropClick: false });
    const backdrop = queryBackdrop();

    ref.onBackdropClick.subscribe(e => {
      expect(e.target).toBe(backdrop);
      done();
    });

    backdrop.dispatchEvent(new Event('click'));
  });

  it('should not fire onBackdropClick if backdrop wasn\'t clicked', () => {
    const ref = dialog.open(NbTestDialogComponent, { closeOnBackdropClick: false });
    const spy = jasmine.createSpy();
    ref.onBackdropClick.subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should close on backdrop click if closeOnBackdropClick is true', () => {
    dialog.open(NbTestDialogComponent, { closeOnBackdropClick: true, autoFocus: false });
    queryBackdrop().dispatchEvent(new Event('click'));
    expect(queryBackdrop()).toBeFalsy();
  });

  it('should not close on backdrop click if closeOnBackdropClick is false', () => {
    dialog.open(NbTestDialogComponent, { closeOnBackdropClick: false });
    queryBackdrop().dispatchEvent(new Event('click'));
    expect(queryBackdrop()).toBeTruthy();
  });

  it('should close on escape press if closeOnEsc is true', () => {
    dialog.open(NbTestDialogComponent, { closeOnEsc: true });
    document.dispatchEvent(new KeyboardEvent('keyup', <any> { keyCode: 27 }));
    expect(queryBackdrop()).toBeFalsy();
  });

  it('should not close on escape press if closeOnEsc is false', () => {
    dialog.open(NbTestDialogComponent, { closeOnEsc: false });
    document.dispatchEvent(new KeyboardEvent('keyup', <any> { keyCode: 27 }));
    expect(queryBackdrop()).toBeTruthy();
  });
});

