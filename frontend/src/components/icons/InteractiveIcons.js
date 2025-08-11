import React, { useState } from 'react';
import { Icon, IconButton, StatusIcon, AnimatedIcon, IconWithBadge } from './IconSystem';

/**
 * Toggle Icon Component
 * Switches between two icons based on state
 */
export const ToggleIcon = ({
  activeIcon,
  inactiveIcon,
  isActive,
  onToggle,
  size = 'md',
  activeTheme = 'primary',
  inactiveTheme = 'default',
  className = '',
  ...props
}) => {
  return (
    <Icon
      name={isActive ? activeIcon : inactiveIcon}
      size={size}
      theme={isActive ? activeTheme : inactiveTheme}
      className={`cursor-pointer transition-all duration-200 ${className}`}
      onClick={onToggle}
      {...props}
    />
  );
};

/**
 * Loading Icon Component
 * Shows different loading states
 */
export const LoadingIcon = ({
  type = 'spin',
  size = 'md',
  theme = 'primary',
  className = '',
  ...props
}) => {
  const loadingTypes = {
    spin: { icon: 'clock', animation: 'spin' },
    pulse: { icon: 'clock', animation: 'pulse' },
    bounce: { icon: 'arrow-up', animation: 'bounce' },
    dots: { icon: 'info', animation: 'pulse' },
  };

  const config = loadingTypes[type] || loadingTypes.spin;

  return (
    <AnimatedIcon
      name={config.icon}
      animation={config.animation}
      size={size}
      theme={theme}
      className={className}
      {...props}
    />
  );
};

/**
 * Expandable Icon Component
 * Shows expand/collapse states
 */
export const ExpandableIcon = ({
  isExpanded,
  onToggle,
  size = 'md',
  theme = 'default',
  className = '',
  ...props
}) => {
  return (
    <Icon
      name={isExpanded ? 'chevron-up' : 'chevron-down'}
      size={size}
      theme={theme}
      className={`cursor-pointer transition-transform duration-200 ${
        isExpanded ? 'transform rotate-180' : ''
      } ${className}`}
      onClick={onToggle}
      {...props}
    />
  );
};

/**
 * Sortable Icon Component
 * Shows sorting states (none, asc, desc)
 */
export const SortableIcon = ({
  sortState = 'none', // 'none', 'asc', 'desc'
  onSort,
  size = 'sm',
  className = '',
  ...props
}) => {
  const getSortIcon = () => {
    switch (sortState) {
      case 'asc':
        return { icon: 'arrow-up', theme: 'primary' };
      case 'desc':
        return { icon: 'arrow-down', theme: 'primary' };
      default:
        return { icon: 'arrow-up', theme: 'default' };
    }
  };

  const { icon, theme } = getSortIcon();

  return (
    <Icon
      name={icon}
      size={size}
      theme={theme}
      className={`cursor-pointer transition-all duration-200 hover:text-primary-600 ${
        sortState === 'none' ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      onClick={onSort}
      {...props}
    />
  );
};

/**
 * Notification Icon Component
 * Shows notification with count and different states
 */
export const NotificationIcon = ({
  count = 0,
  maxCount = 99,
  showZero = false,
  variant = 'bell',
  size = 'md',
  theme = 'default',
  badgeColor = 'red',
  className = '',
  onClick,
  ...props
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  const shouldShowBadge = count > 0 || (count === 0 && showZero);

  if (shouldShowBadge) {
    return (
      <IconWithBadge
        icon={variant}
        badgeCount={displayCount}
        size={size}
        theme={theme}
        badgeColor={badgeColor}
        className={`cursor-pointer ${className}`}
        onClick={onClick}
        {...props}
      />
    );
  }

  return (
    <Icon
      name={variant}
      size={size}
      theme={theme}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
      {...props}
    />
  );
};

/**
 * Action Icon Group Component
 * Groups related action icons together
 */
export const ActionIconGroup = ({
  actions,
  size = 'sm',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  return (
    <div className={`inline-flex items-center space-x-1 ${className}`} {...props}>
      {actions.map((action, index) => (
        <IconButton
          key={index}
          icon={action.icon}
          size={size}
          variant={variant}
          onClick={action.onClick}
          title={action.title}
          disabled={action.disabled}
          className="p-1"
        />
      ))}
    </div>
  );
};

/**
 * File Type Icon Component
 * Shows appropriate icon based on file type
 */
export const FileTypeIcon = ({
  fileType,
  fileName,
  size = 'md',
  className = '',
  ...props
}) => {
  const getFileIcon = () => {
    const extension = fileName ? fileName.split('.').pop().toLowerCase() : fileType?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { icon: 'document', theme: 'error' };
      case 'docx':
      case 'doc':
        return { icon: 'document', theme: 'info' };
      case 'xlsx':
      case 'xls':
        return { icon: 'table', theme: 'success' };
      case 'csv':
        return { icon: 'table', theme: 'warning' };
      case 'txt':
        return { icon: 'document', theme: 'default' };
      case 'zip':
      case 'rar':
        return { icon: 'archive', theme: 'secondary' };
      default:
        return { icon: 'file', theme: 'default' };
    }
  };

  const { icon, theme } = getFileIcon();

  return (
    <Icon
      name={icon}
      size={size}
      theme={theme}
      className={className}
      {...props}
    />
  );
};

/**
 * Status Indicator Component
 * Shows status with icon and optional text
 */
export const StatusIndicator = ({
  status,
  text,
  size = 'sm',
  showIcon = true,
  showText = true,
  className = '',
  ...props
}) => {
  const statusConfig = {
    active: { icon: 'success-solid', theme: 'success', text: 'Active' },
    inactive: { icon: 'error-solid', theme: 'error', text: 'Inactive' },
    pending: { icon: 'clock', theme: 'warning', text: 'Pending' },
    processing: { icon: 'clock', theme: 'info', text: 'Processing', animated: true },
    completed: { icon: 'success-solid', theme: 'success', text: 'Completed' },
    failed: { icon: 'error-solid', theme: 'error', text: 'Failed' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const displayText = text || config.text;

  return (
    <div className={`inline-flex items-center ${className}`} {...props}>
      {showIcon && (
        config.animated ? (
          <AnimatedIcon
            name={config.icon}
            animation="spin"
            size={size}
            theme={config.theme}
          />
        ) : (
          <Icon
            name={config.icon}
            size={size}
            theme={config.theme}
          />
        )
      )}
      {showText && (
        <span className={`${showIcon ? 'ml-2' : ''} text-sm font-medium text-${config.theme.replace('text-', '')}`}>
          {displayText}
        </span>
      )}
    </div>
  );
};

/**
 * Interactive Rating Component
 * Shows star rating with interactive functionality
 */
export const RatingIcon = ({
  rating = 0,
  maxRating = 5,
  onRate,
  readonly = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readonly && onRate) {
      onRate(index);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`} {...props}>
      {[...Array(maxRating)].map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= (hoverRating || rating);
        
        return (
          <Icon
            key={index}
            name="star"
            size={size}
            theme={isFilled ? 'warning' : 'default'}
            className={`${
              readonly ? '' : 'cursor-pointer hover:scale-110'
            } transition-all duration-200`}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          />
        );
      })}
    </div>
  );
};
