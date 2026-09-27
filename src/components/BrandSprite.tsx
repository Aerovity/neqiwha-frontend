import { BRAND_DEFS } from './brandDefs';

/**
 * All brand gradients, masks and symbols (ids `nq-*`). Mounted once in AppFrame; everything else uses
 * `<use href="#nq-b3"/>`. Not `display:none`: gradients inside a hidden SVG stop rendering in some browsers.
 */
export function BrandSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs dangerouslySetInnerHTML={{ __html: BRAND_DEFS }} />
    </svg>
  );
}
