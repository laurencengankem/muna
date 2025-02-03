import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, DetachedRouteHandle } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppRouteReuseStrategy extends BaseRouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  private reusableRoutes = new Set(['products']); // Add routes you want to cache

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.reusableRoutes.has(route.routeConfig.path!);
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (handle && route.routeConfig) {
      this.storedRoutes.set(route.routeConfig.path!, handle);
    }
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.storedRoutes.has(route.routeConfig.path!);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return route.routeConfig ? this.storedRoutes.get(route.routeConfig.path!) || null : null;
  }
}
