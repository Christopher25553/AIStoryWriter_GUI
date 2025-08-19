import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { StoryListComponent } from './components/story-list.component';
import { BookComponent } from './components/book.component';
import {provideHttpClient} from "@angular/common/http";
import {MarkdownModule, provideMarkdown} from "ngx-markdown";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StoryListComponent, BookComponent],
  template: `
    <div class="app-container">
      <div class="sidebar">
        <app-story-list></app-story-list>
      </div>
      <div class="main-content">
        <app-book></app-book>
      </div>
    </div>
  `,
  styles: [`
      .app-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          height: 100vh;
          overflow: hidden;
      }

      .main-content {
          overflow: hidden;
      }

      @media (max-width: 768px) {
          .app-container {
              grid-template-columns: 1fr;
              grid-template-rows: auto 1fr;
              height: 100vh;
          }

          .sidebar {
              border-right: none;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
      }

      @media (max-width: 480px) {
          .app-container {
              grid-template-rows: 200px 1fr;
          }
      }
  `]
})
export class App {}

bootstrapApplication(App, {
    providers: [
        MarkdownModule,
        provideHttpClient(),
        provideAnimations(),
        provideAnimationsAsync(),
    ]
});