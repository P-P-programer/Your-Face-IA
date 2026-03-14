import { 
  IconHome, 
  IconStatus, 
  IconHistory, 
  IconSettings, 
  IconShield 
} from '../components/Icons';

export const navItems = [
  { to: '/', label: 'Inicio', icon: IconHome, roles: ['user', 'admin', 'super_admin'] },
  { to: '/devices', label: 'Mis Dispositivos', icon: IconStatus, roles: ['user', 'admin', 'super_admin'] },
  { to: '/connections', label: 'Mi Historial', icon: IconHistory, roles: ['user', 'admin', 'super_admin'] },

  { to: '/tokens/request', label: 'Solicitar Token ESP32', icon: IconSettings, roles: ['user', 'admin', 'super_admin'] },
  { to: '/tokens/revocations', label: 'Revocar Tokens', icon: IconHistory, roles: ['user', 'admin', 'super_admin'] },

  { to: '/admin/connections', label: 'Auditoría Admin', icon: IconShield, roles: ['super_admin'] },
  { to: '/admin/token-requests', label: 'Aprobar Tokens', icon: IconShield, roles: ['super_admin'] },
  { to: '/admin/revocation-requests', label: 'Revocaciones', icon: IconShield, roles: ['super_admin'] },
];