import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, switchMap} from 'rxjs';
import {Story, StoryCollection} from '../models/story.model';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class StoryService {
    private selectedStorySubject = new BehaviorSubject<Story | null>(null);
    private currentSceneIndexSubject = new BehaviorSubject<number>(0);

    selectedStory$ = this.selectedStorySubject.asObservable();
    currentSceneIndex$ = this.currentSceneIndexSubject.asObservable();

    private storyData: StoryCollection = { stories: [] };

    constructor(private http: HttpClient) {
        this.loadStories().subscribe(stories => {
            this.storyData.stories.push(...stories);
        });
    }

    loadStories(): Observable<Story[]> {
        return this.http.get<string[]>('assets/stories/stories.json').pipe(
            switchMap(paths =>
                forkJoin(paths.map(p => this.http.get<Story>('assets/' + p)))
            )
        );
    }

    setStories(stories: Story[]): void {
        this.storyData.stories = stories;
    }

    getStories(): Story[] {
        return this.storyData.stories;
    }

    selectStory(story: Story): void {
        this.selectedStorySubject.next(story);
        this.currentSceneIndexSubject.next(0);
    }

    getCurrentStory(): Story | null {
        return this.selectedStorySubject.value;
    }

    getCurrentSceneIndex(): number {
        return this.currentSceneIndexSubject.value;
    }

    nextScene(): void {
        const currentStory = this.selectedStorySubject.value;
        const currentIndex = this.currentSceneIndexSubject.value;

        if (currentStory && currentIndex < currentStory.scenes.length - 1) {
            this.currentSceneIndexSubject.next(currentIndex + 1);
        }
    }

    previousScene(): void {
        const currentIndex = this.currentSceneIndexSubject.value;

        if (currentIndex > 0) {
            this.currentSceneIndexSubject.next(currentIndex - 1);
        }
    }

    canGoNext(): boolean {
        const currentStory = this.selectedStorySubject.value;
        const currentIndex = this.currentSceneIndexSubject.value;
        return currentStory ? currentIndex < currentStory.scenes.length - 1 : false;
    }

    canGoPrevious(): boolean {
        return this.currentSceneIndexSubject.value > 0;
    }
}