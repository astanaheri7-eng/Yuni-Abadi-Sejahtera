import React from 'react';

interface LogoYASProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'full';
  customLogoUrl?: string;
  customAppName?: string;
  customTagline?: string;
  shape?: 'rounded' | 'circle' | 'squircle';
  hasBorder?: boolean;
}

export const LogoYAS: React.FC<LogoYASProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'full',
  customLogoUrl,
  customAppName,
  customTagline,
  shape,
  hasBorder,
}) => {
  const sizeMap = {
    sm: { height: 'h-8', text: 'text-sm', sub: 'text-[9px]' },
    md: { height: 'h-10 sm:h-11', text: 'text-sm sm:text-base', sub: 'text-[9px] sm:text-[10px]' },
    lg: { height: 'h-14 sm:h-16', text: 'text-lg sm:text-xl', sub: 'text-xs' },
    xl: { height: 'h-20 sm:h-24', text: 'text-xl sm:text-2xl', sub: 'text-xs sm:text-sm' },
  };

  // Check localStorage if not explicitly passed
  let resolvedLogo = customLogoUrl;
  let resolvedName = customAppName;
  let resolvedTagline = customTagline;
  let resolvedShape = shape;
  let resolvedBorder = hasBorder;

  if (!resolvedLogo || !resolvedName || !resolvedTagline) {
    try {
      const saved = localStorage.getItem('yas_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!resolvedLogo) resolvedLogo = parsed.custom_logo_data || parsed.logo_url;
        if (!resolvedName) resolvedName = parsed.organization_name || parsed.company_name || parsed.app_name;
        if (!resolvedTagline) resolvedTagline = parsed.tagline;
        if (!resolvedShape) resolvedShape = parsed.logo_shape || parsed.app_icon_shape;
        if (resolvedBorder === undefined) resolvedBorder = parsed.logo_border;
      }
    } catch {
      // ignore fallback
    }
  }

  const finalLogo = resolvedLogo || '/logo-yas.svg';
  const finalName = resolvedName || 'YUNI ABADI SEJAHTERA';
  const finalTagline = resolvedTagline || 'Bank Data & Manajemen Kepegawaian';

  const shapeClass =
    resolvedShape === 'circle'
      ? 'rounded-full'
      : resolvedShape === 'squircle'
      ? 'rounded-2xl'
      : 'rounded-lg';

  const borderClass = resolvedBorder ? 'ring-2 ring-amber-400/40 p-0.5 bg-white/10' : '';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <img
        src={finalLogo}
        alt={`${finalName} Logo`}
        className={`${sizeMap[size].height} w-auto object-contain transition-transform duration-300 hover:scale-105 filter drop-shadow-sm ${shapeClass} ${borderClass}`}
        onError={(e) => {
          // Fallback to default if custom image fails
          (e.target as HTMLImageElement).src = '/logo-yas.svg';
        }}
      />
      {showSubtitle && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-black tracking-wider uppercase truncate ${
              variant === 'light' ? 'text-white' : 'text-slate-900'
            } ${sizeMap[size].text}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {finalName}
          </span>
          <span
            className={`font-semibold tracking-wide truncate ${
              variant === 'light' ? 'text-amber-300' : 'text-amber-600'
            } ${sizeMap[size].sub}`}
          >
            {finalTagline}
          </span>
        </div>
      )}
    </div>
  );
};

