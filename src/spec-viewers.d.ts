/** docs/files 내 JSX spec-viewer 모듈 타입 선언 */
declare module '../docs/files/*.jsx' {
  import { ComponentType } from 'react';
  const Component: ComponentType;
  export default Component;
}
