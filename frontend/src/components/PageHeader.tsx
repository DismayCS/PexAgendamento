interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const PageHeader = ({ title, description, actionLabel, onAction }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button className="btn" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
