import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const DongLyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FDECEC',
      100: '#FAD1D3',
      200: '#F5A3A7',
      300: '#EE7479',
      400: '#E4454C',
      500: '#D71920',
      600: '#B9131A',
      700: '#A50F16',
      800: '#7F0B11',
      900: '#5A080C',
      950: '#3A0508',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#FFFFFF',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          color: '{primary.700}',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F7F5F1',
          100: '#F4F1EC',
          200: '#E8E4DD',
          300: '#D9D4CC',
          400: '#A09B93',
          500: '#8A857D',
          600: '#6B665F',
          700: '#3A3733',
          800: '#26262D',
          900: '#16161A',
          950: '#0E0E11',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '#FFFFFF',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'rgba(215, 25, 32, 0.16)',
          color: '{primary.400}',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F4F1EC',
          100: '#E8E4DD',
          200: '#D9D4CC',
          300: '#A09B93',
          400: '#8A857D',
          500: '#6B665F',
          600: '#3A3733',
          700: '#26262D',
          800: '#17171C',
          900: '#121216',
          950: '#0E0E11',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '10px',
        paddingY: '0.625rem',
      },
    },
    card: {
      root: {
        borderRadius: '16px',
        shadow: '0 1px 2px rgba(22,22,26,.04)',
      },
      body: {
        padding: '1.25rem',
      },
    },
    inputtext: {
      root: {
        borderRadius: '10px',
      },
    },
    datatable: {
      header: {
        background: 'transparent',
      },
      bodyCell: {
        padding: '1rem 1.25rem',
      },
    },
    tag: {
      root: {
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '600',
      },
    },
  },
});
