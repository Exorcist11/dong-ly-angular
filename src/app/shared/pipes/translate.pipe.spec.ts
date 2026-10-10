import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService, TranslatePipe],
    });
    pipe = TestBed.inject(TranslatePipe);
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('nên khởi tạo TranslatePipe thành công', () => {
    expect(pipe).toBeTruthy();
  });

  it('nên dịch key bằng TranslationService', () => {
    const result = pipe.transform('common.actions.cancel');
    expect(result).toBe('Hủy bỏ');
  });

  it('nên hỗ trợ params nội suy và phản hồi khi đổi ngôn ngữ', () => {
    const resultVi = pipe.transform('auth.loginSuccess', { name: 'Đông Lý' });
    expect(resultVi).toBe('Xin chào, Đông Lý!');

    service.setLanguage('en');
    const resultEn = pipe.transform('auth.loginSuccess', { name: 'Dong Ly' });
    expect(resultEn).toBe('Welcome back, Dong Ly!');
  });
});
