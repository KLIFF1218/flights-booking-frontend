"use client";

type Props = {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant: "next" | "pay";
};

export function BookingActionButton({
  onClick,
  loading,
  disabled,
  variant,
}: Props) {
  const label =
    variant === "next"
      ? loading
        ? "Загрузка..."
        : "Дальше"
      : loading
        ? "Бронирование..."
        : "Перейти к оплате";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        marginTop: 16,
        padding: "14px 16px",
        borderRadius: 12,
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
