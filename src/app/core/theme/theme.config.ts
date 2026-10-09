import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Cấu hình Theme Preset cho Hệ thống Quản trị Nhà xe Đông Lý.
 * Kế thừa Aura Preset của PrimeNG và tùy biến Primary Palette sang Blue (#2563eb)
 * nhằm đồng nhất với nhận diện thương hiệu Đông Lý.
 */
export const DongLyThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{blue.600}',
          contrastColor: '#ffffff',
          hoverColor: '{blue.700}',
          activeColor: '{blue.800}',
        },
      },
    },
  },
});
