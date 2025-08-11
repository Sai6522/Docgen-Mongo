import React from 'react';
import {
  // Navigation Icons
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  
  // Action Icons
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  
  // Status Icons
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  BellIcon,
  StarIcon,
  
  // UI Icons
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  KeyIcon,
  LockClosedIcon,
  LockOpenIcon,
  
  // Document Icons
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  ArchiveBoxIcon,
  PaperClipIcon,
  
  // Communication Icons
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  
  // Data Icons
  ChartBarIcon,
  ChartPieIcon,
  TableCellsIcon,
  ListBulletIcon,
  
  // Arrow Icons
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import {
  // Solid versions for active states
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
} from '@heroicons/react/24/solid';

// Icon registry for easy access and management
export const ICONS = {
  // Navigation
  home: HomeIcon,
  'home-solid': HomeIconSolid,
  document: DocumentTextIcon,
  'document-solid': DocumentTextIconSolid,
  'document-duplicate': DocumentDuplicateIcon,
  clipboard: ClipboardDocumentListIcon,
  'clipboard-check': ClipboardDocumentCheckIcon,
  users: UserGroupIcon,
  user: UserCircleIcon,
  'user-solid': UserCircleIconSolid,
  logout: ArrowRightOnRectangleIcon,
  menu: Bars3Icon,
  close: XMarkIcon,
  
  // Actions
  plus: PlusIcon,
  edit: PencilIcon,
  delete: TrashIcon,
  download: DocumentArrowDownIcon,
  view: EyeIcon,
  upload: ArrowUpTrayIcon,
  share: ShareIcon,
  print: PrinterIcon,
  
  // Status
  success: CheckCircleIcon,
  'success-solid': CheckCircleIconSolid,
  error: XCircleIcon,
  'error-solid': XCircleIconSolid,
  warning: ExclamationTriangleIcon,
  'warning-solid': ExclamationTriangleIconSolid,
  info: InformationCircleIcon,
  'info-solid': InformationCircleIconSolid,
  clock: ClockIcon,
  bell: BellIcon,
  star: StarIcon,
  
  // UI
  search: MagnifyingGlassIcon,
  filter: FunnelIcon,
  settings: Cog6ToothIcon,
  adjustments: AdjustmentsHorizontalIcon,
  key: KeyIcon,
  lock: LockClosedIcon,
  unlock: LockOpenIcon,
  
  // Documents
  file: DocumentIcon,
  folder: FolderIcon,
  'folder-open': FolderOpenIcon,
  archive: ArchiveBoxIcon,
  attachment: PaperClipIcon,
  
  // Communication
  email: EnvelopeIcon,
  chat: ChatBubbleLeftRightIcon,
  phone: PhoneIcon,
  
  // Data
  'chart-bar': ChartBarIcon,
  'chart-pie': ChartPieIcon,
  table: TableCellsIcon,
  list: ListBulletIcon,
  
  // Arrows
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
};

// Icon sizes configuration
export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
  '3xl': 'h-12 w-12',
};

// Icon color themes
export const ICON_THEMES = {
  default: 'text-gray-500',
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  white: 'text-white',
  black: 'text-black',
};

// Interactive states
export const ICON_STATES = {
  default: '',
  hover: 'hover:text-primary-700 transition-colors duration-200',
  active: 'text-primary-800',
  disabled: 'text-gray-300 cursor-not-allowed',
  loading: 'animate-spin',
};

/**
 * Flexible Icon Component
 * Supports all registered icons with customizable size, color, and interactive states
 */
export const Icon = ({ 
  name, 
  size = 'md', 
  theme = 'default', 
  state = 'default',
  className = '',
  onClick,
  title,
  ...props 
}) => {
  const IconComponent = ICONS[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon registry`);
    return null;
  }

  const sizeClass = ICON_SIZES[size] || ICON_SIZES.md;
  const themeClass = ICON_THEMES[theme] || ICON_THEMES.default;
  const stateClass = ICON_STATES[state] || '';
  
  const combinedClassName = `${sizeClass} ${themeClass} ${stateClass} ${className}`.trim();

  return (
    <IconComponent
      className={combinedClassName}
      onClick={onClick}
      title={title}
      {...props}
    />
  );
};

/**
 * Interactive Icon Button Component
 * Combines icon with button functionality and hover effects
 */
export const IconButton = ({
  icon,
  size = 'md',
  theme = 'default',
  variant = 'ghost',
  disabled = false,
  loading = false,
  onClick,
  title,
  children,
  className = '',
  ...props
}) => {
  const buttonVariants = {
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const buttonClass = `
    inline-flex items-center justify-center
    p-2 rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    ${buttonVariants[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClass}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      <Icon
        name={loading ? 'clock' : icon}
        size={size}
        theme={variant === 'ghost' ? theme : 'white'}
        state={loading ? 'loading' : 'default'}
      />
      {children && <span className="ml-2">{children}</span>}
    </button>
  );
};

/**
 * Status Icon Component
 * Specialized component for status indicators
 */
export const StatusIcon = ({ status, size = 'md', showText = false, className = '' }) => {
  const statusConfig = {
    success: { icon: 'success-solid', theme: 'success', text: 'Success' },
    error: { icon: 'error-solid', theme: 'error', text: 'Error' },
    warning: { icon: 'warning-solid', theme: 'warning', text: 'Warning' },
    info: { icon: 'info-solid', theme: 'info', text: 'Info' },
    pending: { icon: 'clock', theme: 'secondary', text: 'Pending' },
  };

  const config = statusConfig[status] || statusConfig.info;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Icon
        name={config.icon}
        size={size}
        theme={config.theme}
      />
      {showText && (
        <span className={`ml-2 text-sm font-medium text-${config.theme.replace('text-', '')}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

/**
 * Animated Icon Component
 * Supports various animations
 */
export const AnimatedIcon = ({ 
  name, 
  animation = 'none', 
  size = 'md', 
  theme = 'default',
  className = '',
  ...props 
}) => {
  const animations = {
    none: '',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    ping: 'animate-ping',
    wiggle: 'animate-wiggle', // Custom animation (needs to be defined in CSS)
  };

  const animationClass = animations[animation] || '';

  return (
    <Icon
      name={name}
      size={size}
      theme={theme}
      className={`${animationClass} ${className}`}
      {...props}
    />
  );
};

/**
 * Icon with Badge Component
 * Shows an icon with a notification badge
 */
export const IconWithBadge = ({ 
  icon, 
  badgeCount, 
  size = 'md', 
  theme = 'default',
  badgeColor = 'red',
  className = '',
  ...props 
}) => {
  const badgeColors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <Icon name={icon} size={size} theme={theme} {...props} />
      {badgeCount > 0 && (
        <span className={`
          absolute -top-1 -right-1
          inline-flex items-center justify-center
          px-1.5 py-0.5
          text-xs font-bold leading-none
          text-white
          ${badgeColors[badgeColor]}
          rounded-full
          transform translate-x-1/2 -translate-y-1/2
        `}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </div>
  );
};

export default Icon;
