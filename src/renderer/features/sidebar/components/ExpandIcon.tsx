interface ExpandIconProps {
  isExpanded: boolean;
}

const ExpandIcon = ({ isExpanded }: ExpandIconProps) => {
  return <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>;
};

export default ExpandIcon;
