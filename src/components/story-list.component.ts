import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryService } from '../services/story.service';
import { Story } from '../models/story.model';

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="story-list-container">
      <h2 class="story-list-title">Geschichten</h2>
      <div class="story-list">
        <div 
          *ngFor="let story of stories; trackBy: trackByTitle"
          class="story-item"
          [class.selected]="isSelected(story)"
          (click)="selectStory(story)"
        >
          <div class="story-item-content">
            <h3 class="story-title">{{ story.storyTitle }}</h3>
            <p class="story-info">{{ story.scenes.length }} Szenen</p>
          </div>
          <div class="story-item-arrow">→</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
      .story-list-container {
          padding: 2rem 1.5rem;
          height: 100vh;
          overflow-y: auto;
          /*border-right: 1px solid rgba(255, 255, 255, 0.1);*/
          /*background: linear-gradient(135deg, #2d1b69, #11998e);*/
          background-image: url("./../assets/wood.jpg");
      }
      
      .story-list-title {
          color: #FFD090;
          font-size: 2.2rem;
          font-weight: 700;
          padding: 0 2rem;
          margin-bottom: 2rem;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .story-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
      }

      .story-item {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          /*border: 1px solid rgba(255, 255, 255, 0.2);*/
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
      }

      .story-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
      }

      .story-item:hover::before {
          left: 100%;
      }

      .story-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .story-item.selected {
          background: rgba(255, 215, 0, 0.2);
          /*border-color: rgba(255, 215, 0, 0.5);*/
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
      }

      .story-item-content {
          flex: 1;
      }

      .story-title {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .story-info {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
      }

      .story-item-arrow {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
          transition: all 0.3s ease;
      }

      .story-item:hover .story-item-arrow {
          color: white;
          transform: translateX(4px);
      }

      .story-item.selected .story-item-arrow {
          color: #ffd700;
      }

      @media (max-width: 768px) {
          .story-list-container {
              padding: 1rem;
              height: auto;
          }

          .story-item {
              padding: 1rem;
          }

          .story-title {
              font-size: 1.1rem;
          }
      }
  `]
})
export class StoryListComponent implements OnInit {
  stories: Story[] = [];
  selectedStory: Story | null = null;

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {
    this.stories = this.storyService.getStories();
    
    this.storyService.selectedStory$.subscribe(story => {
      this.selectedStory = story;
    });
  }

  selectStory(story: Story): void {
    this.storyService.selectStory(story);
  }

  isSelected(story: Story): boolean {
    return this.selectedStory?.storyTitle === story.storyTitle;
  }

  trackByTitle(index: number, story: Story): string {
    return story.storyTitle;
  }
}