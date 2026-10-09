import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { LayoutShellComponent } from './layout-shell.component';

describe('LayoutShellComponent', () => {
  let component: LayoutShellComponent;
  let fixture: ComponentFixture<LayoutShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideRouter([]), provideHttpClient(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create layout shell component', () => {
    expect(component).toBeTruthy();
  });
});
