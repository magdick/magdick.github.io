import { Component, signal } from'@angular/core';
import { NgClass } from'@angular/common';

export interface FrontendProject {
 id: string;
 title: string;
 description: string;
 tags: string[];
 demoType: string;
}

@Component({
 selector:'app-frontend-showcase',
 imports: [NgClass],
 templateUrl:'./frontend-showcase.component.html',
 styleUrl:'./frontend-showcase.component.scss'
})
export class FrontendShowcaseComponent {
 activeProject = signal<string>('advertiser-portal');

 projects: FrontendProject[] = [
 {
 id:'advertiser-portal',
 title:'Advertiser SPA — Angular 20 from Scratch',
 description:'Built the entire Advertiser Portal as a new Angular 20 standalone application from scratch inside the existing monorepo. Includes Angular Material UI with custom theme, reactive auth guard, CSP-compliant self-hosted Material Symbols fonts (woff2), HTTP interceptors for CSRF tokens, maintenance mode, error handling, a loader indicator, and PM2 ecosystem config for process management.',
 tags: ['Angular 20','Standalone Components','Angular Material','Signals','CSP','HTTP Interceptors','PM2','Lazy Loading','SCSS'],
 demoType:'advertiser-portal'
 },
 {
 id:'transactions',
 title:'Transactions Listing & Edit Form',
 description:'Fully reactive transactions page: accordion filter panel with date-range / year / month selectors, ad-type select with lazy sub-selects, product/group pickers, export dialog (email-to-Excel), edit form with update-status workflow, snackbar feedback for all actions, disabled state for committed/cancelled entries, and Countdown column calculation. Resolved async timing race conditions in filter rendering.',
 tags: ['Angular Material','Reactive Forms','mat-table','mat-accordion','mat-datepicker','Export','Snackbar','Race Condition Fix'],
 demoType:'transactions'
 },
 {
 id:'angular-migrations',
 title:'Angular Schematic Migrations — Partner Portal',
 description:'Ran and adjusted all Angular schematic migrations on the partner portal frontend (two apps: freenet + klarmobil): @NgModule → standalone components, *ngIf/*ngFor → @if/@for control flow syntax, constructor injection → inject() function, input() signals, and self-closing tags. Manually corrected all migration artifacts and updated SCSS.',
 tags: ['Angular Schematics','Standalone Migration','@if / @for','inject()','Signal Inputs','Self-closing Tags','SCSS Fix'],
 demoType:'angular-migrations'
 },
 {
 id:'responsive-nav',
 title:'Responsive Header & Mobile Navigation',
 description:'Angular Material responsive header: desktop nav with routerLinkActive highlighting, mobile mat-sidenav burger menu, user info display (username + partner ID), logout button triggering API call, and CSP-compliant SVG logo using xlink:href. Handles backdrop click dismiss, route-driven active states, and conditionally renders based on auth signal.',
 tags: ['Angular Material','mat-sidenav','Responsive','routerLinkActive','SVG','Auth Signal','CSP'],
 demoType:'responsive-nav'
 },
 {
 id:'partner-profile',
 title:'Partner Portal — Inject() Refactor + UX Fixes',
 description:'Migrated all constructor-injected services to the inject() function (Angular 17+ style) across the partner portal. Fixed module loading order causing blank screens, improved filter-form component with SubID field, added is-active guard check before enabling actions, and fixed logout behavior to not affect in-flight HTTP requests.',
 tags: ['Angular 17+','inject()','Route Guards','Filter Form','Is-Active Check','Logout Fix','RxJS'],
 demoType:'partner-profile'
 },
 {
 id:'partner-auth',
 title:'Partner Portal — Auth System Integration',
 description:'Implemented login via the new internal authentication system in the partner portal Angular app. Built a VitradoHttpClient interface + implementation, wired up the Authenticator and SimpleJwt libs, added a GetLoginLink endpoint with a configurable default login URL, handled unauthorized 401 responses, auto-logout previous session on new token, and removed the old deprecated magic link flow.',
 tags: ['Angular','JWT','HTTP Client','Auth Flow','REST API','TypeScript'],
 demoType:'partner-auth'
 },
 {
 id:'superuser-reports',
 title:'Superuser Reports — Deeplinks, AWIN & Receipts',
 description:'Three reporting features: (1) affiliate program deeplink saving to program list with regex validation + PHPUnit tests; (2) AWIN API integration in the superuser Reports Angular component (new report type constants, updated PartnerProfileService +200 lines, conditional HTML); (3) multi-format receipt date parsing with timezone handling.',
 tags: ['Angular','Superuser App','TypeScript','AWIN API','Deeplinks','Regex','PHPUnit','Multi-format Date'],
 demoType:'superuser-reports'
 },
 {
 id:'website-angular-upgrade',
 title:'Company Website — Angular v8 → v18 Full Upgrade',
 description:'Drove the complete sequential Angular upgrade of the CMS admin app from v8 through every major version up to v18. Each step updated core packages, Angular Material, tsconfig, browserslist, and build paths. Ran the Material MDC migration (component DOM structure overhaul), converted all modules to standalone components, removed deprecated polyfills and Protractor, migrated from tslint to ESLint, and added routing titles. Also implemented a sorting and multi-select filter component, updated the styleguide vendor files, and refactored the auth guard to a cleaner testable structure.',
 tags: ['Angular v8–v18','Angular Material','MDC Migration','Standalone Components','ESLint','tslint removal','Protractor removal','ng update','SCSS'],
 demoType:'website-angular-upgrade'
 },
 {
 id:'partner-portal-spa',
 title:'Partner Portal — Multi-Brand SPA (freenet + klarmobil)',
 description:'Built the full multi-brand Angular partner portal for the partner loyalty programme from scratch, serving two separate brands (freenet and klarmobil) from a single monorepo with a shared component library. Implemented the complete auth flow: AuthGuard, UserGuard, XSRF, ReturnLoginComponent for OAuth2 callback. Built layout, homepage, MenuService, user-menu with ping-based session validity, user profile with personal data + bank data forms (IBAN validation), bonuses list, bonus-details, filter-form, and copy-to-clipboard components. Ran all Angular schematic migrations: standalone, inject(), control flow (@if/@for), signal inputs, self-closing tags.',
 tags: ['Angular','Multi-brand','Shared Library','OAuth2','AuthGuard','Reactive Forms','IBAN','Angular Material','Standalone Migration'],
 demoType:'partner-portal-spa'
 },
 {
 id:'checkout-branding',
 title:'Checkout Flow — Multi-Brand UI & CSP Hardening',
 description:'Ongoing Angular + PHP work on the freenet/klarmobil checkout flow across 40+ branches: brand colour tuning ( freenet green, logo), per-tag custom domain routing, empty-field validation fix, Google Tag Manager domain + CSP update, klarmobil offer expiry date background colour, crash tariff unlock input fix, and tabindex accessibility for keyboard navigation.',
 tags: ['Angular','TypeScript','SCSS','Multi-brand','CSP','freenet','klarmobil','PHP','Phalcon'],
 demoType:'checkout-branding'
 }
 ];

 select(id: string) {
 this.activeProject.set(id);
 }

 get active(): FrontendProject {
 return this.projects.find(p => p.id === this.activeProject()) ?? this.projects[0];
 }
}
