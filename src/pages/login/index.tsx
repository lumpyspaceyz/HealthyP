import { Outlet } from 'react-router-dom';

export { Login } from './Login';
export { Welcome } from './Welcome';

export function LoginLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
