interface AlertProps {
  message: string;
  type?: 'success' | 'error';
}

const Alert = ({ message, type = 'success' }: AlertProps) => {
  return <div className={`alert alert--${type}`}>{message}</div>;
};

export default Alert;
