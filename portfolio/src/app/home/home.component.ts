import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { SkillsComponent } from '../skills/skills.component';
import { FrontendShowcaseComponent } from '../frontend-showcase/frontend-showcase.component';
import { BackendSummaryComponent } from '../backend-summary/backend-summary.component';
import { DevopsComponent } from '../devops/devops.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, SkillsComponent, FrontendShowcaseComponent, BackendSummaryComponent, DevopsComponent],
  template: `
    <app-hero></app-hero>
    <app-skills></app-skills>
    <app-frontend-showcase></app-frontend-showcase>
    <app-backend-summary></app-backend-summary>
    <app-devops></app-devops>

    <!-- Contact -->
    <section id="contact" class="contact-section">
      <div class="section">
        <div class="divider"></div>
        <h2 class="section-title">Get in <span>Touch</span></h2>
        <p class="section-subtitle">Available for collaboration and new opportunities</p>
        <div class="contact-grid">
          <a class="contact-card" href="mailto:victor.magdici@gmail.com">
            <span class="contact-icon">✉</span>
            <span class="contact-label">Email</span>
            <span class="contact-value">victor.magdici&#64;gmail.com</span>
          </a>
          <a class="contact-card" href="https://github.com/magdick" target="_blank">
            <span class="contact-icon">⬡</span>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">github.com/magdick</span>
          </a>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <p>© 2026 Magdici Victor · Built with Angular</p>
    </footer>
  `,
  styles: [`
    .contact-section {
      background: #161b22;
      border-top: 1px solid #30363d;
    }

    .contact-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .contact-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 48px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 12px;
      text-decoration: none;
      color: #e6edf3;
      transition: border-color 0.2s, transform 0.2s;
      gap: 8px;

      &:hover {
        border-color: #00bfa5;
        transform: translateY(-4px);
      }

      .contact-icon { font-size: 2rem; }
      .contact-label { color: #8b949e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
      .contact-value { font-size: 1rem; color: #00bfa5; }
    }

    .site-footer {
      text-align: center;
      padding: 24px;
      color: #484f58;
      font-size: 0.85rem;
      border-top: 1px solid #21262d;
    }
  `]
})
export class HomeComponent {}
