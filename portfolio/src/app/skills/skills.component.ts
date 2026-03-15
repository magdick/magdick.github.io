import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
}

@Component({
  selector: 'app-skills',
  imports: [MatChipsModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {
  skillGroups: SkillGroup[] = [
    {
      category: 'Frontend',
      icon: '◈',
      skills: ['Angular 17-20', 'TypeScript', 'RxJS', 'Angular Material', 'SCSS/SASS', 'Standalone Components', 'Signal Inputs', '@if/@for Control Flow', 'inject()', 'HTTP Interceptors', 'Route Guards', 'Lazy Loading']
    },
    {
      category: 'Backend',
      icon: '◉',
      skills: ['PHP 8.4', 'Phalcon Framework', 'Go (Golang)', 'REST APIs', 'PDO Prepared Statements', 'SFTP / SSH2', 'AWS SQS', 'Cron Jobs', 'Rector', 'PHPUnit', 'JWT', 'OAuth2']
    },
    {
      category: 'DevOps & CI/CD',
      icon: '◎',
      skills: ['GitHub Actions', 'Docker', 'docker-compose v2', 'Reusable Workflows', 'Docker Bake (HCL)', 'Multi-arch ARM64', 'QEMU / Buildx', 'Buildkit Secrets', 'Aikido Security Scan', 'Nginx', 'Health Checks']
    },
    {
      category: 'Infrastructure',
      icon: '◇',
      skills: ['MariaDB 11.5', 'Redis', 'Bind9 DNS', 'Podman', 'Traefik', 'Azure / SharePoint', 'CSP Headers', 'SSL/TLS PDO', 'Logrotation', 'pfSense VPN', 'Git Submodules']
    }
  ];
}
