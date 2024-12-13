interface TextIconProps {
  className?: string;
  field?: string | null;
  iconName: string;
  title: string;
}

/**
 * Small helper to display text with an icon
 */
const TextIcon: React.FC<TextIconProps> = ({
  className = '',
  field,
  iconName,
  title
}) => field ? (
  <div className={`hzn-text-icon ${className}`}>
    <i className={`hzn-icon hzn-icon-${iconName} hzn-text-icon__icon`} title={title} />
    <span className="hzn-text-icon__field">{field}</span>
  </div>
) : null;

export default TextIcon;
