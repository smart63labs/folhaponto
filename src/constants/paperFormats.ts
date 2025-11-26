import { PaperFormat } from '../types/formBuilder';

export const PAPER_FORMATS: PaperFormat[] = [
  {
    name: 'A4',
    width: 210,
    height: 297,
    orientation: 'portrait'
  },
  {
    name: 'A4 Paisagem',
    width: 297,
    height: 210,
    orientation: 'landscape'
  },
  {
    name: 'A3',
    width: 297,
    height: 420,
    orientation: 'portrait'
  },
  {
    name: 'A3 Paisagem',
    width: 420,
    height: 297,
    orientation: 'landscape'
  },
  {
    name: 'Carta',
    width: 216,
    height: 279,
    orientation: 'portrait'
  },
  {
    name: 'Carta Paisagem',
    width: 279,
    height: 216,
    orientation: 'landscape'
  },
  {
    name: 'Ofício',
    width: 216,
    height: 356,
    orientation: 'portrait'
  },
  {
    name: 'Ofício Paisagem',
    width: 356,
    height: 216,
    orientation: 'landscape'
  }
];

export const DEFAULT_PAPER_FORMAT = PAPER_FORMATS[0]; // A4 Portrait

export const DEFAULT_MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

export const DEFAULT_HEADER_FOOTER_CONFIG = {
  header: {
    enabled: false,
    logoPosition: 'left' as const,
    height: 30
  },
  footer: {
    enabled: false,
    logoPosition: 'left' as const,
    showPageNumber: true,
    height: 20
  }
};