import type { FC, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ tone = 'primary', children, ...rest }) => {
  const className = tone === 'primary' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border';
  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
};
