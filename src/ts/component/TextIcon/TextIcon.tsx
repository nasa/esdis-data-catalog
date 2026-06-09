import React from 'react'

interface TextIconProps {
  className?: string;
  field?: string | null;
  iconName: string;
  title: string;
  href?: string;
}

/**
 * Small helper to display text with an icon
 */
export const TextIcon: React.FC<TextIconProps> = ({
  className = '',
  field,
  iconName,
  title,
  href
}) => (field ? (
  <div className={`hzn-text-icon ${className}`}>
    <i className={`hzn-icon hzn-icon-${iconName} hzn-text-icon__icon`} title={title} />
    {
      href
        ? <a className="hzn-text-icon__field" href={href}>{field}</a>
        : <span className="hzn-text-icon__field">{field}</span>
    }
  </div>
) : null)

export default TextIcon
