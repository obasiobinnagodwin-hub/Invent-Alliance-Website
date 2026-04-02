type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "dark" | "light";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-invent-hero text-white",
    dark: "bg-invent-dark text-white",
    light: "bg-white text-[var(--invent-blue-700)]",
  };

  return (
    <button
      {...props}
      className={`${styles[variant]} px-6 py-3 rounded-lg font-medium hover:opacity-90 transition`}
    >
      {children}
    </button>
  );
}