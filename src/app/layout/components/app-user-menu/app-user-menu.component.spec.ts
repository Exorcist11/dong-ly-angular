import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppUserMenuComponent } from './app-user-menu.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('AppUserMenuComponent', () => {
  let component: AppUserMenuComponent;
  let fixture: ComponentFixture<AppUserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUserMenuComponent],
      providers: [provideRouter([]), provideHttpClient(), AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create app user menu component', () => {
    expect(component).toBeTruthy();
  });

  it('should render user initial and button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.user-card-btn');
    expect(btn).toBeTruthy();
    expect(component.userInitial()).toBeDefined();
  });

  it('should toggle menu on click', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.user-card-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    fixture.detectChanges();
    expect(component.menuItems.length).toBeGreaterThan(0);
  });
});
