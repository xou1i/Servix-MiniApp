import { useState } from 'react';

export function useRole() {
  const [role, setRoleState] = useState(() => sessionStorage.getItem('servix_role') || '');

  const setRole = (r) => {
    sessionStorage.setItem('servix_role', r);
    setRoleState(r);
  };

  const logout = () => {
    sessionStorage.removeItem('servix_role');
    setRoleState('');
  };

  return { role, setRole, logout };
}
