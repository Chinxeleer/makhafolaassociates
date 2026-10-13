export interface PageModule {
  init(container: HTMLElement): void;
  destroy(): void;
}
